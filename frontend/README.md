# BookHive

## Description

BookHive is a secondhand book marketplace designed for students to buy and sell used books. The platform allows users to browse available books, search and filter listings, add books to a shopping cart, submit return requests, and purchase books through an integrated PayFast payment process.

BookHive uses a full-stack architecture with a Vue.js frontend, Node.js and Express backend, and MySQL database. The platform includes secure user authentication, JWT authorization, server-side validation, Bootstrap 5 client-side validation, product management, order processing, and payment integration.

---

## Tech Stack

### Frontend

- **Vue.js 3** — Used to build the interactive single-page application and reusable components.
- **Vite** — Used as the frontend development and build tool.
- **HTML5** — Used to structure the application's pages and components.
- **CSS3** — Used for custom styling, responsive layouts, animations, and BookHive's visual design.
- **Bootstrap 5** — Used for responsive layouts, form controls, validation feedback, buttons, alerts, and UI components.
- **JavaScript** — Used for frontend logic, validation, API communication, cart functionality, and dynamic content.
- **Axios** — Used to communicate with the Node.js backend API.

### Backend

- **Node.js** — Provides the server-side runtime environment.
- **Express.js** — Used to build the REST API and handle HTTP requests.
- **JWT (JSON Web Token)** — Used to authenticate users and protect private API routes.
- **bcrypt** — Used to securely hash user passwords before storing them in the database.

### Database

- **MySQL** — Stores users, products, categories, conditions, orders, payments, returns, reviews, and other application data.

### Payment

- **PayFast** — Used as the third-party payment gateway for the BookHive checkout process.

---

## Prerequisites

Before running BookHive, make sure the following software is installed:

| Component           | Required to run website? | Purpose                                    |
| ------------------- | ------------------------ | ------------------------------------------ |
| **MySQL/XAMPP**     | ✅ Yes                   | Stores users, books, orders, etc.          |
| **Node.js/Express** | ✅ Yes                   | Runs your backend API                      |
| **Vue/Vite**        | ✅ Yes                   | Runs your frontend                         |
| **ngrok**           | ⚠️ For PayFast testing   | Gives PayFast access to your local backend |
| **PayFast**         | ⚠️ For payment testing   | Handles the payment process                |

You can verify Node.js and npm using:

```bash
node -v
npm -v

## Author: Iviwe Ndzengu, Life Choices Academy YouthCode Off-Site, Cohort 2.
```
