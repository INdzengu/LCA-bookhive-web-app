<template>
  <div class="reviews-page">
    <!-- Page Header -->
    <section class="page-header">
      <p class="section-tag">BOOKHIVE REVIEWS</p>

      <h1>My Reviews</h1>

      <p class="subtitle">
        Review books you have purchased and share your experience with other
        BookHive users.
      </p>
    </section>

    <!-- Login message -->
    <div v-if="!user" class="message-card login-card">
      <div class="message-icon">🔐</div>

      <div>
        <h3>Login required</h3>

        <p>
          Please log in to view and submit your reviews.
        </p>

        <button
          type="button"
          class="primary-button"
          @click="$emit('open-auth')"
        >
          Login / Register
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="message-card loading-card">
      <div class="loading-spinner"></div>

      <p>Loading your purchases and reviews...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="message-card error-card">
      <div class="message-icon">!</div>

      <div>
        <h3>Something went wrong</h3>

        <p>{{ errorMessage }}</p>

        <button
          type="button"
          class="secondary-button"
          @click="loadReviews"
        >
          Try Again
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Success message -->
      <div v-if="successMessage" class="success-card">
        <div class="success-icon">✓</div>

        <div>
          <h3>Review submitted</h3>
          <p>{{ successMessage }}</p>
        </div>

        <button
          type="button"
          class="success-close"
          @click="successMessage = ''"
          aria-label="Close success message"
        >
          ×
        </button>
      </div>

      <!-- Purchases waiting for review -->
      <section class="review-section">
        <div class="section-heading">
          <div>
            <p class="section-tag">YOUR PURCHASES</p>

            <h2>Books waiting for your review</h2>

            <p class="section-description">
              Share your experience to help other students make better choices.
            </p>
          </div>

          <span class="count-badge">
            {{ reviewableTransactions.length }}
          </span>
        </div>

        <!-- Empty state -->
        <div
          v-if="reviewableTransactions.length === 0"
          class="empty-card"
        >
          <div class="empty-icon">✓</div>

          <h3>You're all caught up</h3>

          <p>
            You don't have any purchases waiting for a review.
          </p>
        </div>

        <!-- Reviewable books -->
        <div v-else class="review-grid">
          <article
            v-for="transaction in reviewableTransactions"
            :key="transaction.transaction_id"
            class="review-card"
          >
            <div class="book-info">
              <div class="book-cover">
                <span>📖</span>
              </div>

              <div class="book-details">
                <h3>{{ transaction.title }}</h3>

                <p
                  v-if="transaction.author"
                  class="book-author"
                >
                  {{ transaction.author }}
                </p>

                <p class="seller">
                  Sold by {{ transaction.seller_name }}
                </p>

                <p class="price">
                  R{{ Number(transaction.price).toFixed(2) }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="primary-button full-button"
              @click="startReview(transaction)"
            >
              Write a Review
            </button>
          </article>
        </div>
      </section>

      <!-- Review Form -->
      <section
        v-if="selectedTransaction"
        class="review-form-section"
      >
        <div
          class="form-card"
          :class="{ 'was-validated': validationAttempted }"
        >
          <button
            type="button"
            class="close-button"
            @click="cancelReview"
            :disabled="submitting"
            aria-label="Close review form"
          >
            ×
          </button>

          <p class="section-tag">WRITE YOUR REVIEW</p>

          <h2>{{ selectedTransaction.title }}</h2>

          <p class="form-description">
            How was your experience with this book?
          </p>

          <form
            class="needs-validation"
            novalidate
            @submit.prevent="submitReview"
          >
            <!-- Rating -->
            <div class="rating-area">
              <label class="form-label">
                Your rating
                <span class="required">*</span>
              </label>

              <div
                class="stars"
                :class="{
                  'rating-invalid':
                    validationAttempted && !reviewForm.rating,
                  'rating-valid':
                    validationAttempted && reviewForm.rating,
                }"
              >
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="star-button"
                  :class="{
                    selected: star <= reviewForm.rating,
                  }"
                  @click="selectRating(star)"
                  :aria-label="`${star} star${star > 1 ? 's' : ''}`"
                >
                  ★
                </button>
              </div>

              <p
                v-if="!validationAttempted || reviewForm.rating"
                class="rating-text"
              >
                {{ ratingText }}
              </p>

              <div
                v-if="validationAttempted && !reviewForm.rating"
                class="invalid-feedback rating-feedback"
              >
                Please select a rating before submitting your review.
              </div>

              <div
                v-else-if="validationAttempted && reviewForm.rating"
                class="valid-feedback rating-feedback"
              >
                Rating selected.
              </div>
            </div>

            <!-- Comment -->
            <div class="form-group">
              <label
                for="review-comment"
                class="form-label"
              >
                Your review
                <span class="optional-label">(optional)</span>
              </label>

              <textarea
                id="review-comment"
                v-model="reviewForm.comment"
                rows="5"
                maxlength="500"
                class="form-control"
                :class="{
                  'is-invalid':
                    validationAttempted &&
                    reviewForm.comment.length > 500,
                  'is-valid':
                    validationAttempted &&
                    reviewForm.comment.length <= 500 &&
                    reviewForm.comment.trim().length > 0,
                }"
                placeholder="Tell other students about your experience with this book..."
              ></textarea>

              <div class="character-row">
                <small
                  :class="{
                    'character-warning':
                      reviewForm.comment.length > 450,
                    'character-danger':
                      reviewForm.comment.length >= 500,
                  }"
                >
                  {{ reviewForm.comment.length }}/500
                </small>
              </div>

              <div
                v-if="
                  validationAttempted &&
                  reviewForm.comment.length > 500
                "
                class="invalid-feedback"
              >
                Your review cannot exceed 500 characters.
              </div>

              <div
                v-else-if="
                  validationAttempted &&
                  reviewForm.comment.trim().length > 0
                "
                class="valid-feedback"
              >
                Your review is ready to submit.
              </div>
            </div>

            <!-- Server/API error -->
            <div
              v-if="formError"
              class="form-error"
              role="alert"
            >
              <span class="error-icon">!</span>
              {{ formError }}
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button
                type="button"
                class="secondary-button"
                @click="cancelReview"
                :disabled="submitting"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="primary-button"
                :disabled="submitting"
              >
                {{
                  submitting
                    ? "Submitting..."
                    : "Submit Review"
                }}
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Existing reviews -->
      <section class="review-section">
        <div class="section-heading">
          <div>
            <p class="section-tag">YOUR HISTORY</p>

            <h2>Reviews you've written</h2>

            <p class="section-description">
              Your previous reviews are saved here.
            </p>
          </div>

          <span class="count-badge">
            {{ myReviews.length }}
          </span>
        </div>

        <!-- Empty history -->
        <div
          v-if="myReviews.length === 0"
          class="empty-card"
        >
          <div class="empty-icon">☆</div>

          <h3>No reviews yet</h3>

          <p>
            Your submitted reviews will appear here.
          </p>
        </div>

        <!-- Review history -->
        <div v-else class="submitted-reviews">
          <article
            v-for="review in myReviews"
            :key="review.review_id"
            class="submitted-review"
          >
            <div class="submitted-header">
              <div>
                <h3>{{ review.title }}</h3>

                <p v-if="review.author">
                  {{ review.author }}
                </p>
              </div>

              <span class="review-date">
                {{ formatDate(review.created_at) }}
              </span>
            </div>

            <div class="submitted-rating">
              <span
                v-for="star in 5"
                :key="star"
                :class="{
                  filled: star <= review.rating,
                }"
              >
                ★
              </span>

              <span class="rating-number">
                {{ review.rating }}/5
              </span>
            </div>

            <p
              v-if="review.comment"
              class="review-comment"
            >
              "{{ review.comment }}"
            </p>

            <p class="seller-name">
              Seller: {{ review.seller_name }}
            </p>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
