<!-- src/views/CartView.vue -->

<template>
  <div class="cart-page">
    <!-- =========================================
         PAGE HEADER
         ========================================= -->
    <section class="page-header">
      <p class="section-tag">BOOKHIVE MARKETPLACE</p>

      <h1>Your Shopping Cart</h1>

      <p class="subtitle">Review the books you've selected before completing your purchase.</p>
    </section>

    <!-- =========================================
         PAYMENT SUCCESS MESSAGE
         ========================================= -->
    <div v-if="paymentStatus === 'success'" class="alert payment-alert success-alert" role="alert">
      <div class="alert-icon">✓</div>

      <div>
        <strong>Payment successful!</strong>
        <p>Your order has been placed successfully and your cart has been cleared.</p>
      </div>
    </div>

    <!-- =========================================
         PAYMENT CANCELLED MESSAGE
         ========================================= -->
    <div v-if="paymentStatus === 'cancelled'" class="alert payment-alert error-alert" role="alert">
      <div class="alert-icon">!</div>

      <div>
        <strong>Payment cancelled</strong>
        <p>Your payment was cancelled. Your selected books are still in your cart.</p>
      </div>
    </div>

    <!-- =========================================
         EMPTY CART
         ========================================= -->
    <section v-if="cart.length === 0" class="empty-cart">
      <div class="empty-icon">🛒</div>

      <p class="section-tag">YOUR CART</p>

      <h2>Your cart is empty</h2>

      <p>
        You haven't added any books yet. Explore the BookHive marketplace and find your next book.
      </p>

      <router-link to="/browse" class="btn browse-button"> Browse Books </router-link>
    </section>

    <!-- =========================================
         CART CONTENT
         ========================================= -->
    <section v-else class="cart-layout">
      <!-- =======================================
           CART ITEMS
           ======================================= -->
      <div class="cart-items-card">
        <div class="cart-card-header">
          <div>
            <p class="section-tag">SELECTED BOOKS</p>

            <h2>Your Cart</h2>
          </div>

          <span class="item-count">
            {{ cart.length }}
            {{ cart.length === 1 ? "book" : "books" }}
          </span>
        </div>

        <!-- Desktop / Tablet Table -->
        <div class="table-responsive">
          <table class="table cart-table align-middle">
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Condition</th>
                <th>Price</th>
                <th class="text-end">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in cart" :key="item.product_id">
                <!-- Book -->
                <td>
                  <div class="book-info">
                    <div class="book-cover">📚</div>

                    <div>
                      <h3>{{ item.title }}</h3>

                      <span v-if="item.course_code" class="course-code">
                        {{ item.course_code }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Author -->
                <td>
                  <span class="author-name">
                    {{ item.author || "Unknown Author" }}
                  </span>
                </td>

                <!-- Condition -->
                <td>
                  <span class="condition-badge">
                    {{ item.condition_name || "Good" }}
                  </span>
                </td>

                <!-- Price -->
                <td>
                  <strong class="item-price"> R{{ Number(item.price).toFixed(2) }} </strong>
                </td>

                <!-- Remove -->
                <td class="text-end">
                  <button
                    type="button"
                    class="remove-button"
                    @click="$emit('remove-from-cart', item.product_id)"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Clear Cart -->
        <div class="cart-actions">
          <button type="button" class="clear-button" @click="$emit('clear-cart')">
            Clear Cart
          </button>

          <router-link to="/browse" class="continue-link"> ← Continue Shopping </router-link>
        </div>
      </div>

      <!-- =======================================
           ORDER SUMMARY
           ======================================= -->
      <aside class="summary-card">
        <div class="summary-header">
          <p class="section-tag">ORDER SUMMARY</p>

          <h2>Checkout</h2>
        </div>

        <div class="summary-line">
          <span>Books</span>

          <span> R{{ subtotalAmount }} </span>
        </div>

        <div class="summary-line">
          <span>Platform fee</span>

          <span> R{{ platformFee }} </span>
        </div>

        <div class="fee-note">
          <span>ⓘ</span>
          <p>A 5% platform fee is added to your purchase total.</p>
        </div>

        <div class="summary-divider"></div>

        <div class="total-line">
          <span>Total</span>

          <strong> R{{ estimatedTotal }} </strong>
        </div>

        <!-- Login Required -->
        <div v-if="!user" class="login-checkout">
          <div class="login-icon">🔐</div>

          <h3>Login required</h3>

          <p>Please log in to your BookHive account before completing your purchase.</p>

          <button type="button" class="btn checkout-button" @click="$emit('open-auth')">
            Login to Checkout
          </button>
        </div>

        <!-- Logged In Checkout -->
        <div v-else>
          <button
            type="button"
            class="btn checkout-button"
            :disabled="loading"
            @click="payWithPayFast"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>

            {{ loading ? "Redirecting to PayFast..." : "Pay with PayFast" }}
          </button>

          <p class="secure-note">🔒 Secure payment powered by PayFast</p>
        </div>

        <!-- Checkout Error -->
        <div v-if="statusMessage" class="alert checkout-error" role="alert">
          {{ statusMessage }}
        </div>
      </aside>
    </section>
  </div>
</template>

<script>
/**
 * ============================================
 * SHOPPING CART VIEW
 * ============================================
 * This page displays items in the user's shopping cart
 * and handles the checkout process with PayFast payment.
 *
 * Features:
 * - Display cart items in a table
 * - Show order summary with pricing
 * - Calculate platform fees (5%)
 * - Handle PayFast payment integration
 * - Show payment success/cancellation messages
 */

import axios from "axios";

export default {
  name: "CartView",

  /**
   * Props passed from parent component (App.vue)
   */
  props: {
    /**
     * cart: Array of items currently in shopping cart
     */
    cart: {
      type: Array,
      required: true,
    },

    /**
     * user: Current logged-in user data
     * Required for authentication and checkout
     */
    user: {
      type: Object,
      default: null,
    },
  },

  /**
   * Events emitted to parent component (App.vue)
   */
  emits: ["remove-from-cart", "clear-cart", "open-auth"],

  /**
   * ============================================
   * DATA PROPERTIES
   * ============================================
   */
  data() {
    return {
      /**
       * Indicates whether checkout is in progress
       * Shows loading spinner while redirecting to PayFast
       */
      loading: false,

      /**
       * Error message displayed if checkout fails
       */
      statusMessage: "",

      /**
       * Payment status after returning from PayFast
       * Values: null (no payment), "success", "cancelled"
       */
      paymentStatus: null,
    };
  },

  /**
   * ============================================
   * COMPUTED PROPERTIES
   * ============================================
   */
  computed: {
    /**
     * Calculate subtotal: Sum of all book prices
     *
     * Process:
     * 1. Loop through each item in cart
     * 2. Add price to running total
     * 3. Return formatted to 2 decimal places
     */
    subtotalAmount() {
      return this.cart.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
    },

    /**
     * Calculate 5% platform fee
     * BookHive adds 5% fee to each purchase
     *
     * Formula: subtotal * 0.05
     */
    platformFee() {
      const subtotal = parseFloat(this.subtotalAmount);

      return (subtotal * 0.05).toFixed(2);
    },

    /**
     * Calculate final total: subtotal + platform fee
     * This is the amount the customer pays
     *
     * Formula: subtotal + (subtotal * 0.05)
     */
    estimatedTotal() {
      const subtotal = parseFloat(this.subtotalAmount);
      const fee = subtotal * 0.05;

      return (subtotal + fee).toFixed(2);
    },
  },

  /**
   * ============================================
   * LIFECYCLE HOOKS
   * ============================================
   */

  /**
   * mounted(): Called after component loads
   * Check if user has returned from PayFast payment
   */
  mounted() {
    /**
     * Check query parameter for payment status
     * URL examples:
     * - /cart?payment=success → Payment successful
     * - /cart?payment=cancelled → User cancelled payment
     */
    const payment = this.$route.query.payment;

    if (payment === "success") {
      /**
       * Payment was successful
       * Show success message and clear cart
       */
      this.paymentStatus = "success";

      // Clear cart in parent component (App.vue)
      this.$emit("clear-cart");

      // Remove query parameter from URL
      this.$router.replace({
        query: {},
      });
    } else if (payment === "cancelled") {
      /**
       * User cancelled payment on PayFast
       * Show message but keep cart intact
       */
      this.paymentStatus = "cancelled";

      this.$router.replace({
        query: {},
      });
    }
  },

  /**
   * ============================================
   * METHODS
   * ============================================
   */
  methods: {
    /**
     * ============================================
     * payWithPayFast()
     * ============================================
     * Purpose: Initiate checkout and redirect to PayFast payment
     *
     * Process:
     * 1. Validate user is authenticated
     * 2. Create orders on backend for each cart item
     * 3. Initiate payment with PayFast
     * 4. Generate and submit PayFast form
     * 5. Redirect user to PayFast payment page
     *
     * PayFast will handle payment, then redirect back with status
     */
    async payWithPayFast() {
      this.loading = true;
      this.statusMessage = "";

      // Get JWT token from localStorage
      const token = localStorage.getItem("token");

      // Get backend API URL (from environment or default to localhost)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      /**
       * ============================================
       * STEP 1: VALIDATE AUTHENTICATION
       * ============================================
       * User must have a valid JWT token
       */
      if (!token) {
        this.statusMessage = "Your session has expired. Please log in again.";

        this.loading = false;

        return;
      }

      try {
        /**
         * ============================================
         * STEP 2: CREATE ORDERS ON BACKEND
         * ============================================
         * Backend creates orders for all cart items and calculates total
         *
         * Request:
         *   POST /api/orders/checkout
         *   { items: [{ product_id, ... }, ...] }
         *
         * Response:
         *   {
         *     success: true,
         *     paymentReference: string (unique reference),
         *     totalAmount: number (calculated by backend),
         *     ...
         *   }
         */
        const orderRes = await axios.post(
          `${apiUrl}/api/orders/checkout`,
          {
            items: this.cart,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Check if order creation was successful
        if (!orderRes.data.success) {
          throw new Error(orderRes.data.message || "Failed to create orders.");
        }

        /**
         * Get payment reference from backend
         * This is a unique ID for tracking the payment
         */
        const paymentReference = orderRes.data.paymentReference;

        /**
         * IMPORTANT: Use total calculated by backend, not frontend
         * Frontend calculation is just for display
         * Backend calculation is authoritative for security
         */
        const totalAmount = orderRes.data.totalAmount;

        console.log("Payment Reference:", paymentReference);
        console.log("PayFast Total:", totalAmount);

        /**
         * ============================================
         * STEP 3: INITIATE PAYFAST PAYMENT
         * ============================================
         * Send payment details to PayFast
         *
         * Request:
         *   POST /api/payments/payfast/initiate
         *   { paymentReference, amount, item_name }
         *
         * Response:
         *   {
         *     success: true,
         *     payfastUrl: string (PayFast payment page URL),
         *     paymentData: { field1, field2, ... } (form data)
         *   }
         */
        const payRes = await axios.post(
          `${apiUrl}/api/payments/payfast/initiate`,
          {
            paymentReference,
            amount: totalAmount,
            item_name: `BookHive Purchase ${paymentReference}`,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Check if PayFast initiation was successful
        if (!payRes.data.success) {
          throw new Error(payRes.data.message || "Failed to initiate PayFast.");
        }

        /**
         * ============================================
         * STEP 4: SUBMIT PAYFAST FORM
         * ============================================
         * Create a hidden form with PayFast data
         * Submit it to PayFast's payment page
         * This redirects the user to the PayFast checkout
         */
        const { payfastUrl, paymentData } = payRes.data;

        // Create a new form element
        const form = document.createElement("form");

        // Set form to POST to PayFast
        form.method = "POST";
        form.action = payfastUrl;

        /**
         * Add all payment data as hidden input fields
         * Example fields: merchant_id, amount, item_name, etc.
         */
        for (const key in paymentData) {
          const input = document.createElement("input");

          input.type = "hidden";
          input.name = key;
          input.value = paymentData[key];

          form.appendChild(input);
        }

        // Add form to DOM
        document.body.appendChild(form);

        // Submit the form
        // This redirects to PayFast payment page
        form.submit();
      } catch (error) {
        console.error("PayFast checkout error:", error);

        /**
         * ============================================
         * ERROR HANDLING
         * ============================================
         * Show appropriate error message based on error type
         */
        if (error.response?.status === 401) {
          // Session expired
          this.statusMessage = "Your session has expired. Please log in again.";
        } else if (error.response?.status === 400) {
          // Bad request (validation error)
          this.statusMessage =
            error.response?.data?.message || "There was a problem with your order.";
        } else if (error.response?.status >= 500) {
          // Server error
          this.statusMessage = "The server encountered a problem. Please try again.";
        } else if (error.request) {
          // Network error (backend not responding)
          this.statusMessage =
            "Unable to connect to BookHive. Please make sure the backend server is running.";
        } else {
          // Other error
          this.statusMessage = error.message || "Failed to initiate PayFast checkout.";
        }

        this.loading = false;
      }
    },
  },
};
</script>
<style scoped>
/* =========================================
   BOOKHIVE CART PAGE
   ========================================= */

.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 25px 80px;
}

/* =========================================
   PAGE HEADER
   ========================================= */

.page-header {
  margin-bottom: 35px;
}

.section-tag {
  margin: 0 0 8px;
  color: #dce546;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.page-header h1 {
  margin: 0 0 12px;
  color: #fbfcfd;
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 800;
}

.subtitle {
  max-width: 650px;
  margin: 0;
  color: #969288;
  line-height: 1.7;
}

/* =========================================
   PAYMENT ALERTS
   ========================================= */

.payment-alert {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding: 18px 20px;
  border-radius: 14px;
}

.payment-alert strong {
  display: block;
  margin-bottom: 3px;
}

.payment-alert p {
  margin: 0;
}

.alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-weight: 900;
}

.success-alert {
  background: rgba(220, 229, 70, 0.1);
  border: 1px solid #dce546;
  color: #dce546;
}

.success-alert .alert-icon {
  background: #dce546;
  color: #2a220f;
}

.error-alert {
  background: rgba(180, 70, 70, 0.1);
  border: 1px solid #8e5555;
  color: #ffb0b0;
}

.error-alert .alert-icon {
  background: #8e5555;
  color: #fbfcfd;
}

/* =========================================
   EMPTY CART
   ========================================= */

.empty-cart {
  padding: 60px 30px;
  text-align: center;
  background: #3a3221;
  border: 1px solid #6c665a;
  border-radius: 20px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 75px;
  height: 75px;
  margin: 0 auto 20px;
  background: #29210f;
  border-radius: 20px;
  font-size: 2rem;
}

.empty-cart h2 {
  margin: 0 0 10px;
  color: #fbfcfd;
}

.empty-cart > p:not(.section-tag) {
  max-width: 500px;
  margin: 0 auto 25px;
  color: #969288;
  line-height: 1.7;
}

.browse-button {
  padding: 11px 22px;
  background: #dce546;
  border: none;
  border-radius: 10px;
  color: #2a220f;
  font-weight: 800;
  transition: all 0.2s ease;
}

.browse-button:hover {
  background: #e7ef62;
  color: #2a220f;
  transform: translateY(-2px);
}

/* =========================================
   CART LAYOUT
   ========================================= */

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 25px;
  align-items: start;
}

/* =========================================
   CART ITEMS CARD
   ========================================= */

.cart-items-card {
  overflow: hidden;
  background: #3a3221;
  border: 1px solid #6c665a;
  border-radius: 20px;
}

.cart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 25px 28px;
  border-bottom: 1px solid #6c665a;
}

.cart-card-header h2 {
  margin: 0;
  color: #fbfcfd;
  font-size: 1.4rem;
}

.item-count {
  padding: 7px 12px;
  background: #29210f;
  border: 1px solid #6c665a;
  border-radius: 20px;
  color: #dce546;
  font-size: 0.8rem;
  font-weight: 700;
}

/* =========================================
   TABLE
   ========================================= */

.table-responsive {
  width: 100%;
}

.cart-table {
  margin: 0;
  color: #fbfcfd;
  --bs-table-bg: transparent;
  --bs-table-color: #fbfcfd;
  --bs-table-border-color: #6c665a;
}

.cart-table thead th {
  padding: 15px 20px;
  background: #29210f;
  border-bottom: 1px solid #6c665a;
  color: #969288;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.cart-table tbody td {
  padding: 18px 20px;
  border-color: #6c665a;
  vertical-align: middle;
}

.cart-table tbody tr {
  transition: background 0.2s ease;
}

.cart-table tbody tr:hover {
  background: rgba(220, 229, 70, 0.035);
}

/* =========================================
   BOOK INFORMATION
   ========================================= */

.book-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 230px;
}

