// backend/controllers/orderController.js

import { pool } from "../config/db.js";
import crypto from "crypto";

export const checkoutCart = async (req, res) => {
  const buyer_id = req.user.user_id;
  const { items } = req.body;

  // ============================================
  // VALIDATE CART
  // ============================================
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty.",
    });
  }

  let connection;

  try {
    // ============================================
    // GET DATABASE CONNECTION
    // ============================================
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // ============================================
    // ONE PAYMENT REFERENCE FOR THE ENTIRE CART
    // ============================================
    const paymentReference = `PAY-${crypto.randomUUID()}`;

    const createdOrderIds = [];

    // ============================================
    // CART TOTALS
    // ============================================
    let itemsTotal = 0;
    let platformFeeTotal = 0;
    let cartTotal = 0;

    // ============================================
    // PROCESS EVERY BOOK IN THE CART
    // ============================================
    for (const item of items) {
      // ------------------------------------------
      // Get the REAL product information from MySQL
      // ------------------------------------------
      const [productRows] = await connection.query(
        `SELECT
          product_id,
          seller_id,
          title,
          price,
          is_available
         FROM products
         WHERE product_id = ?`,
        [item.product_id],
      );

      // Product does not exist
      if (productRows.length === 0) {
        throw new Error(`Product ${item.product_id} does not exist.`);
      }

      const product = productRows[0];

      // ------------------------------------------
      // Make sure the book is still available
      // ------------------------------------------
      if (!product.is_available) {
        throw new Error(`The book "${product.title}" is no longer available.`);
      }

      // ------------------------------------------
      // ALWAYS use the price from MySQL
      // Do not trust the frontend price
      // ------------------------------------------
      const itemPrice = Number(product.price);

      // ------------------------------------------
      // Calculate 5% platform fee
      // ------------------------------------------
      const platformFee = Number((itemPrice * 0.05).toFixed(2));

      // ------------------------------------------
      // Calculate total for this book
      // ------------------------------------------
      const totalAmount = Number((itemPrice + platformFee).toFixed(2));

      // ------------------------------------------
      // Add to cart totals
      // ------------------------------------------
      itemsTotal += itemPrice;
      platformFeeTotal += platformFee;
      cartTotal += totalAmount;

      // ------------------------------------------
      // Create order
      // status_id = 1 = Pending
      // ------------------------------------------
      const [orderResult] = await connection.query(
        `INSERT INTO orders
        (
          payment_reference,
          buyer_id,
          product_id,
          status_id,
          item_price,
          platform_fee,
          total_amount,
          created_at
        )
        VALUES (?, ?, ?, 1, ?, ?, ?, NOW())`,
        [
          paymentReference,
          buyer_id,
          product.product_id,
          itemPrice,
          platformFee,
          totalAmount,
        ],
      );

      createdOrderIds.push(orderResult.insertId);
    }

    // ============================================
    // ROUND TOTALS
    // ============================================
    itemsTotal = Number(itemsTotal.toFixed(2));

    platformFeeTotal = Number(platformFeeTotal.toFixed(2));

    cartTotal = Number(cartTotal.toFixed(2));

    // ============================================
    // COMMIT ALL ORDERS
    // ============================================
    await connection.commit();

    // ============================================
    // SEND RESPONSE TO FRONTEND
    // ============================================
    res.status(201).json({
      success: true,

      message: "Orders placed successfully!",

      // All orders created for this cart
      orderIds: createdOrderIds,

      // One reference shared by all orders
      paymentReference,

      // Price of books before platform fee
      itemsTotal: itemsTotal.toFixed(2),

      // Total 5% platform fee
      platformFee: platformFeeTotal.toFixed(2),

      // Final amount that must be paid to PayFast
      totalAmount: cartTotal.toFixed(2),
    });
  } catch (error) {
    // ============================================
    // ROLLBACK IF ANYTHING FAILS
    // ============================================
    if (connection) {
      await connection.rollback();
    }

    console.error("Checkout DB Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    // ============================================
    // RELEASE DATABASE CONNECTION
    // ============================================
    if (connection) {
      connection.release();
    }
  }
};
export const getMyOrders = async (req, res) => {
  const buyerId = req.user.user_id;

  try {
    const [orders] = await pool.query(
      `SELECT
        o.order_id,
        o.payment_reference,
        o.buyer_id,
        o.product_id,
        o.status_id,
        o.item_price,
        o.platform_fee,
        o.total_amount,
        o.created_at,
        p.title,
        p.author
       FROM orders o
       INNER JOIN products p
         ON o.product_id = p.product_id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC`,
      [buyerId],
    );

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load your orders.",
    });
  }
};
