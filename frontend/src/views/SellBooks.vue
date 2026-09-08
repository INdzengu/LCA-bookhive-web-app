<template>
  <div class="sell-page">
    <!-- Page Header -->
    <section class="page-header">
      <p class="section-tag">BOOKHIVE MARKETPLACE</p>
      <h1>Sell Your Book</h1>
      <p class="subtitle">
        Give your books a second life by listing them for other students to buy.
      </p>
    </section>

    <!-- Login Required -->
    <div v-if="!user" class="message-card">
      <div class="message-icon">🔐</div>

      <div>
        <p class="section-tag">ACCOUNT REQUIRED</p>
        <h2>Ready to sell a book?</h2>
        <p>Please log in to your BookHive account before listing a book for sale.</p>
      </div>
    </div>

    <!-- Sell Form -->
    <section v-else class="form-section">
      <div class="form-card">
        <div class="form-header">
          <div>
            <p class="section-tag">CREATE LISTING</p>
            <h2>Book Information</h2>
            <p>Provide accurate information so buyers know exactly what they are purchasing.</p>
          </div>

          <div class="book-icon">📚</div>
        </div>

        <form ref="sellForm" class="needs-validation" novalidate @submit.prevent="submitListing">
          <div class="row g-4">
            <!-- Book Title -->
            <div class="col-12">
              <label for="book-title" class="form-label"> Book Title </label>

              <input
                id="book-title"
                v-model.trim="form.title"
                type="text"
                class="form-control"
                placeholder="Enter the book title"
                minlength="4"
                pattern="[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s'-]{3,}"
                required
              />

              <div class="valid-feedback">Looks good!</div>

              <div class="invalid-feedback">
                Please enter a valid book title with at least 4 letters.
              </div>
            </div>

            <!-- Author -->
            <div class="col-md-6">
  <label for="book-author" class="form-label">
    Author
  </label>

  <input
    id="book-author"
    v-model.trim="form.author"
    type="text"
    class="form-control"
    placeholder="Enter the author's name"
    minlength="4"
    pattern="[A-Za-zÀ-ÿ]+([.'-][A-Za-zÀ-ÿ]+|[ ]+)*"
    required
  />

  <div class="valid-feedback">
    Author name looks good!
  </div>

  <div class="invalid-feedback">
    Please enter appropriate author name
  </div>
