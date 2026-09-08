import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
} from "../models/productModel.js";

export const fetchProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;
    let products;

    if (categoryId) {
      products = await getProductsByCategory(categoryId);
    } else {
      products = await getAllProducts();
    }

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const fetchProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
import { createProduct } from "../models/productModel.js";

export const addProduct = async (req, res) => {
  try {
    const seller_id = req.user.user_id;
    const {
      title,
      author,
      price,
      category_id,
      condition_id,
      course_code,
      is_available,
    } = req.body;

    if (!title || !price || !category_id || !condition_id) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please fill in all required fields.",
        });
    }

    const productId = await createProduct({
      seller_id,
      category_id,
      condition_id,
      title,
      author,
      course_code,
      price,
      is_available,
    });

    res
      .status(201)
      .json({ success: true, message: "Book listed successfully!", productId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
