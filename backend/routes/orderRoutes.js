import express from "express";

import { checkoutCart, getMyOrders } from "../controllers/orderController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Checkout cart
router.post("/checkout", verifyToken, checkoutCart);

// Get logged-in user's orders
router.get("/my", verifyToken, getMyOrders);

export default router;
