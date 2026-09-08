import express from "express";
import {
  fetchProducts,
  fetchProductById,
} from "../controllers/productController.js";
import { addProduct } from "../controllers/productController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Ensure you have JWT verification middleware
const router = express.Router();

router.get("/", fetchProducts);
router.get("/:id", fetchProductById); // Parametric route for single book
// Protected route — requires valid token
router.post("/", verifyToken, addProduct);
export default router;
