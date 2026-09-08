// backend/routes/paymentRoutes.js
import express from "express";
import {
  initiatePayFastPayment,
  handlePayFastNotify,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/payfast/initiate", verifyToken, initiatePayFastPayment);
router.post("/payfast-notify", handlePayFastNotify);

export default router;
