// backend/routes/reviewRoutes.js

import express from "express";

import {
  createReview,
  getMyReviews,
  getReviewableTransactions,
  getAllReviews,
} from "../controllers/reviewController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==============================
// BUYER ROUTES
// ==============================

// Get purchases that can still be reviewed
router.get("/reviewable", verifyToken, getReviewableTransactions);

// Get reviews written by logged-in buyer
router.get("/my", verifyToken, getMyReviews);

// Submit a review
router.post("/", verifyToken, createReview);

// ==============================
// ADMIN ROUTES
// ==============================

// Admin can view all reviews
router.get("/admin", verifyToken, requireAdmin, getAllReviews);

export default router;
