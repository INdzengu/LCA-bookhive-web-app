import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import { pool } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/reviews", reviewRoutes);

// Basic Health Check Route
app.get("/", (req, res) => {
  res.send({ status: "BookHive API Server Running" });
});
// REQUIRED for PayFast ITN: Parses application/x-www-form-urlencoded payloads sent by PayFast
app.use(express.urlencoded({ extended: true }));

app.use("/api/payments", paymentRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