.book-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  width: 50px;
  height: 65px;
  background: #29210f;
  border: 1px solid #6c665a;
  border-radius: 8px;
  font-size: 1.5rem;
}

.book-info h3 {
  max-width: 190px;
  margin: 0 0 5px;
  color: #fbfcfd;
  font-size: 0.95rem;
  font-weight: 700;
}

.course-code {
  display: inline-block;
  color: #969288;
  font-size: 0.72rem;
}

.author-name {
  color: #969288;
  white-space: nowrap;
}

.condition-badge {
  display: inline-block;
  padding: 5px 9px;
  background: rgba(220, 229, 70, 0.08);
  border: 1px solid rgba(220, 229, 70, 0.25);
  border-radius: 20px;
  color: #dce546;
  font-size: 0.7rem;
  font-weight: 700;
}

.item-price {
  color: #dce546;
  white-space: nowrap;
}

/* =========================================
   REMOVE BUTTON
   ========================================= */

.remove-button {
  padding: 7px 11px;
  background: transparent;
  border: 1px solid #6c665a;
  border-radius: 8px;
  color: #969288;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.remove-button:hover {
  background: rgba(180, 70, 70, 0.1);
  border-color: #8e5555;
  color: #ffb0b0;
}

/* =========================================
   CART ACTIONS
   ========================================= */

