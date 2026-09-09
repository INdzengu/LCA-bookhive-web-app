/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 * This file contains middleware functions for JWT authentication
 *
 * Purpose: Verify JWT tokens and protect routes that require login
 * Middleware runs before the route handler to check if user is authenticated
 
 */

import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

/**
 * ============================================
 * MIDDLEWARE: verifyToken
 * ============================================
 *
 * Purpose:
 * - Extract JWT token from Authorization header
 * - Verify the token is valid and not expired
 * - Fetch user data from database
 * - Attach user info to request object
 * - Allow route handler to proceed if token is valid
 * - Deny access if token is missing, invalid, or expired
 *
 * Token Format: "Bearer <jwt_token>"
 * Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 * Flow:
 * 1. Client sends request with Authorization header
 * 2. This middleware extracts the token
 * 3. Verifies token signature and expiry
 * 4. Queries database for user data
 * 5. Attaches user to request (req.user)
 * 6. Route handler can now access user info
 */
export const verifyToken = async (req, res, next) => {
  /**
   * Extract Authorization header from request
   * Example header: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  const authHeader = req.headers.authorization;

  /**
   * ============================================
   * STEP 1: Check if Authorization header exists and starts with "Bearer "
   * ============================================
   * If not, return 401 Unauthorized error
   */
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token missing.",
    });
  }

  /**
   * ============================================
   * STEP 2: Extract the token from the header
   * ============================================
   * Remove "Bearer " prefix to get just the token string
   *
   * Example:
   *   authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *   token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  const token = authHeader.split(" ")[1];

  try {
    /**
     * ============================================
     * STEP 3: VERIFY TOKEN SIGNATURE AND EXPIRY
     * ============================================
     * jwt.verify() does 3 things:
     * 1. Verifies the token signature (ensures it hasn't been tampered with)
     * 2. Checks if token is expired
     * 3. Decodes the token to extract payload data
     *
     * If verification fails, an error is thrown and caught in the catch block
     *
     * decoded contains the data we stored when creating the token:
     *   - user_id: The ID of the user who logged in
     *   - iat: Issued at timestamp
     *   - exp: Expiration timestamp
     */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "bookhive_secret_key",
    );

    /**
     * ============================================
     * STEP 4: FETCH USER DATA FROM DATABASE
     * ============================================
     * Now that we know the token is valid, we fetch the current user info
     * This ensures the user still exists and gets their latest role info
     *
     * Query: Join users with roles table to get both user data AND role name
     *   SELECT user_id, email, full_name, role_id, role_name
     *   FROM users u
     *   INNER JOIN roles r ON u.role_id = r.role_id
     *   WHERE u.user_id = ?
     *
     * INNER JOIN ensures only users with valid roles are returned
     */
    const [rows] = await pool.query(
      `SELECT
        u.user_id,
        u.email,
        u.full_name,
        u.role_id,
        r.role_name
       FROM users u
       INNER JOIN roles r
         ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [decoded.user_id], // Use user_id from the decoded token
    );

    /**
     * ============================================
     * STEP 5: CHECK IF USER STILL EXISTS
     * ============================================
     * If database query returns no rows, the user has been deleted
     * Return 401 Unauthorized error
     */
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists.",
      });
    }

    /**
     * ============================================
     * STEP 6: ATTACH USER DATA TO REQUEST OBJECT
     * ============================================
     * Store the user data so the route handler can access it
     * The route handler can now use: req.user.user_id, req.user.email, etc.
     *
     * Example in route handler:
     *   const userId = req.user.user_id;
     *   const userRole = req.user.role_name;
     */
    req.user = rows[0];

    /**
     * ============================================
     * STEP 7: CALL next() TO PROCEED
     * ============================================
     * Pass control to the next middleware or route handler
     * If we don't call next(), the route handler never runs
     */
    next();
  } catch (err) {
    /**
     * ============================================
     * ERROR HANDLING
     * ============================================
     * This catch block handles:
     * 1. Token signature verification failed (token was tampered with)
     * 2. Token is expired (user needs to login again)
     * 3. Database connection error
     * 4. Any other JWT-related error
     */
    console.error("Authentication error:", err);

    /**
     * Return 403 Forbidden error
     * 403 means the user might be authenticated but not allowed
     * 401 would mean not authenticated at all
     */
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
