// backend/controllers/paymentController.js

import { pool } from "../config/db.js";

// ============================================
// INITIATE PAYFAST PAYMENT
// ============================================
export const initiatePayFastPayment = async (req, res) => {
  try {
    const { paymentReference, amount, item_name } = req.body;
    const buyer = req.user;

    // Make sure payment reference was provided
    if (!paymentReference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required.",
      });
    }

    // Make sure amount was provided
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid payment amount is required.",
      });
    }

    const merchant_id = process.env.PAYFAST_MERCHANT_ID || "10000100";

    const merchant_key = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a";

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

    const return_url = `${frontendUrl}/cart?payment=success`;

    const cancel_url = `${frontendUrl}/cart?payment=cancelled`;

    const notify_url = `${backendUrl}/api/payments/payfast-notify`;

    console.log("====================================");
    console.log("PAYFAST PAYMENT INITIATION");
    console.log("Payment Reference:", paymentReference);
    console.log("Amount:", Number(amount).toFixed(2));
    console.log("Notify URL:", notify_url);
    console.log("====================================");

    const payfastData = {
      merchant_id,
      merchant_key,

      return_url,
      cancel_url,
      notify_url,

      name_first: buyer?.full_name || "Student User",

      email_address: buyer?.email || "student@example.ac.za",

      // IMPORTANT:
      // The payment reference represents the
      // entire cart payment.
      m_payment_id: paymentReference,

      // This is the COMPLETE cart amount,
      // including the 5% platform fees.
      amount: Number(amount).toFixed(2),

      item_name: item_name || `BookHive Purchase ${paymentReference}`,
    };

    const payfastUrl = "https://sandbox.payfast.co.za/eng/process";

    res.status(200).json({
      success: true,
      payfastUrl,
      paymentData: payfastData,
    });
  } catch (error) {
    console.error("PayFast Initiation Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// PAYFAST ITN HANDLER
// ============================================
export const handlePayFastNotify = async (req, res) => {
  let connection;

  try {
    const pfData = req.body;

    console.log("====================================");
    console.log("PAYFAST ITN RECEIVED");
    console.log("BODY:", pfData);
    console.log("====================================");

    // Make sure PayFast actually sent data
    if (!pfData || Object.keys(pfData).length === 0) {
      return res.status(400).send("Empty ITN");
    }

    // Only process completed payments
    if (pfData.payment_status !== "COMPLETE") {
      console.log(
        `Ignored ITN notification. Status received: ${pfData.payment_status}`,
      );

      return res.status(200).send("OK");
    }

    // --------------------------------------------
    // Get the shared payment reference
    // --------------------------------------------
    const paymentReference = pfData.m_payment_id;

    if (!paymentReference) {
      throw new Error("PayFast payment reference is missing.");
    }

    console.log("Payment Reference:", paymentReference);

    connection = await pool.getConnection();

    await connection.beginTransaction();

    // --------------------------------------------
    // Find ALL orders belonging to this payment
    // --------------------------------------------
    const [orderRows] = await connection.query(
      `SELECT
        order_id,
        buyer_id,
        product_id,
        status_id,
        total_amount
       FROM orders
       WHERE payment_reference = ?
       FOR UPDATE`,
      [paymentReference],
    );

    if (orderRows.length === 0) {
      throw new Error(
        `No orders found for payment reference ${paymentReference}.`,
      );
    }

    console.log(
      `Found ${orderRows.length} order(s) for payment ${paymentReference}`,
    );

    // --------------------------------------------
    // Calculate expected PayFast amount
    // --------------------------------------------
    const expectedAmount = orderRows.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0,
    );

    const receivedAmount = Number(pfData.amount_gross);

    console.log(`Expected PayFast amount: R${expectedAmount.toFixed(2)}`);

    console.log(`Received PayFast amount: R${receivedAmount.toFixed(2)}`);

    // --------------------------------------------
    // Verify payment amount
    // --------------------------------------------
    if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
      throw new Error(
        `Payment amount mismatch. Expected R${expectedAmount.toFixed(
          2,
        )}, received R${receivedAmount.toFixed(2)}.`,
      );
    }

    // --------------------------------------------
    // Process every order in the cart
    // --------------------------------------------
    for (const order of orderRows) {
      console.log(`Processing Order #${order.order_id}`);

      // ------------------------------------------
      // Mark order as COMPLETED
      // status_id = 2
      // ------------------------------------------
      await connection.query(
        `UPDATE orders
         SET status_id = 2
         WHERE order_id = ?`,
        [order.order_id],
      );

      console.log(`Order #${order.order_id} marked as completed.`);

      // ------------------------------------------
      // Mark product as unavailable
      // ------------------------------------------
      await connection.query(
        `UPDATE products
         SET is_available = 0
         WHERE product_id = ?`,
        [order.product_id],
      );

      console.log(`Product #${order.product_id} marked unavailable.`);

      // ------------------------------------------
      // Get seller ID
      // ------------------------------------------
      const [productRows] = await connection.query(
        `SELECT seller_id
           FROM products
           WHERE product_id = ?`,
        [order.product_id],
      );

      if (productRows.length === 0) {
        throw new Error(`Product #${order.product_id} does not exist.`);
      }

      const sellerId = productRows[0].seller_id;

      // ------------------------------------------
      // Create transaction
      // ------------------------------------------
      await connection.query(
        `INSERT INTO transactions
        (
          order_id,
          seller_id,
          buyer_id,
          completed_at
        )
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          completed_at = NOW()`,
        [order.order_id, sellerId, order.buyer_id],
      );

      console.log(`Transaction created for Order #${order.order_id}.`);
    }

    // --------------------------------------------
    // Commit EVERYTHING
    // --------------------------------------------
    await connection.commit();

    console.log("====================================");
    console.log(`SUCCESS: Payment ${paymentReference} completed.`);
    console.log(`Processed ${orderRows.length} order(s).`);
    console.log("====================================");

    // PayFast needs a successful response
    res.status(200).send("OK");
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("ITN Database Execution Error:", error.message);

    res.status(500).send("ITN Processing Error");
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
