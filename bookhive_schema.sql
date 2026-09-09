CREATE DATABASE IF NOT EXISTS bookhive_db;
USE bookhive_db;

-- 1. Roles Table
CREATE TABLE roles (
    role_id INT(11) NOT NULL AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (role_id)
);

-- 2. Users Table
CREATE TABLE users (
    user_id INT(11) NOT NULL AUTO_INCREMENT,
    role_id INT(11) NOT NULL DEFAULT 1,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    role ENUM('user', 'admin') DEFAULT 'user',
    PRIMARY KEY (user_id),
    CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 3. Categories Table
CREATE TABLE categories (
    category_id INT(11) NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (category_id)
);

-- 4. Conditions Table
CREATE TABLE conditions (
    condition_id INT(11) NOT NULL AUTO_INCREMENT,
    condition_name VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (condition_id)
);

-- 5. Order Statuses Table
CREATE TABLE order_statuses (
    status_id INT(11) NOT NULL AUTO_INCREMENT,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (status_id)
);

-- 6. Products Table
CREATE TABLE products (
    product_id INT(11) NOT NULL AUTO_INCREMENT,
    seller_id INT(11) NOT NULL,
    category_id INT(11) NOT NULL,
    condition_id INT(11) NOT NULL,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) DEFAULT NULL,
    course_code VARCHAR(20) DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id),
    CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(user_id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT fk_products_condition FOREIGN KEY (condition_id) REFERENCES conditions(condition_id)
);

-- 7. Orders Table
CREATE TABLE orders (
    order_id INT(11) NOT NULL AUTO_INCREMENT,
    buyer_id INT(11) NOT NULL,
    product_id INT(11) NOT NULL,
    status_id INT(11) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id),
    CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_orders_status FOREIGN KEY (status_id) REFERENCES order_statuses(status_id)
);

-- 8. Transactions Table
CREATE TABLE transactions (
    transaction_id INT(11) NOT NULL AUTO_INCREMENT,
    order_id INT(11) NOT NULL UNIQUE,
    seller_id INT(11) NOT NULL,
    buyer_id INT(11) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (transaction_id),
    CONSTRAINT fk_transactions_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_transactions_seller FOREIGN KEY (seller_id) REFERENCES users(user_id),
    CONSTRAINT fk_transactions_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

-- 9. Reviews Table
CREATE TABLE reviews (
    review_id INT(11) NOT NULL AUTO_INCREMENT,
    transaction_id INT(11) NOT NULL,
    reviewer_id INT(11) NOT NULL,
    reviewee_id INT(11) NOT NULL,
    rating INT(11) NOT NULL,
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    CONSTRAINT fk_reviews_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    CONSTRAINT fk_reviews_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(user_id)
);

-- 10. Returns Table
CREATE TABLE returns (
    return_id INT(11) NOT NULL AUTO_INCREMENT,
    order_id INT(11) NOT NULL UNIQUE,
    buyer_id INT(11) NOT NULL,
    product_id INT(11) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    reviewed_by INT(11) DEFAULT NULL,
    PRIMARY KEY (return_id),
    CONSTRAINT fk_returns_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_returns_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    CONSTRAINT fk_returns_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_returns_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);
