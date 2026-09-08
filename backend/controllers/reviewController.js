// backend/controllers/reviewController.js

import { pool } from "../config/db.js";

/*
 * Create a review for a completed transaction
 */
export const createReview = async (req, res) => {
  const reviewerId = req.user.user_id;
  const { transaction_id, rating, comment } = req.body;

  try {
    // Validate required fields
    if (!transaction_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID and rating are required.",
      });
    }

    const numericRating = Number(rating);

    // Rating must be between 1 and 5
    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5.",
      });
    }

    // Find the transaction and make sure it belongs to this buyer
    const [transactionRows] = await pool.query(
      `SELECT
        t.transaction_id,
        t.order_id,
        t.seller_id,
        t.buyer_id,
        o.status_id,
        p.title
       FROM transactions t
       JOIN orders o
         ON t.order_id = o.order_id
       JOIN products p
         ON o.product_id = p.product_id
       WHERE t.transaction_id = ?
       AND t.buyer_id = ?`,
      [transaction_id, reviewerId],
    );

    if (transactionRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or does not belong to you.",
      });
    }

    const transaction = transactionRows[0];

    // Only completed orders can be reviewed
    if (transaction.status_id !== 2) {
      return res.status(400).json({
        success: false,
        message: "You can only review completed purchases.",
      });
    }

    // Prevent duplicate reviews
    const [existingReviews] = await pool.query(
      `SELECT review_id
       FROM reviews
       WHERE transaction_id = ?`,
      [transaction_id],
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this purchase.",
      });
    }

    // Insert review
    const [result] = await pool.query(
      `INSERT INTO reviews
       (
         transaction_id,
         reviewer_id,
         reviewee_id,
         rating,
         comment
       )
       VALUES (?, ?, ?, ?, ?)`,
      [
        transaction_id,
        reviewerId,
        transaction.seller_id,
        numericRating,
        comment?.trim() || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review_id: result.insertId,
    });
  } catch (error) {
    console.error("Create Review Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Get reviews written by the logged-in buyer
 */
export const getMyReviews = async (req, res) => {
  const reviewerId = req.user.user_id;

  try {
    const [rows] = await pool.query(
      `SELECT
        r.review_id,
        r.transaction_id,
        r.rating,
        r.comment,
        r.created_at,
        p.title,
        p.author,
        seller.full_name AS seller_name
       FROM reviews r
       JOIN transactions t
         ON r.transaction_id = t.transaction_id
       JOIN orders o
         ON t.order_id = o.order_id
       JOIN products p
         ON o.product_id = p.product_id
       JOIN users seller
         ON r.reviewee_id = seller.user_id
       WHERE r.reviewer_id = ?
       ORDER BY r.created_at DESC`,
      [reviewerId],
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get My Reviews Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Get transactions that the buyer can still review
 */
export const getReviewableTransactions = async (req, res) => {
  const buyerId = req.user.user_id;

  try {
    const [rows] = await pool.query(
      `SELECT
        t.transaction_id,
        t.order_id,
        o.product_id,
        p.title,
        p.author,
        p.price,
        seller.full_name AS seller_name,
        t.completed_at
       FROM transactions t
       JOIN orders o
         ON t.order_id = o.order_id
       JOIN products p
         ON o.product_id = p.product_id
       JOIN users seller
         ON t.seller_id = seller.user_id
       LEFT JOIN reviews r
         ON t.transaction_id = r.transaction_id
       WHERE t.buyer_id = ?
       AND r.review_id IS NULL
       ORDER BY t.completed_at DESC`,
      [buyerId],
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get Reviewable Transactions Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Admin gets all reviews
 */
export const getAllReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        r.review_id,
        r.transaction_id,
        r.rating,
        r.comment,
        r.created_at,

        buyer.full_name AS buyer_name,
        buyer.email AS buyer_email,

        seller.full_name AS seller_name,

        p.product_id,
        p.title,
        p.author

       FROM reviews r

       JOIN transactions t
         ON r.transaction_id = t.transaction_id

       JOIN users buyer
         ON r.reviewer_id = buyer.user_id

       JOIN users seller
         ON r.reviewee_id = seller.user_id

       JOIN orders o
         ON t.order_id = o.order_id

       JOIN products p
         ON o.product_id = p.product_id

       ORDER BY r.created_at DESC`,
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get All Reviews Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
