<<<<<<< HEAD

# 📚 BookHive - Secondhand Book Marketplace

A full-stack web application for students to buy and sell secondhand books efficiently. BookHive provides a seamless marketplace experience with secure authentication, real-time inventory management, and integrated payment processing.

---

## 🎯 Overview

BookHive is a student-focused secondhand book marketplace built with modern web technologies. It enables users to:

- **Browse & Search** books by title, author, category, and condition
- **List Books** for sale with detailed descriptions and pricing
- **Manage Cart** with real-time updates
- **Secure Checkout** with PayFast payment integration
- **Track Orders** and manage returns
- **Leave Reviews** for books and sellers

---

## 🛠️ Tech Stack

### Frontend

- **Vue.js 3** — Interactive single-page application with reusable components
- **Vite** — Lightning-fast build tool and dev server
- **Bootstrap 5** — Responsive UI framework for consistent design
- **Axios** — HTTP client for API communication
- **HTML5 & CSS3** — Structure and custom styling with animations

### Backend

- **Node.js** — Server-side JavaScript runtime
- **Express.js** — RESTful API framework
- **JWT (JSON Web Tokens)** — Secure user authentication and authorization
- **bcryptjs** — Password hashing and security
- **MySQL 2** — Relational database driver

### Database

- **MySQL** — Persistent data storage for users, books, orders, reviews, and more

### Payment

- **PayFast** — Third-party payment gateway for checkout processing

---

## 📋 Prerequisites

Before setting up BookHive, ensure you have:

| Component               | Required    | Purpose                            |
| ----------------------- | ----------- | ---------------------------------- |
| **Node.js** (v16+)      | ✅ Yes      | JavaScript runtime                 |
| **npm/yarn**            | ✅ Yes      | Package manager                    |
| **MySQL 8.0+**          | ✅ Yes      | Database                           |
| **XAMPP** (alternative) | ✅ Yes      | MySQL + Apache bundle              |
| **Git**                 | ✅ Yes      | Version control                    |
| **ngrok**               | ⚠️ Optional | For PayFast testing with localhost |
| **PayFast Account**     | ⚠️ Optional | For payment gateway testing        |

### Verify Installation

```bash
node -v    # Should display Node.js version
npm -v     # Should display npm version
mysql -v   # Should display MySQL version (if installed directly)
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/INdzengu/LCA-bookhive-web-app.git
cd LCA-bookhive-web-app
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bookhive_db
JWT_SECRET=your_jwt_secret_key_here
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
NODE_ENV=development
```

Start the backend server:

```bash
# Development mode (with auto-reload)
npm --watch server.js
```

The backend API will be available at `http://localhost:5000`

### 3. Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file if needed:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in your terminal)

### 4. Database Setup

#### Option A: Import Existing Schema

```bash
mysql -u root -p bookhive_db < bookhive_schema.sql
```

Or in **MySQL Workbench**:

1. Open a new SQL query tab
2. Open the `bookhive_schema.sql` file
3. Execute the script

#### Option B: Create from Scratch

1. Open XAMPP/MySQL and start the MySQL service
2. In MySQL Workbench or command line, run:

```sql
CREATE DATABASE IF NOT EXISTS bookhive_db;
USE bookhive_db;
```

3. Import the `bookhive_schema.sql` file as shown above

---

## 📊 Database Schema

The BookHive database includes the following 10 tables:

### Tables Overview

| Table              | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| **roles**          | User role definitions (user, admin)               |
| **users**          | User accounts with authentication                 |
| **categories**     | Book categories                                   |
| **conditions**     | Book condition levels                             |
| **order_statuses** | Order status definitions                          |
| **products**       | Secondhand book listings                          |
| **orders**         | Customer orders                                   |
| **transactions**   | Completed transactions between buyers and sellers |
| **reviews**        | User reviews and ratings                          |
| **returns**        | Book return requests and management               |

### ER Diagram Overview

```
Users (sellers & buyers)
├── Products (books listed for sale)
├── Orders (purchase orders)
│   ├── Transactions (completed sales)
│   │   └── Reviews (ratings & comments)
│   └── Returns (return requests)
├── Roles (user permissions)
└── Categories & Conditions (product attributes)
```

### Key Relationships

- **Users → Products**: Sellers list books (1:N)
- **Users → Orders**: Buyers place orders (1:N)
- **Products → Orders**: A product can be ordered multiple times (1:N)
- **Orders → Transactions**: Each order has one transaction (1:1)
- **Transactions → Reviews**: Buyers and sellers leave reviews (1:1)
- **Orders → Returns**: Orders can have return requests (1:1)

### Schema File

The complete database schema is available in [`bookhive_schema.sql`](./bookhive_schema.sql) for easy setup and backup.

---

## 📁 Project Structure

```
LCA-bookhive-web-app/
├── frontend/                 # Vue.js SPA
│   ├── src/
│   │   ├── components/      # Reusable Vue components
│   │   ├── views/           # Page components
│   │   ├── router/          # Vue Router configuration
│   │   ├── App.vue          # Root component
│   │   └── main.js          # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js/Express API
│   ├── routes/              # API endpoints
│   ├── controllers/         # Business logic
│   ├── models/              # Database models
│   ├── middleware/          # Auth & error handling
│   ├── server.js            # Express app setup
│   ├── package.json
│   └── .env                 # Environment variables (create this)
│
├── bookhive_schema.sql      # Database schema export
└── README.md                # This file
```

