// backend/routes/returnRoutes.js

import express from "express";

import {
  createReturnRequest,
  getMyReturns,
  getAllReturns,
  approveReturn,
  rejectReturn,
} from "../controllers/returnController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==============================
// BUYER ROUTES
// ==============================

// Submit return request
router.post("/", verifyToken, createReturnRequest);

// View my return requests
router.get("/my", verifyToken, getMyReturns);

// ==============================
// ADMIN ROUTES
// ==============================

// View all returns
router.get("/admin", verifyToken, requireAdmin, getAllReturns);

// Approve return
router.put(
  "/admin/:returnId/approve",
  verifyToken,
  requireAdmin,
  approveReturn,
);

// Reject return
router.put("/admin/:returnId/reject", verifyToken, requireAdmin, rejectReturn);

export default router;