.cart-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 20px;
  border-top: 1px solid #6c665a;
}

.clear-button {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #6c665a;
  border-radius: 8px;
  color: #969288;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.clear-button:hover {
  border-color: #8e5555;
  color: #ffb0b0;
}

.continue-link {
  color: #dce546;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}

.continue-link:hover {
  color: #e7ef62;
}

/* =========================================
   SUMMARY CARD
   ========================================= */

.summary-card {
  padding: 25px;
  background: #3a3221;
  border: 1px solid #6c665a;
  border-radius: 20px;
  position: sticky;
  top: 25px;
}

.summary-header {
  margin-bottom: 25px;
}

.summary-header h2 {
  margin: 0;
  color: #fbfcfd;
  font-size: 1.4rem;
}

.summary-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;
  color: #969288;
  font-size: 0.9rem;
}

.summary-line span:last-child {
  color: #fbfcfd;
  font-weight: 600;
}

.fee-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 5px;
  padding: 10px;
  background: #29210f;
  border-radius: 9px;
  color: #969288;
  font-size: 0.7rem;
  line-height: 1.5;
}

.fee-note span {
  color: #dce546;
}

.fee-note p {
  margin: 0;
}

.summary-divider {
  height: 1px;
  margin: 22px 0;
  background: #6c665a;
}

