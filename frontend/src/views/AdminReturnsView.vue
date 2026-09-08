<!-- src/views/AdminReturnsView.vue -->

<template>
  <div class="admin-returns-page">
    <!-- HERO / PAGE HEADER -->
    <section class="page-header">
      <div class="header-content">
        <div>
          <p class="section-label">BOOKHIVE ADMINISTRATION</p>

          <h1>Return Requests</h1>

          <p class="page-description">
            Review and manage return requests submitted by BookHive users. Approve valid requests or
            reject requests that do not meet the requirements.
          </p>
        </div>

        <div class="header-icon">↩</div>
      </div>
    </section>

    <!-- SUMMARY CARDS -->
    <section class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon total-icon">#</div>

        <div class="summary-content">
          <span>Total Requests</span>
          <strong>{{ returns.length }}</strong>
        </div>
      </div>

      <div class="summary-card pending-card">
        <div class="summary-icon pending-icon">!</div>

        <div class="summary-content">
          <span>Pending</span>
          <strong>{{ pendingCount }}</strong>
        </div>
      </div>

      <div class="summary-card approved-card">
        <div class="summary-icon approved-icon">✓</div>

        <div class="summary-content">
          <span>Approved</span>
          <strong>{{ approvedCount }}</strong>
        </div>
      </div>

      <div class="summary-card rejected-card">
        <div class="summary-icon rejected-icon">×</div>

        <div class="summary-content">
          <span>Rejected</span>
          <strong>{{ rejectedCount }}</strong>
        </div>
      </div>
    </section>

    <!-- REQUEST MANAGEMENT -->
    <section class="returns-card">
      <!-- CARD HEADER -->
      <div class="card-header">
        <div>
          <p class="section-label">RETURN MANAGEMENT</p>

          <h2>Customer Return Requests</h2>

          <p class="card-description">
            Review the details of each return request before making a decision.
          </p>
        </div>

        <button class="refresh-button" @click="fetchReturns" :disabled="loading">
          <span class="refresh-icon">↻</span>

          {{ loading ? "Refreshing..." : "Refresh" }}
        </button>
      </div>

      <!-- ERROR -->
      <div v-if="errorMessage" class="error-message">
        <div class="error-icon">!</div>

        <div class="error-content">
          <strong>Something went wrong</strong>

          <p>
            {{ errorMessage }}
          </p>

          <button class="try-again-button" @click="fetchReturns">Try Again</button>
        </div>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="message-state">
        <div class="loading-spinner"></div>

        <h3>Loading return requests...</h3>

        <p>Please wait while we retrieve the latest requests.</p>
      </div>

      <!-- EMPTY -->
      <div v-else-if="returns.length === 0" class="empty-state">
        <div class="empty-icon">✓</div>

        <h3>No return requests</h3>

        <p>There are currently no return requests waiting to be reviewed.</p>
      </div>

      <!-- RETURN REQUESTS -->
      <div v-else class="return-list">
        <article v-for="request in returns" :key="request.return_id" class="return-item">
          <!-- LEFT SIDE -->
          <div class="return-main">
            <div class="book-icon">📖</div>

            <div class="return-details">
              <div class="book-heading">
                <div>
                  <p class="item-label">RETURN REQUEST #{{ request.return_id }}</p>

                  <h3>
                    {{ request.title }}
                  </h3>

                  <p v-if="request.author" class="author">
                    {{ request.author }}
                  </p>
                </div>

                <!-- STATUS -->
                <span class="status" :class="getStatusClass(request.status)">
                  <span class="status-dot"></span>

                  {{ request.status }}
                </span>
              </div>

              <!-- INFORMATION GRID -->
              <div class="request-information">
                <div class="info-box">
                  <span class="info-label"> BUYER </span>

                  <strong>
                    {{ request.buyer_name }}
                  </strong>
                </div>

                <div class="info-box">
                  <span class="info-label"> EMAIL </span>

                  <strong>
                    {{ request.buyer_email }}
                  </strong>
                </div>

                <div class="info-box">
                  <span class="info-label"> ORDER </span>

                  <strong> #{{ request.order_id }} </strong>
                </div>

                <div class="info-box">
                  <span class="info-label"> REQUESTED </span>

                  <strong>
                    {{ formatDate(request.requested_at) }}
                  </strong>
                </div>
              </div>

              <!-- RETURN REASON -->
              <div class="reason-box">
                <div class="reason-header">
                  <span class="reason-icon"> 💬 </span>

                  <span> Return reason </span>
                </div>

                <p>
                  {{ request.reason }}
                </p>
              </div>
            </div>
          </div>

          <!-- RIGHT / ACTION AREA -->
          <div class="return-actions">
            <!-- PENDING -->
            <div v-if="request.status === 'Pending'" class="pending-actions">
              <p class="decision-label">ADMIN DECISION</p>

              <button
                class="approve-button"
                :disabled="processingId === request.return_id"
                @click="updateReturn(request.return_id, 'approve')"
              >
                <span>✓</span>

                {{ processingId === request.return_id ? "Processing..." : "Approve Return" }}
              </button>

              <button
                class="reject-button"
                :disabled="processingId === request.return_id"
                @click="updateReturn(request.return_id, 'reject')"
              >
                <span>×</span>

                {{ processingId === request.return_id ? "Processing..." : "Reject Return" }}
              </button>
            </div>

            <!-- ALREADY REVIEWED -->
            <div v-else class="reviewed-area">
              <div class="reviewed-icon" :class="getStatusClass(request.status)">
                {{ request.status === "Approved" ? "✓" : "×" }}
              </div>

              <strong> Request {{ request.status }} </strong>

              <p>
                Reviewed
                <span v-if="request.reviewed_at">
                  {{ formatDate(request.reviewed_at) }}
                </span>
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "AdminReturnsView",

  props: {
    user: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      returns: [],

      loading: false,

      processingId: null,

      errorMessage: "",
    };
  },

  computed: {
    pendingCount() {
      return this.returns.filter((request) => request.status === "Pending").length;
    },

    approvedCount() {
      return this.returns.filter((request) => request.status === "Approved").length;
    },

    rejectedCount() {
      return this.returns.filter((request) => request.status === "Rejected").length;
    },
  },

  mounted() {
    if (this.user && Number(this.user.role_id) === 2) {
      this.fetchReturns();
    }
  },

  watch: {
    user(newUser) {
      if (newUser && Number(newUser.role_id) === 2) {
        this.fetchReturns();
      } else {
        this.returns = [];
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

    async fetchReturns() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const token = this.getToken();

        if (!token) {
          throw new Error("Your login session has expired. Please log in again.");
        }

        const response = await fetch(`${this.getApiUrl()}/api/returns/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load return requests.");
        }

        this.returns = data.data || [];
      } catch (error) {
        console.error("Returns loading error:", error);

        this.errorMessage = error.message || "Unable to load return requests.";
      } finally {
        this.loading = false;
      }
    },

    async updateReturn(returnId, action) {
      this.processingId = returnId;
      this.errorMessage = "";

      try {
        const token = this.getToken();

        if (!token) {
          throw new Error("Your login session has expired.");
        }

        const endpoint =
          action === "approve"
            ? `/api/returns/admin/${returnId}/approve`
            : `/api/returns/admin/${returnId}/reject`;

        const response = await fetch(`${this.getApiUrl()}${endpoint}`, {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type") || "";

        let data;

        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          throw new Error(`Server returned an unexpected response (${response.status}).`);
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to update return request.");
        }

        alert(
          action === "approve"
            ? "Return request approved successfully."
            : "Return request rejected successfully.",
        );

        await this.fetchReturns();
      } catch (error) {
        console.error("Return update error:", error);

        this.errorMessage = error.message || "Unable to update the return request.";
      } finally {
        this.processingId = null;
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

    getStatusClass(status) {
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
/* =====================================================
   PAGE
===================================================== */

.admin-returns-page {
  min-height: 100vh;
  background: #12110e;
  color: #f5f5f0;
  padding: 55px 25px 90px;
}

/* =====================================================
   HEADER
===================================================== */

.page-header {
  max-width: 1150px;
  margin: 0 auto 35px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;

  padding: 38px;

  border-radius: 22px;

  background:
    radial-gradient(circle at 85% 20%, rgba(212, 240, 56, 0.12), transparent 30%), #1e1c17;

  border: 1px solid #302d25;
}

.section-label {
  margin: 0 0 9px;

  color: #d4f038;

  font-size: 0.72rem;
  font-weight: 800;

  letter-spacing: 0.14em;
}

.page-header h1 {
  margin: 0 0 12px;

  font-size: clamp(2.1rem, 5vw, 3.4rem);
  line-height: 1.05;

  letter-spacing: -0.04em;
}

.page-description {
  max-width: 680px;

  margin: 0;

  color: #a09d95;

  font-size: 1rem;
  line-height: 1.7;
}

.header-icon {
  width: 85px;
  height: 85px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 24px;

  background: #d4f038;

  color: #12110e;

  font-size: 3rem;
  font-weight: 900;

  transform: rotate(-8deg);

  box-shadow: 0 15px 40px rgba(212, 240, 56, 0.12);
}

/* =====================================================
   SUMMARY
===================================================== */

.summary-grid {
  max-width: 1150px;

  margin: 0 auto 35px;

  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 17px;
}

.summary-card {
  display: flex;
  align-items: center;

  gap: 16px;

  padding: 22px;

  border-radius: 17px;

  background: #1e1c17;

  border: 1px solid #302d25;

  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.summary-card:hover {
  transform: translateY(-4px);

  border-color: #4a4639;

  background: #24221c;
}

.summary-icon {
  width: 48px;
  height: 48px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;

  font-size: 1.3rem;
  font-weight: 900;
}

.total-icon {
  background: #302c20;
  color: #f5f5f0;
}

.pending-icon {
  background: rgba(240, 192, 56, 0.13);
  color: #f0c038;
}

.approved-icon {
  background: rgba(105, 210, 120, 0.12);
  color: #75d889;
}

.rejected-icon {
  background: rgba(225, 85, 85, 0.12);
  color: #e56b6b;
}

.summary-content {
  display: flex;
  flex-direction: column;

  gap: 4px;
}

.summary-content span {
  color: #8e8a81;

  font-size: 0.76rem;
  font-weight: 600;
}

.summary-content strong {
  font-size: 1.6rem;
}

/* =====================================================
   MAIN CARD
===================================================== */

.returns-card {
  max-width: 1150px;

  margin: 0 auto;

  padding: 30px;

  border-radius: 22px;

  background: #1a1915;

  border: 1px solid #302d25;
}

.card-header {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  padding-bottom: 25px;

  border-bottom: 1px solid #302d25;
}

.card-header h2 {
  margin: 0 0 7px;

  font-size: 1.55rem;
}

.card-description {
  margin: 0;

  color: #77736b;

  font-size: 0.88rem;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 11px 16px;

  border: 1px solid #454136;
  border-radius: 10px;

  background: #24221c;

  color: #f5f5f0;

  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  border-color: #d4f038;

  color: #d4f038;

  transform: translateY(-2px);
}

.refresh-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;
}

.refresh-icon {
  font-size: 1.1rem;
}

/* =====================================================
   RETURN LIST
===================================================== */

.return-list {
  display: flex;

  flex-direction: column;

  gap: 17px;

  padding-top: 25px;
}

.return-item {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    190px;

  gap: 25px;

  padding: 23px;

  border-radius: 17px;

  background: #201f1a;

  border: 1px solid #302d25;

  transition:
    border-color 0.25s ease,
    transform 0.25s ease;
}

.return-item:hover {
  border-color: #454136;

  transform: translateY(-2px);
}

.return-main {
  display: flex;

  gap: 18px;

  min-width: 0;
}

.book-icon {
  width: 70px;
  height: 90px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: linear-gradient(145deg, #383326, #28251e);

  border: 1px solid #474237;

  font-size: 2rem;

  box-shadow: 5px 7px 0 #14130f;
}

.return-details {
  flex: 1;

  min-width: 0;
}

.book-heading {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 17px;
}

.item-label {
  margin: 0 0 6px;

  color: #77736b;

  font-size: 0.67rem;
  font-weight: 800;

  letter-spacing: 0.1em;
}

.book-heading h3 {
  margin: 0 0 4px;

  font-size: 1.25rem;
}

.author {
  margin: 0;

  color: #918d84;

  font-size: 0.88rem;
}

/* =====================================================
   STATUS
===================================================== */

.status {
  display: inline-flex;

  align-items: center;

  gap: 7px;

  padding: 7px 11px;

  border-radius: 20px;

  font-size: 0.7rem;

  font-weight: 800;

  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: currentColor;
}

.status.pending {
  background: rgba(240, 192, 56, 0.12);

  color: #f0c038;
}

.status.approved {
  background: rgba(105, 210, 120, 0.12);

  color: #75d889;
}

.status.rejected {
  background: rgba(225, 85, 85, 0.12);

  color: #e56b6b;
}

/* =====================================================
   INFORMATION
===================================================== */

.request-information {
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 10px;

  margin-bottom: 15px;
}

.info-box {
  padding: 11px 12px;

  border-radius: 10px;

  background: #191814;

  border: 1px solid #2b2922;

  min-width: 0;
}

.info-label {
  display: block;

  margin-bottom: 5px;

  color: #666259;

  font-size: 0.62rem;

  font-weight: 800;

  letter-spacing: 0.08em;
}

.info-box strong {
  display: block;

  overflow: hidden;

  color: #dddcd4;

  font-size: 0.76rem;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* =====================================================
   REASON
===================================================== */

.reason-box {
  padding: 14px 16px;

  border-radius: 11px;

  background: #181713;

  border-left: 3px solid #d4f038;
}

.reason-header {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 7px;

  color: #d4f038;

  font-size: 0.72rem;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 0.08em;
}

.reason-icon {
  font-size: 0.9rem;
}

.reason-box p {
  margin: 0;

  color: #aaa69c;

  font-size: 0.84rem;

  line-height: 1.6;
}

/* =====================================================
   ACTIONS
===================================================== */

.return-actions {
  display: flex;

  flex-direction: column;

  justify-content: center;

  gap: 10px;

  padding-left: 20px;

  border-left: 1px solid #302d25;
}

.pending-actions {
  display: flex;

  flex-direction: column;

  gap: 9px;
}

.decision-label {
  margin: 0 0 3px;

  color: #68645b;

  font-size: 0.65rem;

  font-weight: 800;

  letter-spacing: 0.1em;
}

.approve-button,
.reject-button {
  width: 100%;

  padding: 11px 13px;

  border-radius: 10px;

  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;
}

.approve-button {
  border: 1px solid #6f861d;

  background: #d4f038;

  color: #12110e;
}

.approve-button:hover:not(:disabled) {
  transform: translateY(-2px);

  box-shadow: 0 8px 20px rgba(212, 240, 56, 0.15);
}

.reject-button {
  border: 1px solid #57302f;

  background: #291d1b;

  color: #e67b76;
}

.reject-button:hover:not(:disabled) {
  background: #35211f;

  border-color: #87423f;

  transform: translateY(-2px);
}

.approve-button:disabled,
.reject-button:disabled {
  opacity: 0.5;

  cursor: not-allowed;
}

/* =====================================================
   REVIEWED
===================================================== */

.reviewed-area {
  display: flex;

  flex-direction: column;

  align-items: center;

  text-align: center;

  gap: 7px;
}

.reviewed-icon {
  width: 52px;
  height: 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  font-size: 1.5rem;
  font-weight: 900;
}

.reviewed-icon.approved {
  background: rgba(105, 210, 120, 0.12);

  color: #75d889;
}

.reviewed-icon.rejected {
  background: rgba(225, 85, 85, 0.12);

  color: #e56b6b;
}

.reviewed-area strong {
  font-size: 0.82rem;
}

.reviewed-area p {
  margin: 0;

  color: #77736b;

  font-size: 0.72rem;
}

/* =====================================================
   ERROR
===================================================== */

.error-message {
  display: flex;

  align-items: flex-start;

  gap: 15px;

  margin-top: 25px;

  padding: 18px;

  border-radius: 13px;

  background: rgba(225, 85, 85, 0.08);

  border: 1px solid rgba(225, 85, 85, 0.25);
}

.error-icon {
  width: 38px;
  height: 38px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: rgba(225, 85, 85, 0.14);

  color: #e56b6b;

  font-weight: 900;
}

.error-content strong {
  color: #e56b6b;
}

.error-content p {
  margin: 4px 0 10px;

  color: #aaa69c;

  font-size: 0.84rem;
}

.try-again-button {
  padding: 8px 12px;

  border: 1px solid #484239;
  border-radius: 8px;

  background: #24221c;

  color: #f5f5f0;

  cursor: pointer;
}

/* =====================================================
   EMPTY / LOADING
===================================================== */

.message-state,
.empty-state {
  padding: 70px 25px;

  text-align: center;
}

.empty-icon {
  width: 65px;
  height: 65px;

  margin: 0 auto 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: rgba(212, 240, 56, 0.1);

  color: #d4f038;

  font-size: 1.6rem;
  font-weight: 900;
}

.empty-state h3,
.message-state h3 {
  margin: 0 0 7px;
}

.empty-state p,
.message-state p {
  max-width: 500px;

  margin: 0 auto;

  color: #77736b;

  line-height: 1.6;
}

.loading-spinner {
  width: 40px;
  height: 40px;

  margin: 0 auto 18px;

  border: 3px solid #302d25;

  border-top-color: #d4f038;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .return-item {
    grid-template-columns: 1fr;
  }

  .return-actions {
    padding-left: 0;

    padding-top: 18px;

    border-left: none;

    border-top: 1px solid #302d25;
  }

  .pending-actions {
    flex-direction: row;

    align-items: center;
  }

  .decision-label {
    display: none;
  }

  .approve-button,
  .reject-button {
    flex: 1;
  }

  .reviewed-area {
    flex-direction: row;

    justify-content: flex-start;

    text-align: left;
  }
}

@media (max-width: 700px) {
  .admin-returns-page {
    padding: 30px 15px 60px;
  }

  .header-content {
    padding: 28px 22px;
  }

  .header-icon {
    display: none;
  }

  .returns-card {
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
  }

  .refresh-button {
    width: 100%;

    justify-content: center;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .return-main {
    flex-direction: column;
  }

  .book-icon {
    width: 55px;
    height: 65px;

    font-size: 1.5rem;
  }

  .book-heading {
    flex-direction: column;
  }

  .request-information {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 450px) {
  .request-information {
    grid-template-columns: 1fr;
  }

  .pending-actions {
    flex-direction: column;
  }

  .approve-button,
  .reject-button {
    width: 100%;
  }

  .return-item {
    padding: 17px;
  }
}
</style>
