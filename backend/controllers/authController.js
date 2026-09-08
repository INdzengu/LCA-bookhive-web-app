// backend/controllers/authController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../models/userModel.js";

// ============================================
// REGISTER
// ============================================
export const register = async (req, res) => {
  try {
    const { full_name, firstName, surname, email, password } = req.body;

    // Support either:
    // 1. full_name
    // OR
    // 2. firstName + surname
    const nameToStore =
      full_name || `${firstName || ""} ${surname || ""}`.trim();

    // Validate required fields
    if (!nameToStore || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // Check whether email already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================
    const salt = await bcrypt.genSalt(10);

    const password_hash = await bcrypt.hash(password, salt);

    // ==========================================
    // CREATE USER
    // ==========================================
    const userId = await createUser({
      full_name: nameToStore,
      email,
      password_hash,
    });

    // ==========================================
    // CREATE JWT TOKEN
    // ==========================================
    const token = jwt.sign(
      {
        user_id: userId,
        email: email,
      },
      process.env.JWT_SECRET || "bookhive_secret_key",
      {
        expiresIn: "30d",
      },
    );

    // ==========================================
    // SEND RESPONSE
    // ==========================================
    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        user_id: userId,
        full_name: nameToStore,
        email,
        role_id: 1,
        role_name: "Student",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// LOGIN
// ============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find user
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ==========================================
    // CHECK PASSWORD
    // ==========================================
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ==========================================
    // CREATE JWT TOKEN
    // ==========================================
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
      },
      process.env.JWT_SECRET || "bookhive_secret_key",
      {
        expiresIn: "30d",
      },
    );

    // ==========================================
    // SEND RESPONSE
    // ==========================================
    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_id === 2 ? "Admin" : "Student",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
