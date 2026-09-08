// backend/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check that the Authorization header exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token missing.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ==========================================
    // VERIFY TOKEN
    // ==========================================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "bookhive_secret_key",
    );

    // ==========================================
    // GET USER INCLUDING ROLE
    // ==========================================
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
      [decoded.user_id],
    );

    // User no longer exists
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists.",
      });
    }

    // ==========================================
    // ATTACH USER TO REQUEST
    // ==========================================
    req.user = rows[0];

    next();
  } catch (err) {
    console.error("Authentication error:", err);

    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