.total-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
  color: #fbfcfd;
  font-size: 1rem;
}

.total-line strong {
  color: #dce546;
  font-size: 1.4rem;
}

/* =========================================
   CHECKOUT
   ========================================= */

.checkout-button {
  width: 100%;
  min-height: 50px;
  background: #dce546;
  border: none;
  border-radius: 10px;
  color: #2a220f;
  font-weight: 800;
  transition: all 0.2s ease;
}

.checkout-button:hover:not(:disabled) {
  background: #e7ef62;
  color: #2a220f;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 229, 70, 0.18);
}

.checkout-button:disabled {
  opacity: 0.7;
}

/* =========================================
   LOGIN CHECKOUT
   ========================================= */

.login-checkout {
  padding: 18px;
  background: #29210f;
  border: 1px solid #6c665a;
  border-radius: 12px;
  text-align: center;
}

.login-icon {
  margin-bottom: 8px;
  font-size: 1.4rem;
}

.login-checkout h3 {
  margin: 0 0 7px;
  color: #fbfcfd;
  font-size: 0.95rem;
}

.login-checkout p {
  margin: 0 0 15px;
  color: #969288;
  font-size: 0.75rem;
  line-height: 1.5;
}

.secure-note {
  margin: 12px 0 0;
  color: #969288;
  font-size: 0.7rem;
  text-align: center;
}

/* =========================================
   CHECKOUT ERROR
   ========================================= */

.checkout-error {
  margin: 15px 0 0;
  padding: 12px;
  background: rgba(180, 70, 70, 0.1);
  border: 1px solid #8e5555;
  border-radius: 10px;
  color: #ffb0b0;
  font-size: 0.78rem;
}

/* =========================================
   RESPONSIVE
   ========================================= */

@media (max-width: 1000px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding: 35px 18px 60px;
  }

  .cart-card-header {
    padding: 20px;
  }

  .cart-table thead th,
  .cart-table tbody td {
    padding: 14px 12px;
  }

  .book-info {
    min-width: 190px;
  }

  .book-info h3 {
    max-width: 150px;
  }
}

@media (max-width: 600px) {
  .cart-card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  /*
   * On small screens the table remains
   * horizontally scrollable rather than
   * becoming cramped.
   */
  .cart-table {
    min-width: 700px;
  }

  .cart-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .continue-link {
    text-align: center;
  }

  .clear-button {
    width: 100%;
  }

  .empty-cart {
    padding: 45px 20px;
  }
}
</style>
