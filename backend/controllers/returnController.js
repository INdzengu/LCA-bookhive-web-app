// backend/controllers/returnController.js

import { pool } from "../config/db.js";

/*
 * Buyer creates a return request
 */
export const createReturnRequest = async (req, res) => {
  const buyerId = req.user.user_id;
  const { order_id, reason } = req.body;

  if (!order_id || !reason || reason.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Order ID and return reason are required.",
    });
  }

  try {
    // Make sure the order belongs to this buyer
    const [orders] = await pool.query(
      `SELECT
        order_id,
        buyer_id,
        product_id,
        status_id
       FROM orders
       WHERE order_id = ?
       AND buyer_id = ?`,
      [order_id, buyerId],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const order = orders[0];

    // Only completed orders can be returned
    if (order.status_id !== 2) {
      return res.status(400).json({
        success: false,
        message: "Only completed orders can be returned.",
      });
    }

    // Check whether a return already exists
    const [existingReturns] = await pool.query(
      `SELECT return_id, status
       FROM returns
       WHERE order_id = ?`,
      [order_id],
    );

    if (existingReturns.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A return request already exists for this order.",
      });
    }

    // Create return request
    const [result] = await pool.query(
      `INSERT INTO returns
       (
         order_id,
         buyer_id,
         product_id,
         reason,
         status
       )
       VALUES (?, ?, ?, ?, 'Pending')`,
      [order.order_id, buyerId, order.product_id, reason.trim()],
    );

    res.status(201).json({
      success: true,
      message: "Return request submitted successfully.",
      return_id: result.insertId,
    });
  } catch (error) {
    console.error("Create Return Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Buyer views their own return requests
 */
export const getMyReturns = async (req, res) => {
  const buyerId = req.user.user_id;

  try {
    const [rows] = await pool.query(
      `SELECT
        r.return_id,
        r.order_id,
        r.product_id,
        p.title,
        p.author,
        p.price,
        r.reason,
        r.status,
        r.requested_at,
        r.reviewed_at
       FROM returns r
       JOIN products p
         ON r.product_id = p.product_id
       WHERE r.buyer_id = ?
       ORDER BY r.requested_at DESC`,
      [buyerId],
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get My Returns Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Admin views all return requests
 */
export const getAllReturns = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        r.return_id,
        r.order_id,
        r.product_id,
        r.buyer_id,
        u.full_name AS buyer_name,
        u.email AS buyer_email,
        p.title,
        p.author,
        p.price,
        r.reason,
        r.status,
        r.requested_at,
        r.reviewed_at,
        reviewer.full_name AS reviewer_name
       FROM returns r
       JOIN users u
         ON r.buyer_id = u.user_id
       JOIN products p
         ON r.product_id = p.product_id
       LEFT JOIN users reviewer
         ON r.reviewed_by = reviewer.user_id
       ORDER BY r.requested_at DESC`,
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get All Returns Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Admin approves a return
 */
export const approveReturn = async (req, res) => {
  const adminId = req.user.user_id;
  const { returnId } = req.params;

  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // Get return request
    const [returnRows] = await connection.query(
      `SELECT
        return_id,
        order_id,
        product_id,
        status
       FROM returns
       WHERE return_id = ?
       FOR UPDATE`,
      [returnId],
    );

    if (returnRows.length === 0) {
      throw new Error("Return request not found.");
    }

    const returnRequest = returnRows[0];

    if (returnRequest.status !== "Pending") {
      throw new Error("This return request has already been reviewed.");
    }

    // Approve return
    await connection.query(
      `UPDATE returns
       SET
         status = 'Approved',
         reviewed_at = NOW(),
         reviewed_by = ?
       WHERE return_id = ?`,
      [adminId, returnId],
    );

    // Make product available again
    await connection.query(
      `UPDATE products
       SET is_available = 1
       WHERE product_id = ?`,
      [returnRequest.product_id],
    );

    // Mark order as cancelled/returned
    // status_id 3 = Cancelled
    await connection.query(
      `UPDATE orders
       SET status_id = 3
       WHERE order_id = ?`,
      [returnRequest.order_id],
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Return approved successfully.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Approve Return Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/*
 * Admin rejects a return
 */
export const rejectReturn = async (req, res) => {
  const adminId = req.user.user_id;
  const { returnId } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE returns
       SET
         status = 'Rejected',
         reviewed_at = NOW(),
         reviewed_by = ?
       WHERE return_id = ?
       AND status = 'Pending'`,
      [adminId, returnId],
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Return request not found or already reviewed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Return request rejected.",
    });
  } catch (error) {
    console.error("Reject Return Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