---

## 🔐 Authentication & Security

- **JWT Tokens**: User sessions are managed using JSON Web Tokens
- **Password Hashing**: All passwords are hashed with bcryptjs before storage
- **Protected Routes**: API endpoints require valid JWT tokens for sensitive operations
- **Role-Based Access**: Users and admins have different permission levels
- **CORS Enabled**: Backend configured to accept requests from the frontend domain

### Login Flow

1. User submits credentials (email/password)
2. Backend validates and checks password hash
3. JWT token generated and sent to frontend
4. Token stored in localStorage (or session storage)
5. Token included in Authorization header for subsequent requests

Current login details for admins

Yonela Mjele - Username & Password - YMjele@yahoo.com
Sinalo Joni - Username & Password - SJoni@gmail.com

---

## 🛒 Core Features

### User Management

- User registration and login
- Role-based access (User/Admin)
- Profile management
- Secure password handling

### Book Listings

- Browse books by category and condition
- Search and filter by title, author, price
- Add/edit book listings
- Track product availability

### Shopping Cart

- Add/remove books from cart
- Real-time quantity management
- Price calculation

### Checkout & Payments

- Secure PayFast payment integration
- Order status tracking
- Transaction records

### Reviews & Ratings

- Rate books and sellers
- Leave comments
- Build community trust

### Order Management

- Track order status
- View transaction history
- Manage returns and refunds

---

## 🌐 API Endpoints (Overview)

### Authentication

- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Authenticate user
- `POST /api/auth/logout` — End user session

### Products (Books)

- `GET /api/products` — List all books
- `GET /api/products/:id` — Get book details
- `POST /api/products` — Create new listing (auth required)
- `PUT /api/products/:id` — Update listing (auth required)
- `DELETE /api/products/:id` — Remove listing (auth required)

### Orders

- `GET /api/orders` — Get user's orders (auth required)
- `POST /api/orders` — Create new order (auth required)
- `GET /api/orders/:id` — Get order details (auth required)
- `PUT /api/orders/:id/status` — Update order status (admin)

### Transactions

- `GET /api/transactions` — Get transaction history (auth required)
- `GET /api/transactions/:id` — Get transaction details (auth required)

### Reviews

- `GET /api/reviews/:transactionId` — Get reviews for transaction
- `POST /api/reviews` — Submit review (auth required)
- `GET /api/reviews/user/:userId` — Get all reviews for user

### Returns

- `GET /api/returns` — Get return requests (auth required)
- `POST /api/returns` — Submit return request (auth required)
- `PUT /api/returns/:id` — Update return status (admin)

For detailed API documentation, refer to your backend `routes/` directory.

---

## Payment System Approach

### Why PayFast?

- Supports South African users (your primary market)
- Easy integration with Node.js backend
- Secure & PCI-compliant
- Provides test sandbox for development
- Clear documentation

### Payment Flow

1. User adds books to cart
2. Proceeds to checkout
3. Selects PayFast payment
4. Redirected to PayFast secure page
5. Returns to BookHive with confirmation
6. Order marked as "Paid"
7. Seller notified of sale

### Testing Payment

- Use PayFast Sandbox mode
- Test cards provided by PayFast
- Verify transaction recorded in database

## 🧪 Testing

### Testing Payments (PayFast Sandbox)

1. Use PayFast's sandbox credentials in your `.env`
2. Set up ngrok to expose your local backend:

```bash
ngrok http 5000
```

3. Update PayFast callback URL with your ngrok URL
4. Test payment flow in sandbox mode

### Testing the Application

- Register a test account
- Create a book listing
- Browse and search books
- Complete checkout with test card details

---

## 📝 Environment Variables

### Backend (.env)

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bookhive_db
JWT_SECRET=your_secret_key_here
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=merchant_key
PAYFAST_MODE=sandbox
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=BookHive
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the project's style guidelines and includes appropriate comments.

---

## 🐛 Troubleshooting

### Backend won't start

- Verify MySQL is running
- Check `.env` file variables
- Ensure port 5000 is not in use: `lsof -i :5000`

### Frontend won't connect to backend

- Check backend server is running on correct port
- Verify CORS_ORIGIN in backend `.env`
- Check browser console for network errors

### Database connection errors

- Confirm MySQL credentials in `.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Check database host is reachable
- Ensure `bookhive_schema.sql` was imported successfully

### PayFast payment not working

- Confirm PayFast credentials in `.env`
- Use sandbox mode for testing
- Check ngrok tunnel is active (if using localhost)
- Verify callback URL is correct

---

## 📧 Support & Contact

For questions or issues:

- Open an Issue in the GitHub repository
- Check existing documentation in the project
- Review the schema and API structure

---

## 📄 License

This project was developed as part of the **Life Choices Academy YouthCode Off-Site, Cohort 2**.

---

## 👨‍💻 Author

**Iviwe Ndzengu**  
_Life Choices Academy | YouthCode Cohort 2_

---

## 🎉 Acknowledgments

- Life Choices Academy for project guidance
- YouthCode program for development opportunities
- Vue.js and Express.js communities for excellent documentation
- PayFast for payment processing services

---

**Last Updated**: September 2026  
**Status**: Active Development
=======

> > > > > > > 07acf5654700b58f90cdc916ce839e092594663c
