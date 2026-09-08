// backend/models/orderModel.js
import { pool } from "../config/db.js";

export const createOrderTransaction = async (buyerId, productId, itemPrice) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Calculate platform fee (5% fee example matching your database seed)
    const platformFee = Number((itemPrice * 0.05).toFixed(2));
    const totalAmount = Number((itemPrice + platformFee).toFixed(2));

    // 2. Insert into orders table (Status 2 = 'Completed' or 1 = 'Pending')
    const [orderResult] = await connection.query(
      `INSERT INTO orders (buyer_id, product_id, status_id, item_price, platform_fee, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [buyerId, productId, 2, itemPrice, platformFee, totalAmount],
    );

    const orderId = orderResult.insertId;

    // 3. Mark the product as no longer available
    await connection.query(
      `UPDATE products SET is_available = FALSE WHERE product_id = ?`,
      [productId],
    );

    // 4. Record transaction record for seller and buyer
    const [productRows] = await connection.query(
      `SELECT seller_id FROM products WHERE product_id = ?`,
      [productId],
    );
    const sellerId = productRows[0].seller_id;

    await connection.query(
      `INSERT INTO transactions (order_id, seller_id, buyer_id) VALUES (?, ?, ?)`,
      [orderId, sellerId, buyerId],
    );

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
