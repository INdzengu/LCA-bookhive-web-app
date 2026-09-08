<!-- src/views/ReturnsView.vue -->
<template>
  <div class="returns-page">
    <!-- =========================
         PAGE HERO
    ========================== -->
    <section class="page-header">
      <div class="hero-content">
        <p class="section-tag">BOOKHIVE RETURNS</p>

        <h1>Return Products</h1>

        <p class="subtitle">
          Request a return for a completed purchase. Your request will be reviewed by a BookHive
          administrator before the return is approved.
        </p>
      </div>

      <div class="hero-icon">↩</div>
    </section>

    <!-- =========================
         LOGIN REQUIRED
    ========================== -->
    <div v-if="!user" class="message-card login-card">
      <div class="message-icon">🔐</div>

      <div>
        <p class="section-tag">ACCOUNT REQUIRED</p>

        <h3>Login to manage your returns</h3>

        <p>Please log in to view your purchases and submit return requests.</p>

        <button class="primary-button" @click="$emit('open-auth')">Login / Register</button>
      </div>
    </div>

    <!-- =========================
         LOADING
    ========================== -->
    <div v-else-if="loading" class="message-card loading-card">
      <div class="loading-spinner"></div>

      <div>
        <p class="section-tag">BOOKHIVE</p>

        <h3>Loading your purchases...</h3>

        <p>Please wait while we retrieve your orders and return requests.</p>
      </div>
    </div>

    <!-- =========================
         ERROR
    ========================== -->
    <div v-else-if="errorMessage" class="message-card error-card">
      <div class="message-icon">!</div>

      <div>
        <p class="section-tag">ERROR</p>

        <h3>Something went wrong</h3>

        <p>{{ errorMessage }}</p>

        <button class="secondary-button" @click="loadReturns">Try Again</button>
      </div>
    </div>

    <!-- =========================
         MAIN CONTENT
    ========================== -->
    <template v-else>
      <!-- =========================
           ELIGIBLE PRODUCTS
      ========================== -->
      <section class="returns-section">
        <div class="section-heading">
          <div>
            <p class="section-tag">ELIGIBLE PURCHASES</p>

            <h2>Products you can return</h2>

            <p>Select a completed purchase to request a return.</p>
          </div>

          <span class="count-badge">
            {{ returnableOrders.length }}
          </span>
        </div>

        <!-- EMPTY -->
        <div v-if="returnableOrders.length === 0" class="empty-card">
          <div class="empty-icon">✓</div>

          <h3>No products available for return</h3>

          <p>
            You either have no completed purchases or you have already submitted return requests for
            your purchases.
          </p>
        </div>

        <!-- ORDERS -->
        <div v-else class="orders-grid">
          <article v-for="order in returnableOrders" :key="order.order_id" class="order-card">
            <div class="book-row">
              <div class="book-cover">📖</div>

              <div class="book-details">
                <span class="available-badge"> Completed Purchase </span>

                <h3>
                  {{ order.title }}
                </h3>

                <p v-if="order.author" class="author">
                  {{ order.author }}
                </p>

                <div class="order-meta">
                  <span> Order #{{ order.order_id }} </span>

                  <span> Purchased {{ formatDate(order.created_at) }} </span>
                </div>

                <strong class="order-price"> R{{ Number(order.total_amount).toFixed(2) }} </strong>
              </div>
            </div>

            <button class="return-button" @click="openReturnForm(order)">
              Request Return
              <span>→</span>
            </button>
          </article>
        </div>
      </section>

      <!-- =========================
           RETURN FORM
      ========================== -->
      <!-- ============================= -->
      <!-- RETURN FORM -->
      <!-- ============================= -->

      <section v-if="selectedOrder" class="return-form-section">
        <div class="form-card">
          <!-- Close button -->
          <button
            type="button"
            class="close-button"
            @click="closeReturnForm"
            :disabled="submitting"
            aria-label="Close"
          >
            ×
          </button>

          <p class="section-tag">RETURN REQUEST</p>

          <h2>{{ selectedOrder.title }}</h2>

          <p class="order-reference">Order #{{ selectedOrder.order_id }}</p>

          <!-- Information notice -->
          <div class="notice">
            <strong>Before submitting</strong>

            <p>
              Your return request will first be reviewed by a BookHive administrator. The return
              will only be approved after the administrator reviews your request.
            </p>
          </div>

          <!-- RETURN FORM -->
          <form ref="returnForm" class="needs-validation" novalidate @submit.prevent="submitReturn">
            <!-- RETURN REASON -->
            <div class="form-group">
              <label for="return-reason" class="form-label">
                Why are you returning this book?
              </label>

              <textarea
                id="return-reason"
                v-model="returnReason"
                class="form-control return-textarea"
                :class="{
                  'is-invalid': validationAttempted && !isReasonValid,
                  'is-valid': validationAttempted && isReasonValid,
                }"
                rows="5"
                minlength="10"
                maxlength="500"
                placeholder="Please explain why you would like to return this book..."
                required
                @input="validateReasonWhileTyping"
              ></textarea>

              <!-- Character counter -->
              <div class="textarea-footer">
                <div
                  class="form-text"
                  :class="{ 'text-danger': validationAttempted && !isReasonValid }"
                >
                  <span v-if="!validationAttempted"> Please provide at least 10 characters. </span>

                  <span v-else-if="returnReason.trim().length < 10">
                    Please provide at least 10 characters.
                  </span>

                  <span v-else> Your return reason looks good. </span>
                </div>

                <small
                  class="character-count"
                  :class="{
                    'count-warning': returnReason.length >= 450,
                    'count-danger': returnReason.length >= 500,
                  }"
                >
                  {{ returnReason.length }}/500
                </small>
              </div>

              <!-- Bootstrap invalid feedback -->
              <div class="invalid-feedback">Please provide a reason of at least 10 characters.</div>

              <!-- Bootstrap valid feedback -->
              <div class="valid-feedback">Your return reason looks good.</div>
            </div>

            <!-- SERVER / SUBMISSION ERROR -->
            <p v-if="formError" class="form-error">
              {{ formError }}
            </p>

            <!-- FORM BUTTONS -->
            <div class="form-actions">
              <button
                type="button"
                class="secondary-button"
                @click="closeReturnForm"
                :disabled="submitting"
              >
                Cancel
              </button>

              <button type="submit" class="primary-button" :disabled="submitting">
                {{ submitting ? "Submitting..." : "Submit Return Request" }}
              </button>
            </div>
          </form>
        </div>
      </section>
      <!-- =========================
           RETURN HISTORY
      ========================== -->
      <section class="returns-section history-section">
        <div class="section-heading">
          <div>
            <p class="section-tag">RETURN HISTORY</p>

            <h2>My Return Requests</h2>

            <p>Track the status of your submitted return requests.</p>
          </div>

          <span class="count-badge">
            {{ myReturns.length }}
          </span>
        </div>

        <!-- EMPTY HISTORY -->
        <div v-if="myReturns.length === 0" class="empty-card">
          <div class="empty-icon">↩</div>

          <h3>No return requests</h3>

          <p>Your return requests will appear here once you submit one.</p>
        </div>

        <!-- HISTORY -->
        <div v-else class="return-history">
          <article v-for="request in myReturns" :key="request.return_id" class="return-card">
            <div class="return-card-header">
              <div>
                <p class="history-label">RETURN REQUEST</p>

                <h3>
                  {{ request.title }}
                </h3>

                <p>Order #{{ request.order_id }}</p>
              </div>

              <span class="status" :class="statusClass(request.status)">
                {{ request.status }}
              </span>
            </div>

            <div class="return-info">
              <div class="info-item">
                <span class="info-label"> Reason </span>

                <p>
                  {{ request.reason }}
                </p>
              </div>

              <div class="info-item">
                <span class="info-label"> Requested </span>

                <p>
                  {{ formatDate(request.requested_at) }}
                </p>
              </div>

              <div v-if="request.reviewed_at" class="info-item">
                <span class="info-label"> Reviewed </span>

                <p>
                  {{ formatDate(request.reviewed_at) }}
                </p>
              </div>
            </div>

            <!-- STATUS MESSAGE -->
            <div v-if="request.status === 'Pending'" class="pending-message">
              <span>⏳</span>
              Your return is waiting for admin approval.
            </div>

            <div v-else-if="request.status === 'Approved'" class="approved-message">
              <span>✓</span>
              Your return has been approved.
            </div>

            <div v-else-if="request.status === 'Rejected'" class="rejected-message">
              <span>!</span>
              Your return request was rejected.
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
export default {
  name: "ReturnsView",

  props: {
    user: {
      type: Object,
      default: null,
    },
  },

  emits: ["open-auth"],

  data() {
    return {
      returnableOrders: [],
      myReturns: [],

      selectedOrder: null,
      returnReason: "",

      loading: false,
      submitting: false,

      errorMessage: "",
      formError: "",
    };
  },
  computed: {
    isReasonValid() {
      const reason = this.returnReason.trim();

      return reason.length >= 10 && reason.length <= 500;
    },
  },
  mounted() {
    if (this.user) {
      this.loadReturns();
    }
  },

  watch: {
    user(newUser) {
      if (newUser) {
        this.loadReturns();
      } else {
        this.returnableOrders = [];
        this.myReturns = [];
      }
    },
  },

  methods: {
    getApiUrl() {
      return import.meta.env.VITE_API_URL || "http://localhost:5000";
    },

    getToken() {
      return localStorage.getItem("token");
    },

    async loadReturns() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const token = this.getToken();

        if (!token) {
          throw new Error("Your login session has expired. Please log in again.");
        }

        // GET USER ORDERS

        const ordersResponse = await fetch(`${this.getApiUrl()}/api/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersData = await ordersResponse.json();

        if (!ordersResponse.ok) {
          throw new Error(ordersData.message || "Failed to load your orders.");
        }

        const orders = ordersData.data || [];

        // GET USER RETURNS

        const returnsResponse = await fetch(`${this.getApiUrl()}/api/returns/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const returnsData = await returnsResponse.json();

        if (!returnsResponse.ok) {
          throw new Error(returnsData.message || "Failed to load your return requests.");
        }

        this.myReturns = returnsData.data || [];

        // REMOVE ALREADY RETURNED ORDERS

        const returnOrderIds = new Set(this.myReturns.map((request) => Number(request.order_id)));

        this.returnableOrders = orders.filter(
          (order) => Number(order.status_id) === 2 && !returnOrderIds.has(Number(order.order_id)),
        );
      } catch (error) {
        console.error("Returns loading error:", error);

        this.errorMessage = error.message || "Unable to load your returns.";
      } finally {
        this.loading = false;
      }
    },

    openReturnForm(order) {
      this.selectedOrder = order;
      this.returnReason = "";
      this.formError = "";
      this.validationAttempted = false;

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    closeReturnForm() {
      this.selectedOrder = null;
      this.returnReason = "";
      this.formError = "";
      this.validationAttempted = false;
    },
    async submitReturn() {
      this.formError = "";

      // Only show validation after the user clicks submit
      this.validationAttempted = true;

      const form = this.$refs.returnForm;

      // Activate Bootstrap validation styling
      form.classList.add("was-validated");

      // Check Bootstrap HTML validation
      if (!form.checkValidity()) {
        return;
      }

      // Additional JavaScript validation
      const reason = this.returnReason.trim();

      if (reason.length < 10) {
        this.formError =
          "Please provide a little more detail about why you want to return this book.";
        return;
      }

      if (reason.length > 500) {
        this.formError = "Your return reason cannot exceed 500 characters.";
        return;
      }

      this.submitting = true;

      try {
        const token = this.getToken();

        if (!token) {
          throw new Error("Your login session has expired. Please log in again.");
        }

        const response = await fetch(`${this.getApiUrl()}/api/returns`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            order_id: this.selectedOrder.order_id,
            reason: reason,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to submit return request.");
        }

        // Close form
        this.closeReturnForm();

        // Refresh return information
        await this.loadReturns();

        alert("Your return request has been submitted successfully.");
      } catch (error) {
        console.error("Return submission error:", error);

        this.formError = error.message || "Unable to submit your return request.";
      } finally {
        this.submitting = false;
      }
    },

    formatDate(date) {
      if (!date) {
        return "";
      }

      return new Date(date).toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    validateReasonWhileTyping() {
      if (!this.validationAttempted) {
        return;
      }

      const form = this.$refs.returnForm;

      if (form) {
        form.classList.add("was-validated");
      }
    },
    statusClass(status) {
      return {
        pending: status === "Pending",

        approved: status === "Approved",

        rejected: status === "Rejected",
      };
    },
  },
};
</script>

<style scoped>
/* =========================================
   BOOKHIVE PAGE
========================================= */

.returns-page {
  min-height: 100vh;
  background: #2a220f;
  color: #fbfcfd;
  padding: 55px 25px 90px;
}

.returns-page > section,
.returns-page > div {
  max-width: 1150px;
  margin-left: auto;
  margin-right: auto;
}

/* =========================================
   HEADER
========================================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 260px;

  margin-bottom: 55px;

  padding: 45px;

  background:
    radial-gradient(circle at 85% 30%, rgba(220, 229, 70, 0.12), transparent 35%), #3a3221;

  border: 1px solid #6c665a;
  border-radius: 24px;

  overflow: hidden;
}

.hero-content {
  max-width: 720px;
}

.section-tag {
  margin: 0 0 10px;

  color: #dce546;

  font-size: 0.72rem;
  font-weight: 800;

  letter-spacing: 0.14em;
}

.page-header h1 {
  margin: 0 0 15px;

  font-size: clamp(2.2rem, 5vw, 3.8rem);

  line-height: 1.05;

  color: #fbfcfd;
}

.subtitle {
  max-width: 700px;

  margin: 0;

  color: #969288;

  font-size: 1rem;

  line-height: 1.7;
}

.hero-icon {
  width: 125px;
  height: 125px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dce546;

  color: #2a220f;

  font-size: 4rem;

  transform: rotate(-8deg);

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

/* =========================================
   MESSAGE CARDS
========================================= */

.message-card {
  display: flex;
  align-items: center;
  gap: 25px;

  margin-bottom: 50px;

  padding: 30px;

  background: #3a3221;

  border: 1px solid #6c665a;

  border-radius: 18px;
}

.message-card h3 {
  margin: 0 0 8px;

  color: #fbfcfd;
}

.message-card p:not(.section-tag) {
  color: #969288;
}

.message-icon {
  min-width: 58px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dce546;
  color: #2a220f;

  font-size: 1.5rem;
  font-weight: 900;
}

/* =========================================
   BUTTONS
========================================= */

.primary-button,
.secondary-button,
.return-button {
  border: none;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.primary-button {
  padding: 12px 22px;

  border-radius: 50px;

  background: #dce546;

  color: #2a220f;

  font-weight: 800;
}

.primary-button:hover {
  transform: translateY(-2px);

  box-shadow: 0 10px 25px rgba(220, 229, 70, 0.18);
}

.secondary-button {
  padding: 11px 20px;

  border: 1px solid #6c665a;

  border-radius: 50px;

  background: transparent;

  color: #fbfcfd;

  font-weight: 700;
}

.secondary-button:hover {
  background: #6c665a;

  transform: translateY(-2px);
}

.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;

  transform: none;
}

/* =========================================
   SECTIONS
========================================= */

.returns-section {
  margin-bottom: 70px;
}

.section-heading {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  margin-bottom: 25px;
}

.section-heading h2 {
  margin: 0 0 8px;

  font-size: 1.8rem;
}

.section-heading p:not(.section-tag) {
  margin: 0;

  color: #969288;
}

.count-badge {
  min-width: 45px;
  height: 45px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dce546;

  color: #2a220f;

  font-weight: 900;
}

/* =========================================
   EMPTY
========================================= */

.empty-card {
  padding: 55px 30px;

  text-align: center;

  background: #3a3221;

  border: 1px dashed #6c665a;

  border-radius: 18px;
}

.empty-icon {
  width: 62px;
  height: 62px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 20px;

  border-radius: 50%;

  background: rgba(220, 229, 70, 0.12);

  color: #dce546;

  font-size: 1.7rem;
  font-weight: 900;
}

.empty-card h3 {
  margin-bottom: 10px;
}

.empty-card p {
  max-width: 600px;

  margin: 0 auto;

  color: #969288;

  line-height: 1.6;
}

/* =========================================
   ORDER GRID
========================================= */

.orders-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 20px;
}