</div>
            <!-- Course Code -->
            <div class="col-md-6">
              <label for="course-code" class="form-label">
                Course Code
                <span class="optional">(Optional)</span>
              </label>

              <input
                id="course-code"
                v-model.trim="form.course_code"
                type="text"
                class="form-control"
                placeholder="e.g. INF2001"
                pattern="[A-Za-z]{2,6}[0-9]{3,5}"
              />

              <div class="valid-feedback">Course code looks good!</div>

              <div class="invalid-feedback">
                Please enter a valid course code, for example INF2001.
              </div>
            </div>

            <!-- Price -->
            <div class="col-md-6">
              <label for="book-price" class="form-label">Price</label>

              <div class="input-group has-validation">
                <span class="input-group-text">R</span>

                <input
                  id="book-price"
                  v-model.number="form.price"
                  type="number"
                  class="form-control"
                  placeholder="0.00"
                  min="0.01"
                  max="3000"
                  step="0.01"
                  required
                />

                <div class="invalid-feedback">
                  Please enter a price greater than R0 and no more than R3,000.
                </div>
              </div>

              <div class="form-text">Price must be between R0.01 and R3,000.</div>

              <div class="valid-feedback">Valid price.</div>
            </div>
            <!-- Category -->
            <div class="col-md-6">
              <label for="book-category" class="form-label"> Category </label>

              <select id="book-category" v-model="form.category_id" class="form-select" required>
                <option value="" disabled>Select a category</option>
                <option value="1">School & University Textbooks</option>
                <option value="2">Reading Novels</option>
                <option value="3">Writing Books</option>
              </select>

              <div class="valid-feedback">Category selected.</div>

              <div class="invalid-feedback">Please select a category.</div>
            </div>

            <!-- Condition -->
            <div class="col-md-6">
              <label for="book-condition" class="form-label"> Condition </label>

              <select id="book-condition" v-model="form.condition_id" class="form-select" required>
                <option value="" disabled>Select the book condition</option>
                <option value="1">Like New</option>
                <option value="2">Good</option>
                <option value="3">Fair</option>
              </select>

              <div class="valid-feedback">Condition selected.</div>

              <div class="invalid-feedback">Please select the book's condition.</div>
            </div>
          </div>

          <!-- Server Message -->
          <div
            v-if="message"
            class="alert message-alert mt-4"
            :class="isError ? 'alert-danger' : 'alert-success'"
            role="alert"
          >
            <strong v-if="isError">Something went wrong:</strong>
            <strong v-else>Success!</strong>
            {{ message }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="submit" class="btn post-button" :disabled="isSubmitting">
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>

              {{ isSubmitting ? "Posting Book..." : "Post Book" }}
            </button>
          </div>
        </form>
      </div>

      <!-- Selling Tips -->
      <aside class="tips-card">
        <div class="tips-icon">💡</div>

        <div>
          <h3>Tips for a great listing</h3>

          <ul>
            <li>Use the book's full title.</li>
            <li>Enter the correct author name.</li>
            <li>Choose the category that best matches your book.</li>
            <li>Be honest about the book's condition.</li>
            <li>Set a fair price for other students.</li>
          </ul>
        </div>
      </aside>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SellBooks",

  props: {
    user: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      isSubmitting: false,
      message: "",
      isError: false,
      formSubmitted: false,

      form: {
        title: "",
        author: "",
        course_code: "",
        price: "",
        category_id: "",
        condition_id: "",
      },
    };
  },

  methods: {
    async submitListing() {
      this.message = "";
      this.isError = false;

      // Get the Bootstrap form
      const form = this.$refs.sellForm;

      // Activate validation only after the user clicks Post Book
      this.formSubmitted = true;
      form.classList.add("was-validated");

      // Stop if Bootstrap validation fails
      if (!form.checkValidity()) {
        return;
      }

      // Additional price validation
      const price = Number(this.form.price);

      if (price <= 0 || price > 3000) {
        this.message = "Price must be greater than R0 and no more than R3,000.";
        this.isError = true;
        return;
      }

      this.isSubmitting = true;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const token = localStorage.getItem("token");

      // Check authentication token
      if (!token) {
        this.message = "Your session has expired. Please log in again.";
        this.isError = true;
        this.isSubmitting = false;
        return;
      }

      try {
        // Do not send seller_id.
        // The backend must get seller_id from the authenticated JWT.
        const response = await axios.post(
          `${apiUrl}/api/products`,
          {
            title: this.form.title,
            author: this.form.author,
            course_code: this.form.course_code || null,
            price: price,
            category_id: Number(this.form.category_id),
            condition_id: Number(this.form.condition_id),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          this.message = "Your book has been successfully listed!";

          this.isError = false;

          // Reset form
          this.form = {
            title: "",
            author: "",
            course_code: "",
            price: "",
            category_id: "",
            condition_id: "",
          };

          // Remove Bootstrap validation state
          form.classList.remove("was-validated");

          // Reset validation flag
          this.formSubmitted = false;

          // Scroll to the top
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      } catch (err) {
        console.error("Create product error:", err);

        this.isError = true;

        if (err.response?.status === 401) {
          this.message = "Your session has expired. Please log in again.";
        } else if (err.response?.status === 403) {
          this.message = "You are not authorised to sell books.";
        } else if (err.response?.status === 400) {
          this.message = err.response?.data?.message || "Please check the information you entered.";
        } else if (err.response?.status >= 500) {
          this.message = "The server encountered a problem. Please try again.";
        } else if (err.request) {
          this.message =
            "Unable to connect to BookHive. Please make sure the backend server is running.";
        } else {
          this.message = "Something went wrong while listing your book.";
        }
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>
<style scoped>
/* =========================================
   BOOKHIVE SELL BOOKS PAGE
   ========================================= */

.sell-page {
  max-width: 1150px;
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
   LOGIN MESSAGE
   ========================================= */

.message-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px;
  background: #3a3221;
  border: 1px solid #6c665a;
  border-radius: 18px;
}

.message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 55px;
  height: 55px;
  background: #dce546;
  border-radius: 14px;
  font-size: 1.5rem;
}

.message-card h2 {
  margin: 0 0 6px;
  color: #fbfcfd;
  font-size: 1.35rem;
}

.message-card p:not(.section-tag) {
  margin: 0;
  color: #969288;
}

/* =========================================
   FORM SECTION
   ========================================= */

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  padding: 32px;
  background: #3a3221;
  border: 1px solid #6c665a;
  border-radius: 20px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
}

.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 22px;
  border-bottom: 1px solid #6c665a;
}

.form-header h2 {
  margin: 0 0 8px;
  color: #fbfcfd;
  font-size: 1.55rem;
}

.form-header p:not(.section-tag) {
  margin: 0;
  color: #969288;
}

.book-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  height: 58px;
  background: #dce546;
  border-radius: 16px;
  font-size: 1.7rem;
  transform: rotate(3deg);
}

/* =========================================
   BOOTSTRAP FORM CONTROLS
   ========================================= */

.form-label {
  margin-bottom: 8px;
  color: #fbfcfd;
  font-weight: 600;
}

.optional {
  color: #969288;
  font-size: 0.8rem;
  font-weight: 400;
}

.form-control,
.form-select,
.input-group-text {
  min-height: 48px;
  background-color: #29210f;
  border-color: #6c665a;
  color: #fbfcfd;
}

.form-control::placeholder {
  color: #6c665a;
}

.form-control:focus,
.form-select:focus {
  background-color: #29210f;
  color: #fbfcfd;
  border-color: #dce546;
  box-shadow: 0 0 0 0.2rem rgba(220, 229, 70, 0.15);
}

.form-select {
  cursor: pointer;
}

.form-select option {
  background: #29210f;
  color: #fbfcfd;
}

.input-group-text {
  color: #dce546;
  font-weight: 800;
}

.form-text {
  color: #969288;
}

/* Bootstrap validation feedback */

.invalid-feedback {
  color: #ff9b9b;
}

.valid-feedback {
  color: #dce546;
}

/* =========================================
   BUTTON
   ========================================= */

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #6c665a;
}

