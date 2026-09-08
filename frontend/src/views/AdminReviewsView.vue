<template>
  <div class="admin-reviews-page">
    <section class="page-header">
      <p class="section-tag">ADMINISTRATION</p>
      <h1>Book Reviews</h1>
      <p class="subtitle">
        View all reviews submitted by BookHive users and monitor feedback on books and sellers.
      </p>
    </section>

    <!-- Summary -->
    <section class="summary-grid">
      <div class="summary-card">
        <span>Total Reviews</span>
        <strong>{{ reviews.length }}</strong>
      </div>

      <div class="summary-card">
        <span>5 Star</span>
        <strong>{{ fiveStarCount }}</strong>
      </div>

      <div class="summary-card">
        <span>4 Star</span>
        <strong>{{ fourStarCount }}</strong>
      </div>

      <div class="summary-card">
        <span>Average Rating</span>
        <strong>{{ averageRating }}</strong>
      </div>
    </section>

    <!-- Reviews -->
    <section class="reviews-card">
      <div class="card-header">
        <div>
          <p class="section-tag">ALL REVIEWS</p>
          <h2>Customer Reviews</h2>
        </div>

        <button class="refresh-button" @click="loadReviews" :disabled="loading">
          {{ loading ? "Refreshing..." : "Refresh" }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="message">Loading reviews...</div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="message-card error-card">
        <h3>Something went wrong</h3>
        <p>{{ errorMessage }}</p>

        <button class="secondary-button" @click="loadReviews">Try Again</button>
      </div>

      <!-- Empty -->
      <div v-else-if="reviews.length === 0" class="empty-state">
        <div class="empty-icon">☆</div>
        <h3>No reviews yet</h3>
        <p>No users have submitted any book reviews yet.</p>
      </div>

      <!-- Review list -->
      <div v-else class="review-list">
        <article v-for="review in reviews" :key="review.review_id" class="review-item">
          <!-- Book information -->
          <div class="review-main">
            <div class="book-icon">📖</div>

            <div class="review-details">
              <h3>{{ review.title }}</h3>

              <p v-if="review.author" class="author">
                {{ review.author }}
              </p>

              <div class="reviewer-information">
                <p>
                  <strong>Reviewed by:</strong>
                  {{ review.buyer_name }}
                </p>

                <p>
                  <strong>Email:</strong>
                  {{ review.buyer_email }}
                </p>

                <p>
                  <strong>Seller:</strong>
                  {{ review.seller_name }}
                </p>

                <p>
                  <strong>Transaction:</strong>
                  #{{ review.transaction_id }}
                </p>
              </div>

              <!-- Rating -->
              <div class="rating">
                <span
                  v-for="star in 5"
                  :key="star"
                  :class="{ filled: star <= Number(review.rating) }"
                >
                  ★
                </span>

                <span class="rating-number"> {{ review.rating }}/5 </span>
              </div>

              <!-- Comment -->
              <div v-if="review.comment" class="comment-box">
                <p>"{{ review.comment }}"</p>
              </div>

              <span class="review-date"> Submitted {{ formatDate(review.created_at) }} </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "AdminReviewsView",

  props: {
    user: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      reviews: [],
      loading: false,
      errorMessage: "",
    };
  },

  computed: {
    fiveStarCount() {
      return this.reviews.filter((review) => Number(review.rating) === 5).length;
    },

    fourStarCount() {
      return this.reviews.filter((review) => Number(review.rating) === 4).length;
    },

    averageRating() {
      if (this.reviews.length === 0) {
        return "0.0";
      }

      const total = this.reviews.reduce((sum, review) => sum + Number(review.rating), 0);

      return (total / this.reviews.length).toFixed(1);
    },
  },

  mounted() {
    if (this.user) {
      this.loadReviews();
    }
  },

  watch: {
    user(newUser) {
      if (newUser) {
        this.loadReviews();
      } else {
        this.reviews = [];
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

    async loadReviews() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const token = this.getToken();

        if (!token) {
          throw new Error("You must be logged in as an administrator.");
        }

        const response = await fetch(`${this.getApiUrl()}/api/reviews/admin`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load all reviews.");
        }

        this.reviews = data.data || [];
      } catch (error) {
        console.error("Admin reviews loading error:", error);

        this.errorMessage = error.message || "Unable to load reviews.";
      } finally {
        this.loading = false;
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
  },
};
</script>
<style scoped>
/* =====================================================
   PAGE
===================================================== */

.admin-reviews-page {
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

.section-tag {
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

.subtitle {
  max-width: 680px;

  margin: 0;

  color: #a09d95;

  font-size: 1rem;
  line-height: 1.7;
}

/* =====================================================
   OPTIONAL HEADER ICON
===================================================== */

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

.summary-card span {
  display: block;

  color: #8e8a81;

  font-size: 0.76rem;
  font-weight: 600;
}

.summary-card strong {
  display: block;

  margin-top: 4px;

  color: #f5f5f0;

  font-size: 1.6rem;
}

/* =====================================================
   SUMMARY ICONS
===================================================== */

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

.five-star-icon {
  background: rgba(212, 240, 56, 0.13);
  color: #d4f038;
}

.four-star-icon {
  background: rgba(212, 240, 56, 0.09);
  color: #c7d938;
}

.rating-icon {
  background: rgba(105, 210, 120, 0.12);
  color: #75d889;
}

/* =====================================================
   MAIN REVIEWS CARD
===================================================== */

.reviews-card {
  max-width: 1150px;

  margin: 0 auto;

  padding: 30px;

  border-radius: 22px;

  background: #1a1915;

  border: 1px solid #302d25;
}

/* =====================================================
   CARD HEADER
===================================================== */

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

/* =====================================================
   REFRESH BUTTON
===================================================== */

.refresh-button {
  display: flex;
  align-items: center;
  justify-content: center;

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

/* =====================================================
   REVIEW LIST
===================================================== */

.review-list {
  display: flex;

  flex-direction: column;

  gap: 17px;

  padding-top: 25px;
}

.review-item {
  padding: 23px;

  border-radius: 17px;

  background: #201f1a;

  border: 1px solid #302d25;

  transition:
    border-color 0.25s ease,
    transform 0.25s ease,
    background 0.25s ease;
}

.review-item:hover {
  border-color: #454136;

  background: #24221c;

  transform: translateY(-2px);
}

/* =====================================================
   REVIEW MAIN
===================================================== */

.review-main {
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

/* =====================================================
   REVIEW DETAILS
===================================================== */

.review-details {
  flex: 1;

  min-width: 0;
}

.review-details h3 {
  margin: 0 0 5px;

  color: #f5f5f0;

  font-size: 1.25rem;

  line-height: 1.3;
}

.author {
  margin: 0 0 17px;

  color: #918d84;

  font-size: 0.88rem;
}

/* =====================================================
   REVIEWER INFORMATION
===================================================== */

.reviewer-information {
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 10px;

  margin-bottom: 15px;
}

.reviewer-information p {
  margin: 0;

  padding: 11px 12px;

  overflow: hidden;

  border-radius: 10px;

  background: #191814;

  border: 1px solid #2b2922;

  color: #aaa69c;

  font-size: 0.76rem;

  line-height: 1.5;

  text-overflow: ellipsis;
}

.reviewer-information strong {
  display: block;

  margin-bottom: 4px;

  color: #666259;

  font-size: 0.62rem;

  font-weight: 800;

  letter-spacing: 0.08em;

  text-transform: uppercase;
}

/* =====================================================
   RATING
===================================================== */

.rating {
  display: flex;

  align-items: center;

  gap: 3px;

  margin-bottom: 15px;
}

.rating span:not(.rating-number) {
  color: #4b473c;

  font-size: 1.1rem;
}

.rating span.filled {
  color: #d4f038;
}

.rating-number {
  margin-left: 8px;

  color: #aaa69c;

  font-size: 0.76rem;
  font-weight: 700;
}

/* =====================================================
   COMMENT
===================================================== */

.comment-box {
  position: relative;

  margin-bottom: 15px;

  padding: 15px 17px;

  border-radius: 11px;

  background: #181713;

  border-left: 3px solid #d4f038;
}

.comment-box::before {
  content: "REVIEW";

  display: block;

  margin-bottom: 7px;

  color: #d4f038;

  font-size: 0.66rem;
  font-weight: 800;

  letter-spacing: 0.1em;
}

.comment-box p {
  margin: 0;

  color: #aaa69c;

  font-size: 0.84rem;

  line-height: 1.65;
}

/* =====================================================
   REVIEW DATE
===================================================== */

.review-date {
  display: inline-block;

  color: #68645b;

  font-size: 0.7rem;
}

/* =====================================================
   ERROR / MESSAGE
===================================================== */

.message {
  padding: 55px 25px;

  text-align: center;

  color: #77736b;
}

.message-card {
  max-width: 1150px;

  margin: 0 auto;

  padding: 25px;

  border-radius: 15px;

  background: #201f1a;

  border: 1px solid #302d25;
}

.message-card h3 {
  margin: 0 0 7px;

  color: #f5f5f0;
}

.message-card p {
  margin: 0 0 18px;

  color: #aaa69c;

  line-height: 1.6;
}

.error-card {
  margin-top: 25px;

  background: rgba(225, 85, 85, 0.07);

  border-color: rgba(225, 85, 85, 0.25);
}

.error-card h3 {
  color: #e56b6b;
}

/* =====================================================
   BUTTONS
===================================================== */

.secondary-button {
  padding: 10px 15px;

  border: 1px solid #484239;

  border-radius: 9px;

  background: #24221c;

  color: #f5f5f0;

  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

.secondary-button:hover {
  border-color: #d4f038;

  color: #d4f038;

  transform: translateY(-2px);
}

/* =====================================================
   EMPTY STATE
===================================================== */

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

.empty-state h3 {
  margin: 0 0 7px;

  color: #f5f5f0;
}

.empty-state p {
  max-width: 500px;

  margin: 0 auto;

  color: #77736b;

  line-height: 1.6;
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .reviewer-information {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .admin-reviews-page {
    padding: 30px 15px 60px;
  }

  .header-content {
    padding: 28px 22px;
  }

  .header-icon {
    display: none;
  }

  .reviews-card {
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

  .review-main {
    flex-direction: column;
  }

  .book-icon {
    width: 55px;
    height: 65px;

    font-size: 1.5rem;
  }

  .reviewer-information {
    grid-template-columns: repeat(2, 1fr);
  }

  .review-item {
    padding: 19px;
  }
}

@media (max-width: 450px) {
  .reviewer-information {
    grid-template-columns: 1fr;
  }

  .review-item {
    padding: 17px;
  }

  .rating {
    flex-wrap: wrap;
  }
}
</style>
