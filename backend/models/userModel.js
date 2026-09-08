// backend/models/userModel.js

import { pool } from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT
      user_id,
      role_id,
      full_name,
      email,
      password_hash
     FROM users
     WHERE email = ?`,
    [email],
  );

  return rows[0];
};

export const createUser = async ({ full_name, email, password_hash }) => {
  const [result] = await pool.query(
    `INSERT INTO users
      (full_name, email, password_hash)
     VALUES (?, ?, ?)`,
    [full_name, email, password_hash],
  );

  return result.insertId;
};
