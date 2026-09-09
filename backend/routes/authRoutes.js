/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 * This file defines all authentication-related API endpoints
 * Routes: POST /api/auth/register, POST /api/auth/login
 *
 * Purpose: Handle user registration and login functionality
 */

import express from "express";
import { register, login } from "../controllers/authController.js";

/**
 * Create an Express Router instance
 * This router handles all authentication endpoints
 */
const router = express.Router();

/**
 * ============================================
 * ROUTE: POST /api/auth/register
 * ============================================
 * Purpose: Create a new user account
 *
 * Request Body:
 *   - full_name: User's full name (string)
 *   - email: User's email address (string, must be unique)
 *   - password: User's password (string, will be hashed)
 *
 * Response:
 *   - success: boolean indicating if registration was successful
 *   - message: descriptive message or error
 *   - user: newly created user object (if successful)
 *
 * Security: Passwords are hashed using bcryptjs before storage
 */
router.post("/register", register);

/**
 * ============================================
 * ROUTE: POST /api/auth/login
 * ============================================
 * Purpose: Authenticate a user and generate JWT token
 *
 * Request Body:
 *   - email: User's email address
 *   - password: User's password
 *
 * Response:
 *   - success: boolean indicating if login was successful
 *   - message: descriptive message or error
 *   - token: JWT token (if successful) - used for subsequent authenticated requests
 *   - user: user object (if successful)
 *
 * Security:
 *   - Password is compared with stored hash (never stored in plain text)
 *   - JWT token is generated with expiry (typically 24 hours)
 */
router.post("/login", login);

/**
 * Export the router so it can be used in server.js
 */
export default router;