.order-card {
  padding: 22px;

  background: #3a3221;

  border: 1px solid #6c665a;

  border-radius: 18px;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.order-card:hover {
  transform: translateY(-4px);

  border-color: #dce546;

  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}

.book-row {
  display: flex;

  gap: 18px;
}

.book-cover {
  flex-shrink: 0;

  width: 85px;
  height: 115px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: linear-gradient(145deg, #6c665a, #29210f);

  font-size: 2.3rem;

  box-shadow: 5px 6px 0 rgba(0, 0, 0, 0.2);
}

.book-details {
  min-width: 0;
}

.available-badge {
  display: inline-block;

  margin-bottom: 8px;

  padding: 4px 9px;

  border-radius: 50px;

  background: rgba(220, 229, 70, 0.12);

  color: #dce546;

  font-size: 0.65rem;
  font-weight: 800;

  text-transform: uppercase;
}

.book-details h3 {
  margin: 0 0 5px;

  font-size: 1.15rem;

  color: #fbfcfd;
}

.author {
  margin: 0 0 12px;

  color: #969288;
}

.order-meta {
  display: flex;

  flex-direction: column;

  gap: 3px;

  color: #6c665a;

  font-size: 0.75rem;
}

.order-price {
  display: block;

  margin-top: 12px;

  color: #dce546;

  font-size: 1.2rem;
}

/* =========================================
   RETURN BUTTON
========================================= */

.return-button {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 22px;

  padding: 12px 16px;

  border-radius: 10px;

  background: #29210f;

  color: #fbfcfd;

  font-weight: 700;
}

.return-button span {
  color: #dce546;

  font-size: 1.2rem;
}

.return-button:hover {
  background: #dce546;

  color: #2a220f;
}

.return-button:hover span {
  color: #2a220f;
}

/* =========================================
   RETURN FORM
========================================= */

.return-form-section {
  margin-bottom: 70px;
}

.form-card {
  position: relative;

  padding: 40px;

  background: #3a3221;

  border: 1px solid #dce546;

  border-radius: 22px;

  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
}

.form-card h2 {
  margin: 0 0 5px;

  font-size: 1.8rem;
}

.order-reference {
  margin: 0 0 25px;

  color: #969288;
}

.close-button {
  position: absolute;

  top: 22px;
  right: 22px;

  width: 40px;
  height: 40px;

  border: 1px solid #6c665a;

  border-radius: 50%;

  background: transparent;

  color: #969288;

  font-size: 1.5rem;

  cursor: pointer;

  transition: 0.2s ease;
}

.close-button:hover {
  border-color: #dce546;

  color: #dce546;

  transform: rotate(90deg);
}

/* =========================================
   NOTICE
========================================= */

.notice {
  display: flex;

  gap: 15px;

  margin-bottom: 30px;

  padding: 18px;

  border-left: 3px solid #dce546;

  border-radius: 10px;

  background: rgba(220, 229, 70, 0.07);
}

.notice-icon {
  flex-shrink: 0;

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dce546;

  color: #2a220f;

  font-weight: 900;
}

.notice strong {
  color: #fbfcfd;
}

.notice p {
  margin: 5px 0 0;

  color: #969288;

  line-height: 1.6;
}

/* =========================================
   FORM
========================================= */

.form-group {
  margin-bottom: 25px;
}

.form-label {
  margin-bottom: 9px;

  color: #fbfcfd;

  font-weight: 700;
}

.return-textarea {
  min-height: 140px;

  resize: vertical;

  background: #29210f !important;

  border: 1px solid #6c665a !important;

  border-radius: 12px !important;

  color: #fbfcfd !important;

  padding: 14px !important;
}

.return-textarea::placeholder {
  color: #6c665a;
}

.return-textarea:focus {
  border-color: #dce546 !important;

  box-shadow: 0 0 0 0.2rem rgba(220, 229, 70, 0.12) !important;
}

.form-text {
  color: #6c665a;
}

.character-count {
  color: #969288;
}

/* Bootstrap validation */

.was-validated .return-textarea:valid {
  border-color: #dce546 !important;
}

.was-validated .return-textarea:invalid {
  border-color: #dc3545 !important;
}

.valid-feedback {
  color: #dce546;
}

.invalid-feedback {
  color: #ff7b7b;
}

/* =========================================
   ERROR
========================================= */

.form-error {
  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 20px;

  padding: 12px 15px;

  border: 1px solid rgba(220, 53, 69, 0.5);

  border-radius: 10px;

  background: rgba(220, 53, 69, 0.08);

  color: #ff8b8b;
}

.form-error span {
  width: 24px;
  height: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dc3545;

  color: white;

  font-weight: 900;
}

/* =========================================
   FORM ACTIONS
========================================= */

.form-actions {
  display: flex;

  justify-content: flex-end;

  gap: 12px;

  padding-top: 5px;
}

/* =========================================
   HISTORY
========================================= */

.history-section {
  padding-top: 10px;
}

.return-history {
  display: flex;

  flex-direction: column;

  gap: 16px;
}

.return-card {
  padding: 25px;

  background: #3a3221;

  border: 1px solid #6c665a;

  border-radius: 18px;
}

.return-card-header {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 20px;

  padding-bottom: 18px;

  border-bottom: 1px solid #6c665a;
}

.history-label {
  margin: 0 0 5px;

  color: #6c665a;

  font-size: 0.65rem;

  font-weight: 800;

  letter-spacing: 0.12em;
}

.return-card-header h3 {
  margin: 0 0 4px;

  color: #fbfcfd;
}

.return-card-header p:last-child {
  margin: 0;

  color: #969288;

  font-size: 0.85rem;
}

/* =========================================
   STATUS
========================================= */

.status {
  padding: 7px 13px;

  border-radius: 50px;

  font-size: 0.7rem;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 0.05em;
}

.status.pending {
  background: rgba(255, 193, 7, 0.12);

  color: #ffc107;
}

.status.approved {
  background: rgba(220, 229, 70, 0.12);

  color: #dce546;
}

.status.rejected {
  background: rgba(220, 53, 69, 0.12);

  color: #ff7777;
}

/* =========================================
   RETURN INFO
========================================= */

.return-info {
  display: grid;

  grid-template-columns: 2fr 1fr 1fr;

  gap: 20px;

  padding: 20px 0;
}

.info-label {
  display: block;

  margin-bottom: 6px;

  color: #6c665a;

  font-size: 0.7rem;

  font-weight: 800;

  text-transform: uppercase;
}

.info-item p {
  margin: 0;

  color: #fbfcfd;

  line-height: 1.5;
}

/* =========================================
   STATUS MESSAGES
========================================= */

.pending-message,
.approved-message,
.rejected-message {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 13px 15px;

  border-radius: 10px;

  font-size: 0.85rem;

  font-weight: 600;
}

.pending-message {
  background: rgba(255, 193, 7, 0.08);

  color: #ffc107;
}

.approved-message {
  background: rgba(220, 229, 70, 0.08);

  color: #dce546;
}

.rejected-message {
  background: rgba(220, 53, 69, 0.08);

  color: #ff7777;
}

/* =========================================
   LOADING
========================================= */

.loading-card {
  justify-content: center;
}

.loading-spinner {
  width: 42px;
  height: 42px;

  border: 4px solid #6c665a;

  border-top-color: #dce546;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 850px) {
  .page-header {
    padding: 35px;
  }

  .hero-icon {
    width: 90px;
    height: 90px;

    font-size: 3rem;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .return-info {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .returns-page {
    padding: 30px 15px 60px;
  }

  .page-header {
    min-height: auto;

    padding: 30px 25px;
  }

  .hero-icon {
    display: none;
  }

  .message-card {
    align-items: flex-start;

    padding: 22px;
  }

  .section-heading {
    align-items: center;
  }

  .section-heading h2 {
    font-size: 1.45rem;
  }

  .form-card {
    padding: 28px 20px;
  }

  .close-button {
    top: 18px;
    right: 18px;
  }

  .book-row {
    align-items: flex-start;
  }

  .book-cover {
    width: 70px;
    height: 95px;

    font-size: 1.8rem;
  }

  .return-card-header {
    flex-direction: column;
  }

  .return-info {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
.return-textarea {
  background: #11100d !important;
  border: 1px solid #3a372e !important;
  color: #f5f5f0 !important;
  border-radius: 10px;
  padding: 14px 16px;
  resize: vertical;
  min-height: 130px;
}

.return-textarea::placeholder {
  color: #6c665a;
}

.return-textarea:focus {
  background: #11100d !important;
  color: #f5f5f0 !important;
  border-color: #dce546 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 229, 70, 0.15) !important;
}

/* Valid */
.return-textarea.is-valid {
  border-color: #dce546 !important;
}

.return-textarea.is-valid:focus {
  border-color: #dce546 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 229, 70, 0.15) !important;
}

/* Invalid */
.return-textarea.is-invalid {
  border-color: #dc3545 !important;
}

.return-textarea.is-invalid:focus {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.15) !important;
}

.textarea-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 7px;
}

.character-count {
  color: #969288;
  font-size: 0.8rem;
  white-space: nowrap;
}

.count-warning {
  color: #dce546;
}

.count-danger {
  color: #dc3545;
}

.form-text {
  color: #969288;
}

.form-error {
  margin-top: 15px;
  padding: 12px 15px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.35);
  border-radius: 9px;
  color: #ff6b6b;
  font-size: 0.9rem;
}
</style>
