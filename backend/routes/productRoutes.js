/**
 * ============================================
 * PRODUCT ROUTES
 * ============================================
 * This file defines all product-related API endpoints
 * Routes: GET /api/products, GET /api/products/:id, POST /api/products
 *
 * Purpose: Handle browsing books, viewing book details, and creating new listings
 */

import express from "express";
import {
  fetchProducts, // Function to get all products
  fetchProductById, // Function to get a single product
  addProduct, // Function to create a new product listing
} from "../controllers/productController.js";

/**
 * Import authentication middleware
 * This middleware verifies JWT tokens and protects routes that require login
 */
import { verifyToken } from "../middleware/authMiddleware.js";

/**
 * Create an Express Router instance
 * This router handles all product endpoints
 */
const router = express.Router();

/**
 * ============================================
 * ROUTE: GET /api/products
 * ============================================
 * Purpose: Retrieve all products (books) from the database
 *
 * Query Parameters (optional):
 *   - category_id: Filter by category
 *   - condition_id: Filter by condition (Like New, Good, Fair, Poor)
 *   - min_price: Minimum price filter
 *   - max_price: Maximum price filter
 *   - search: Search by title or author
 *
 * Response: Array of all available products
 *
 * Security: PUBLIC - No authentication required
 */
router.get("/", fetchProducts);

/**
 * ============================================
 * ROUTE: GET /api/products/:id
 * ============================================
 * Purpose: Retrieve a single product by its ID
 *
 * URL Parameters:
 *   - id: Product ID (book ID)
 *
 * Response: Single product object with all details
 *   - product_id, title, author, price, condition, seller info, reviews, etc.
 *
 * Security: PUBLIC - No authentication required
 */
router.get("/:id", fetchProductById);

/**
 * ============================================
 * ROUTE: POST /api/products
 * ============================================
 * Purpose: Create a new product listing (seller listing a book for sale)
 *
 * Request Body:
 *   - title: Book title (string)
 *   - author: Book author (string)
 *   - category_id: Category ID (integer)
 *   - condition_id: Condition ID (integer)
 *   - price: Selling price (decimal)
 *   - course_code: Course code (optional, for textbooks)
 *
 * Response: Newly created product object with ID
 *
 * Security: PROTECTED - Requires valid JWT token
 * - User must be logged in (verified by verifyToken middleware)
 * - seller_id is automatically set to the logged-in user's ID
 * - Prevents unauthorized users from creating listings
 */
router.post("/", verifyToken, addProduct);

/**
 * Export the router so it can be used in server.js
 */
export default router;