.post-button {
  min-width: 170px;
  min-height: 48px;
  padding: 10px 22px;
  background: #dce546;
  border: none;
  border-radius: 10px;
  color: #2a220f;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.post-button:hover:not(:disabled) {
  background: #e7ef62;
  color: #2a220f;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 229, 70, 0.18);
}

.post-button:active:not(:disabled) {
  transform: translateY(0);
}

.post-button:disabled {
  opacity: 0.7;
}

/* =========================================
   ALERT
   ========================================= */

.message-alert {
  border-radius: 12px;
}

.alert-success {
  background: rgba(220, 229, 70, 0.1);
  border-color: #dce546;
  color: #dce546;
}

.alert-danger {
  background: rgba(220, 70, 70, 0.1);
  border-color: #9e5555;
  color: #ffb0b0;
}

/* =========================================
   TIPS
   ========================================= */

.tips-card {
  display: flex;
  gap: 18px;
  padding: 24px;
  background: #29210f;
  border: 1px solid #6c665a;
  border-radius: 16px;
}

.tips-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  height: 45px;
  background: #3a3221;
  border-radius: 12px;
  font-size: 1.3rem;
}

.tips-card h3 {
  margin: 0 0 12px;
  color: #fbfcfd;
  font-size: 1rem;
}

.tips-card ul {
  margin: 0;
  padding-left: 18px;
  color: #969288;
}

.tips-card li {
  margin-bottom: 6px;
}

.tips-card li:last-child {
  margin-bottom: 0;
}

/* =========================================
   RESPONSIVE
   ========================================= */

@media (max-width: 768px) {
  .sell-page {
    padding: 35px 18px 60px;
  }

  .form-card {
    padding: 22px;
  }

  .form-header {
    margin-bottom: 24px;
  }

  .message-card {
    align-items: flex-start;
    padding: 22px;
  }

  .form-actions {
    justify-content: stretch;
  }

  .post-button {
    width: 100%;
  }
}

@media (max-width: 500px) {
  .form-header {
    flex-direction: column;
  }

  .book-icon {
    min-width: 50px;
    height: 50px;
  }

  .tips-card {
    flex-direction: column;
  }
}
/* =========================================
   BOOTSTRAP VALIDATION VISIBILITY
   ========================================= */

/* Hide validation messages before submission */
.form-control ~ .valid-feedback,
.form-control ~ .invalid-feedback,
.form-select ~ .valid-feedback,
.form-select ~ .invalid-feedback,
.input-group ~ .valid-feedback,
.input-group ~ .invalid-feedback {
  display: none;
}

/* Show validation messages only after Bootstrap
   adds the was-validated class */
.was-validated .form-control:valid ~ .valid-feedback,
.was-validated .form-select:valid ~ .valid-feedback,
.was-validated .form-control:invalid ~ .invalid-feedback,
.was-validated .form-select:invalid ~ .invalid-feedback {
  display: block;
}

/* Price input is inside an input group */
.was-validated .input-group .form-control:valid ~ .valid-feedback {
  display: block;
}

.was-validated .input-group .form-control:invalid ~ .invalid-feedback {
  display: block;
}
</style>