export default {
  name: "ReviewsView",

  props: {
    user: {
      type: Object,
      default: null,
    },
  },

  emits: ["open-auth"],

  data() {
    return {
      reviewableTransactions: [],
      myReviews: [],

      selectedTransaction: null,

      reviewForm: {
        rating: 0,
        comment: "",
      },

      loading: false,
      submitting: false,

      errorMessage: "",
      formError: "",
      successMessage: "",

      // Controls when Bootstrap-style validation is displayed
      validationAttempted: false,
    };
  },

  computed: {
    ratingText() {
      const ratings = {
        0: "Select a rating",
        1: "Poor",
        2: "Below average",
        3: "Good",
        4: "Very good",
        5: "Excellent",
      };

      return ratings[this.reviewForm.rating];
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
        this.reviewableTransactions = [];
        this.myReviews = [];
        this.selectedTransaction = null;
      }
    },
  },

  methods: {
    getApiUrl() {
      return (
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000"
      );
    },

    getToken() {
      return localStorage.getItem("token");
    },

    async loadReviews() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const token = this.getToken();

        const [reviewableResponse, reviewsResponse] =
          await Promise.all([
            fetch(
              `${this.getApiUrl()}/api/reviews/reviewable`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),

            fetch(`${this.getApiUrl()}/api/reviews/my`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const reviewableData =
          await reviewableResponse.json();

        const reviewsData =
          await reviewsResponse.json();

        if (!reviewableResponse.ok) {
          throw new Error(
            reviewableData.message ||
              "Failed to load reviewable purchases."
          );
        }

        if (!reviewsResponse.ok) {
          throw new Error(
            reviewsData.message ||
              "Failed to load your reviews."
          );
        }

        this.reviewableTransactions =
          reviewableData.data || [];

        this.myReviews = reviewsData.data || [];
      } catch (error) {
        console.error(
          "Reviews loading error:",
          error
        );

        this.errorMessage =
          error.message ||
          "Unable to load your reviews.";
      } finally {
        this.loading = false;
      }
    },

    startReview(transaction) {
      this.selectedTransaction = transaction;

      this.reviewForm = {
        rating: 0,
        comment: "",
      };

      this.formError = "";
      this.successMessage = "";

      // Important:
      // Do NOT show validation when the form first opens.
      this.validationAttempted = false;

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    cancelReview() {
      this.selectedTransaction = null;

      this.reviewForm = {
        rating: 0,
        comment: "",
      };

      this.formError = "";
      this.validationAttempted = false;
    },

    selectRating(star) {
      this.reviewForm.rating = star;

      // If the user has already attempted submission,
      // update validation immediately after choosing a rating.
      if (this.validationAttempted) {
        this.formError = "";
      }
    },

    validateReviewForm() {
      this.validationAttempted = true;

      let isValid = true;

      // Rating is required
      if (!this.reviewForm.rating) {
        isValid = false;
      }

      // Comment cannot exceed 500 characters
      if (this.reviewForm.comment.length > 500) {
        isValid = false;
      }

      return isValid;
    },

    async submitReview() {
      this.formError = "";

      // Run client-side validation first
      const isValid = this.validateReviewForm();

      if (!isValid) {
        this.formError =
          "Please correct the highlighted fields before submitting.";

        return;
      }

      this.submitting = true;

      try {
        const token = this.getToken();

        const response = await fetch(
          `${this.getApiUrl()}/api/reviews`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              transaction_id:
                this.selectedTransaction.transaction_id,

              rating: this.reviewForm.rating,

              comment:
                this.reviewForm.comment.trim(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to submit your review."
          );
        }

        // Close the form
        this.selectedTransaction = null;

        this.reviewForm = {
          rating: 0,
          comment: "",
        };

        this.validationAttempted = false;

        this.successMessage =
          "Thank you for sharing your experience with the BookHive community.";

        await this.loadReviews();

        // Automatically remove success message after a few seconds
        setTimeout(() => {
          this.successMessage = "";
        }, 5000);
      } catch (error) {
        console.error(
          "Review submission error:",
          error
        );

        this.formError =
          error.message ||
          "Unable to submit your review.";
      } finally {
        this.submitting = false;
      }
    },

    formatDate(date) {
      if (!date) {
        return "";
      }

      return new Date(date).toLocaleDateString(
        "en-ZA",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    },
  },
};
</script>

<style scoped>
/* =========================================
   BOOKHIVE REVIEWS PAGE
========================================= */

.reviews-page {
  min-height: 100vh;
  padding: 40px 6% 80px;
  background: #2a220f;
  color: #fbfcfd;
}

/* =========================================
   PAGE HEADER
========================================= */

.page-header {
  max-width: 850px;
  margin: 0 auto 55px;
  text-align: center;
}

.section-tag {
  margin: 0 0 10px;
  color: #dce546;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  color: #fbfcfd;
  font-size: clamp(2.2rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.subtitle {
  max-width: 680px;
  margin: 16px auto 0;
  color: #969288;
  font-size: 1.05rem;
  line-height: 1.7;
}

/* =========================================
   MESSAGE CARDS
========================================= */

.message-card {
  max-width: 900px;
  margin: 0 auto 45px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 22px;
  border: 1px solid #6c665a;
  border-radius: 18px;
  background: #3a3221;
}

.message-card h3 {
  margin: 0 0 7px;
  color: #fbfcfd;
  font-size: 1.2rem;
}

.message-card p {
  margin: 0 0 18px;
  color: #969288;
}

.message-icon {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dce546;
  color: #2a220f;
  font-size: 1.4rem;
  font-weight: 800;
}

.loading-card {
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.loading-card p {
  margin: 0;
}

.loading-spinner {
  width: 38px;
  height: 38px;
  border: 4px solid #6c665a;
  border-top-color: #dce546;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-card {
  border-color: rgba(220, 229, 70, 0.45);
}

.error-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  border-radius: 50%;
  background: #dce546;
  color: #2a220f;
  font-weight: 800;
}

/* =========================================
   SUCCESS CARD
========================================= */

.success-card {
  max-width: 900px;
  margin: 0 auto 35px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  border: 1px solid rgba(220, 229, 70, 0.45);
  border-radius: 16px;
  background: #3a3221;
}

.success-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dce546;
  color: #2a220f;
  font-weight: 900;
}

.success-card h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.success-card p {
  margin: 0;
  color: #969288;
  font-size: 0.92rem;
}

.success-close {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #969288;
  font-size: 1.6rem;
  cursor: pointer;
}

/* =========================================
   SECTIONS
========================================= */

.review-section {
  max-width: 1200px;
  margin: 0 auto 65px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 25px;
}

.section-heading h2 {
  margin: 0;
  color: #fbfcfd;
  font-size: clamp(1.5rem, 3vw, 2.15rem);
  font-weight: 750;
}

.section-description {
  margin: 8px 0 0;
  color: #969288;
  font-size: 0.92rem;
}

.count-badge {
  min-width: 42px;
  height: 42px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dce546;
  color: #2a220f;
  font-weight: 800;
}

/* =========================================
   EMPTY STATE
========================================= */

.empty-card {
  padding: 55px 25px;
  text-align: center;
  border: 1px solid #6c665a;
  border-radius: 18px;
  background: #3a3221;
}

.empty-icon {
  width: 62px;
  height: 62px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(220, 229, 70, 0.12);
  color: #dce546;
  font-size: 1.8rem;
}

.empty-card h3 {
  margin: 0 0 8px;
  color: #fbfcfd;
}

.empty-card p {
  margin: 0;
  color: #969288;
}

/* =========================================
   REVIEWABLE BOOK GRID
========================================= */

.review-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.review-card {
  padding: 23px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 255px;
  border: 1px solid #6c665a;
  border-radius: 18px;
  background: #3a3221;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.review-card:hover {
  transform: translateY(-4px);
  border-color: #dce546;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.book-info {
  display: flex;
  gap: 17px;
  margin-bottom: 25px;
}

.book-cover {
  width: 62px;
  height: 82px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #2a220f;
  border: 1px solid #6c665a;
  font-size: 1.8rem;
}

.book-details {
  min-width: 0;
}

.book-details h3 {
  margin: 0 0 6px;
  color: #fbfcfd;
  font-size: 1.05rem;
  line-height: 1.35;
}

.book-author {
  margin: 0 0 8px;
  color: #969288;
  font-size: 0.9rem;
}

.seller {
  margin: 0 0 7px;
  color: #6c665a;
  font-size: 0.82rem;
}

.price {
  margin: 0;
  color: #dce546;
  font-weight: 800;
  font-size: 1rem;
}

/* =========================================
   BUTTONS
========================================= */

.primary-button,
.secondary-button {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 750;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    background 0.2s ease;
}

.primary-button {
  border: 1px solid #dce546;
  background: #dce546;
  color: #2a220f;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  opacity: 0.92;
}

.secondary-button {
  border: 1px solid #6c665a;
  background: transparent;
  color: #fbfcfd;
}

.secondary-button:hover:not(:disabled) {
  border-color: #dce546;
  color: #dce546;
}

.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.full-button {
  width: 100%;
}

/* =========================================
   REVIEW FORM
========================================= */

.review-form-section {
  max-width: 900px;
  margin: 0 auto 70px;
}

.form-card {
  position: relative;
  padding: 35px;
  border: 1px solid #6c665a;
  border-radius: 20px;
  background: #3a3221;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
}

.close-button {
  position: absolute;
  top: 18px;
  right: 20px;
  width: 38px;
  height: 38px;
  border: 1px solid #6c665a;
  border-radius: 50%;
  background: transparent;
  color: #969288;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: 0.2s ease;
}

.close-button:hover:not(:disabled) {
  border-color: #dce546;
  color: #dce546;
}

.form-card h2 {
  margin: 5px 50px 8px 0;
  color: #fbfcfd;
  font-size: 1.7rem;
}

.form-description {
  margin: 0 0 30px;
  color: #969288;
}

.form-group {
  margin-top: 28px;
}

.form-label,
.rating-area > label {
  display: block;
  margin-bottom: 10px;
  color: #fbfcfd;
  font-weight: 650;
}

.required {
  color: #dce546;
}

.optional-label {
  color: #969288;
  font-size: 0.8rem;
  font-weight: 400;
}

/* =========================================
   STAR RATING
========================================= */

.rating-area {
  margin-top: 25px;
}

.stars {
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: 10px;
}

.star-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #6c665a;
  font-size: 2.2rem;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    color 0.15s ease;
}

.star-button:hover {
  color: #dce546;
  transform: scale(1.1);
}

.star-button.selected {
  color: #dce546;
}

.rating-invalid {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.rating-valid {
  border-color: rgba(220, 229, 70, 0.45);
}

.rating-text {
  margin: 8px 0 0;
  color: #969288;
  font-size: 0.9rem;
}

.rating-feedback {
  display: block;
  margin-top: 8px;
}

/* =========================================
   TEXTAREA / BOOTSTRAP VALIDATION
========================================= */

.form-control {
  width: 100%;
  min-height: 130px;
  padding: 13px 15px;
  resize: vertical;
  border: 1px solid #6c665a;
  border-radius: 10px;
  outline: none;
  background: #29210f;
  color: #fbfcfd;
  font: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-control::placeholder {
  color: #6c665a;
}

.form-control:focus {
  border-color: #dce546;
  box-shadow: 0 0 0 3px rgba(220, 229, 70, 0.12);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-valid {
  border-color: #dce546;
}

.invalid-feedback {
  display: block;
  margin-top: 7px;
  color: #dc3545;
  font-size: 0.82rem;
}

.valid-feedback {
  display: block;
  margin-top: 7px;
  color: #dce546;
  font-size: 0.82rem;
}

.character-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 7px;
}

.character-row small {
  color: #969288;
}

.character-warning {
  color: #dce546 !important;
}

.character-danger {
  color: #dc3545 !important;
  font-weight: 700;
}

/* =========================================
   FORM ERROR
========================================= */

.form-error {
  margin: 22px 0 0;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(220, 53, 69, 0.45);
  border-radius: 9px;
  background: rgba(220, 53, 69, 0.08);
  color: #dc3545;
  font-size: 0.9rem;
}

.form-actions {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* =========================================
   SUBMITTED REVIEWS
========================================= */

.submitted-reviews {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submitted-review {
  padding: 24px;
  border: 1px solid #6c665a;
  border-radius: 16px;
  background: #3a3221;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.submitted-review:hover {
  border-color: #dce546;
  transform: translateY(-2px);
}

.submitted-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.submitted-header h3 {
  margin: 0 0 5px;
  color: #fbfcfd;
  font-size: 1.05rem;
}

.submitted-header p {
  margin: 0;
  color: #969288;
  font-size: 0.9rem;
}

.review-date {
  flex-shrink: 0;
  color: #969288;
  font-size: 0.82rem;
}

.submitted-rating {
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.submitted-rating > span:not(.rating-number) {
  color: #6c665a;
  font-size: 1.2rem;
}

.submitted-rating > span.filled {
  color: #dce546;
}

.rating-number {
  margin-left: 8px;
  color: #969288;
  font-size: 0.8rem;
}

.review-comment {
  margin: 0 0 15px;
  padding-left: 15px;
  border-left: 2px solid #dce546;
  color: #fbfcfd;
  font-size: 0.95rem;
  line-height: 1.65;
  font-style: italic;
}

.seller-name {
  margin: 0;
  color: #6c665a;
  font-size: 0.82rem;
}

/* =========================================
   ANIMATION
========================================= */

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 950px) {
  .review-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .reviews-page {
    padding: 30px 5% 60px;
  }

  .page-header {
    margin-bottom: 40px;
  }

  .message-card {
    align-items: flex-start;
  }

  .section-heading {
    align-items: flex-start;
  }

  .review-grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 26px 20px;
  }

  .stars {
    padding-left: 0;
  }

  .star-button {
    font-size: 2rem;
  }
}

@media (max-width: 500px) {
  .section-heading {
    flex-direction: column;
    gap: 12px;
  }

  .count-badge {
    min-width: 38px;
    height: 38px;
  }

  .message-card {
    flex-direction: column;
  }

  .submitted-header {
    flex-direction: column;
    gap: 8px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }

  .book-info {
    align-items: flex-start;
  }
}
</style>