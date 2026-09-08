import { pool } from "../config/db.js";

// Fetch all available books with seller, condition, and category details
export const getAllProducts = async () => {
  const [rows] = await pool.query(`
    SELECT p.*, c.category_name, cond.condition_name, u.full_name AS seller_name
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    JOIN conditions cond ON p.condition_id = cond.condition_id
    JOIN users u ON p.seller_id = u.user_id
    WHERE p.is_available = TRUE
  `);
  return rows;
};

// Fetch books filtered by a specific category
export const getProductsByCategory = async (categoryId) => {
  const [rows] = await pool.query(
    `
    SELECT p.*, c.category_name, cond.condition_name, u.full_name AS seller_name
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    JOIN conditions cond ON p.condition_id = cond.condition_id
    JOIN users u ON p.seller_id = u.user_id
    WHERE p.is_available = TRUE AND p.category_id = ?
  `,
    [categoryId],
  );
  return rows;
};
// Fetch a single book by ID with seller, condition, and category details
export const getProductById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT p.*, c.category_name, cond.condition_name, u.full_name AS seller_name, u.email AS seller_email
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    JOIN conditions cond ON p.condition_id = cond.condition_id
    JOIN users u ON p.seller_id = u.user_id
    WHERE p.product_id = ?
  `,
    [id],
  );

  return rows[0]; // Return the single product object (or undefined if not found)
};
export const createProduct = async (productData) => {
  const {
    seller_id,
    category_id,
    condition_id,
    title,
    author,
    course_code,
    price,
    is_available,
  } = productData;

  const [result] = await pool.query(
    `INSERT INTO products 
      (seller_id, category_id, condition_id, title, author, course_code, price, is_available) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      seller_id,
      category_id,
      condition_id,
      title,
      author,
      course_code || null,
      price,
      is_available !== undefined ? is_available : 1,
    ],
  );

  return result.insertId;
};
