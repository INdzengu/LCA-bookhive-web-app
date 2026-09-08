<template>
  <div class="browse-page">
    <!-- Page Header -->
    <section class="page-header">
      <div>
        <p class="section-label">BOOKHIVE MARKETPLACE</p>
        <h1>Find Your Next Book</h1>
        <p class="subtitle">
          Browse affordable secondhand books from students across the BookHive marketplace.
        </p>
      </div>

      <div class="book-count">
        <strong>{{ filteredBooks.length }}</strong>
        <span>{{ filteredBooks.length === 1 ? "book" : "books" }} available</span>
      </div>
    </section>

    <!-- Search and Filters -->
    <section class="filter-panel">
      <div class="filter-header">
        <div>
          <p class="section-label">MARKETPLACE SEARCH</p>
          <h2>Find a book</h2>
        </div>

        <button v-if="hasActiveFilters" type="button" class="clear-button" @click="clearFilters">
          Clear Filters
        </button>
      </div>

      <div class="filter-grid">
        <!-- Title -->
        <div class="filter-group">
          <label for="title-search">Search by title</label>

          <div class="input-wrapper">
            <span class="input-icon">⌕</span>

            <input
              id="title-search"
              v-model="filters.title"
              type="search"
              class="form-control"
              placeholder="e.g. Economics..."
            />
          </div>
        </div>

        <!-- Author -->
        <div class="filter-group">
          <label for="author-search">Search by author</label>

          <div class="input-wrapper">
            <span class="input-icon">♙</span>

            <input
              id="author-search"
              v-model="filters.author"
              type="search"
              class="form-control"
              placeholder="e.g. John Smith..."
            />
          </div>
        </div>

        <!-- Category -->
        <div class="filter-group">
          <label for="category-filter">Category</label>

          <select id="category-filter" v-model="filters.category" class="form-select">
            <option value="">All categories</option>

            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="active-label">Active filters:</span>

        <span v-if="filters.title" class="filter-tag"> Title: {{ filters.title }} </span>

        <span v-if="filters.author" class="filter-tag"> Author: {{ filters.author }} </span>

        <span v-if="filters.category" class="filter-tag">
          {{ filters.category }}
        </span>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="message-card">
      <div class="loading-spinner"></div>
      <h3>Loading the marketplace...</h3>
      <p>We're finding books for you.</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="message-card error-card">
      <div class="message-icon">!</div>
      <h3>Something went wrong</h3>
      <p>{{ errorMessage }}</p>

      <button type="button" class="retry-button" @click="fetchBooks">Try Again</button>
    </div>

    <!-- Books -->
    <template v-else>
      <div class="results-header">
        <div>
          <span class="results-title">
            {{ filteredBooks.length === books.length ? "All Books" : "Search Results" }}
          </span>

          <span class="results-number">
            {{ filteredBooks.length }}
          </span>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredBooks.length === 0" class="message-card empty-card">
        <div class="message-icon">⌕</div>

        <h3>No books found</h3>

        <p>We couldn't find any books matching your search. Try changing your filters.</p>

        <button type="button" class="primary-button" @click="clearFilters">View All Books</button>
      </div>

      <!-- Book Grid -->
      <div v-else class="book-grid">
        <article v-for="book in filteredBooks" :key="book.product_id" class="book-card">
          <!-- Automatic Book Cover -->
          <div class="book-cover" :class="getCoverClass(book.category_name)">
            <div class="cover-top">
              <span>BOOKHIVE</span>
              <span>SECONDHAND</span>
            </div>

            <div class="cover-middle">
              <span class="cover-category">
                {{ getShortCategory(book.category_name) }}
              </span>

              <h3>{{ book.title }}</h3>

              <div class="cover-line"></div>

              <p>{{ book.author || "Unknown Author" }}</p>
            </div>

            <div class="cover-bottom">
              <span v-if="book.course_code">
                {{ book.course_code }}
              </span>

              <span v-else>
                {{ getCategoryShortName(book.category_name) }}
              </span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="book-content">
            <div class="book-meta">
              <span class="availability" :class="{ unavailable: !Number(book.is_available) }">
                <span class="status-dot"></span>
                {{ Number(book.is_available) ? "Available" : "Unavailable" }}
              </span>

              <span v-if="book.condition_name" class="condition">
                {{ book.condition_name }}
              </span>
            </div>

            <h3 class="book-title">{{ book.title }}</h3>

            <p class="author">
              {{ book.author || "Unknown Author" }}
            </p>

            <p class="category">
              {{ book.category_name || "Other" }}
            </p>

            <p v-if="book.course_code" class="course">
              <span>Course:</span> {{ book.course_code }}
            </p>

            <div class="seller">
              <span class="seller-icon">●</span>
              <span>Sold by {{ book.seller_name || "BookHive seller" }}</span>
            </div>

            <div class="card-footer">
              <div class="price-container">
                <span class="price-label">PRICE</span>
                <strong>R{{ Number(book.price).toFixed(2) }}</strong>
              </div>

              <!-- Student -->
              <button
                v-if="!user || user.role_id === 1"
                type="button"
                class="cart-button"
                :disabled="!Number(book.is_available)"
                @click="$emit('add-to-cart', book)"
              >
                <span>+</span>
                {{ Number(book.is_available) ? "Add to Cart" : "Unavailable" }}
              </button>

              <!-- Admin -->
              <span v-else class="admin-label"> Admin View </span>
            </div>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "BrowseBooks",

  props: {
    user: {
      type: Object,
      default: null,
    },
  },

  emits: ["add-to-cart"],

  data() {
    return {
      books: [],
      loading: false,
      errorMessage: "",

      filters: {
        title: "",
        author: "",
        category: "",
      },
    };
  },

  computed: {
    /*
     * Return unique categories from the API.
     */
    categories() {
      return [...new Set(this.books.map((book) => book.category_name).filter(Boolean))].sort();
    },

    /*
     * Filter books using title, author and category.
     *
     * Multiple filters can be used at the same time.
     */
    filteredBooks() {
      const titleSearch = this.filters.title.trim().toLowerCase();
      const authorSearch = this.filters.author.trim().toLowerCase();
      const selectedCategory = this.filters.category;

      return this.books.filter((book) => {
        const matchesTitle =
          !titleSearch ||
          String(book.title || "")
            .toLowerCase()
            .includes(titleSearch);

        const matchesAuthor =
          !authorSearch ||
          String(book.author || "")
            .toLowerCase()
            .includes(authorSearch);

        const matchesCategory = !selectedCategory || book.category_name === selectedCategory;

        return matchesTitle && matchesAuthor && matchesCategory;
      });
    },

    /*
     * Used to decide whether the Clear Filters button
     * and active-filter indicators should appear.
     */
    hasActiveFilters() {
      return (
        this.filters.title.trim() !== "" ||
        this.filters.author.trim() !== "" ||
        this.filters.category !== ""
      );
    },
  },

  mounted() {
    this.fetchBooks();
  },

  methods: {
    /*
     * Load books from the backend.
     */
    async fetchBooks() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await fetch("http://localhost:5000/api/products");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load books.");
        }

        this.books = data.data || [];
      } catch (error) {
        console.error("Failed to load books:", error);

        this.errorMessage = "We couldn't load the books right now. Please try again.";
      } finally {
        this.loading = false;
      }
    },

    /*
     * Reset all filters.
     */
    clearFilters() {
      this.filters = {
        title: "",
        author: "",
        category: "",
      };
    },

    /*
     * Generate a different visual cover style
     * depending on the book category.
     */
    getCoverClass(category) {
      const categoryName = String(category || "").toLowerCase();

      if (categoryName.includes("textbook")) {
        return "cover-textbook";
      }

      if (categoryName.includes("novel")) {
        return "cover-novel";
      }

      if (categoryName.includes("writing")) {
        return "cover-writing";
      }

      return "cover-default";
    },

    /*
     * Short category label for the cover.
     */
    getShortCategory(category) {
      const categoryName = String(category || "");

      if (categoryName.includes("Textbook")) {
        return "TEXTBOOK";
      }

      if (categoryName.includes("Novel")) {
        return "NOVEL";
      }

      if (categoryName.includes("Writing")) {
        return "WRITING";
      }

      return "BOOK";
    },

    /*
     * Small label at the bottom of the generated cover.
     */
    getCategoryShortName(category) {
      const categoryName = String(category || "");

      if (categoryName.includes("Textbook")) {
        return "ACADEMIC";
      }

      if (categoryName.includes("Novel")) {
        return "LITERATURE";
      }

      if (categoryName.includes("Writing")) {
        return "STATIONERY";
      }

      return "BOOKHIVE";
    },
  },
};
</script>

<style scoped>
/* =========================================
   PAGE
========================================= */

.browse-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 55px 25px 90px;
  color: #fbfcfd;
}

/* =========================================
   PAGE HEADER
========================================= */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 38px;
}

.section-label {
  margin: 0 0 10px;
  color: #dce546;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.page-header h1 {
  margin: 0 0 12px;
  font-size: clamp(2.1rem, 5vw, 3.3rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.subtitle {
  max-width: 650px;
  margin: 0;
  color: #969288;
  font-size: 1rem;
  line-height: 1.7;
}

.book-count {
  min-width: 145px;
  padding: 18px 20px;
  border: 1px solid #6c665a;
  border-radius: 15px;
  background: #3a3221;
  text-align: center;
}

.book-count strong {
  display: block;
  color: #dce546;
  font-size: 1.7rem;
}

.book-count span {
  color: #969288;
  font-size: 0.78rem;
}

/* =========================================
   FILTER PANEL
========================================= */

.filter-panel {
  margin-bottom: 35px;
  padding: 25px;
  border: 1px solid #6c665a;
  border-radius: 20px;
  background: #3a3221;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.16);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.filter-header h2 {
  margin: 0;
  font-size: 1.35rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 0.8fr;
  gap: 17px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  color: #fbfcfd;
  font-size: 0.8rem;
  font-weight: 700;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  z-index: 2;
  color: #969288;
  font-size: 1.2rem;
  transform: translateY(-52%);
}

.form-control,
.form-select {
  min-height: 46px;
  border: 1px solid #6c665a;
  border-radius: 10px;
  background-color: #29210f;
  color: #fbfcfd;
  font-size: 0.88rem;
  box-shadow: none;
}

.input-wrapper .form-control {
  padding-left: 42px;
}

.form-control::placeholder {
  color: #6c665a;
}

.form-control:focus,
.form-select:focus {
  border-color: #dce546;
  background-color: #29210f;
  color: #fbfcfd;
  box-shadow: 0 0 0 0.2rem rgba(220, 229, 70, 0.12);
}

.form-select option {
  background: #29210f;
  color: #fbfcfd;
}

.clear-button {
  padding: 9px 15px;
  border: 1px solid #6c665a;
  border-radius: 9px;
  background: transparent;
  color: #fbfcfd;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-button:hover {
  border-color: #dce546;
  color: #dce546;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid #6c665a;
}

.active-label {
  color: #969288;
  font-size: 0.75rem;
}

.filter-tag {
  padding: 6px 10px;
  border-radius: 20px;
  background: #dce546;
  color: #29210f;
  font-size: 0.72rem;
  font-weight: 800;
}

/* =========================================
   RESULTS HEADER
========================================= */

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.results-title {
  color: #fbfcfd;
  font-size: 0.95rem;
  font-weight: 800;
}

.results-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 25px;
  height: 25px;
  margin-left: 8px;
  padding: 0 7px;
  border-radius: 20px;
  background: #dce546;
  color: #29210f;
  font-size: 0.72rem;
  font-weight: 800;
}

/* =========================================
   BOOK GRID
========================================= */

.book-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 23px;
}

/* =========================================
   BOOK CARD
========================================= */

.book-card {
  overflow: hidden;
  border: 1px solid #6c665a;
  border-radius: 18px;
  background: #3a3221;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.14);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.book-card:hover {
  border-color: #dce546;
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
}

/* =========================================
   AUTOMATIC BOOK COVERS
========================================= */

.book-cover {
  position: relative;
  height: 245px;
  overflow: hidden;
  padding: 20px;
  color: #fbfcfd;
}

.cover-textbook {
  background: linear-gradient(135deg, #29210f 0%, #4b422d 100%);
}

.cover-novel {
  background: linear-gradient(135deg, #3a3221 0%, #29210f 100%);
}

.cover-writing {
  background: linear-gradient(135deg, #514b30 0%, #29210f 100%);
}

.cover-default {
  background: linear-gradient(135deg, #3a3221 0%, #29210f 100%);
}

.book-cover::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -80px;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: rgba(220, 229, 70, 0.1);
}

.book-cover::after {
  content: "";
  position: absolute;
  bottom: -60px;
  left: -60px;
  width: 160px;
  height: 160px;
  border: 1px solid rgba(220, 229, 70, 0.18);
  border-radius: 50%;
}

.cover-top {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  color: #dce546;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.cover-middle {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 28px;
  right: 28px;
  transform: translateY(-50%);
}

.cover-category {
  color: #dce546;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.cover-middle h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: 9px 0;
  color: #fbfcfd;
  font-size: 1.45rem;
  line-height: 1.15;
  font-weight: 800;
  -webkit-box-orient: vertical;
}

.cover-line {
  width: 42px;
  height: 3px;
  margin: 13px 0;
  border-radius: 5px;
  background: #dce546;
}

.cover-middle p {
  overflow: hidden;
  margin: 0;
  color: #969288;
  font-size: 0.78rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.cover-bottom {
  position: absolute;
  right: 20px;
  bottom: 18px;
  left: 20px;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  color: #969288;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

/* =========================================
   BOOK CONTENT
========================================= */

.book-content {
  padding: 21px;
}

.book-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 13px;
}

.availability,
.condition {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  font-size: 0.67rem;
  font-weight: 800;
}

.availability {
  padding: 6px 9px;
  background: rgba(220, 229, 70, 0.1);
  color: #dce546;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dce546;
}

.availability.unavailable {
  background: rgba(150, 146, 136, 0.12);
  color: #969288;
}

.availability.unavailable .status-dot {
  background: #969288;
}

.condition {
  color: #969288;
}

.book-title {
  display: -webkit-box;
  overflow: hidden;
  min-height: 45px;
  margin: 0 0 5px;
  color: #fbfcfd;
  font-size: 1.08rem;
  line-height: 1.35;
  font-weight: 800;
  -webkit-box-orient: vertical;
}

.author {
  overflow: hidden;
  margin: 0;
  color: #969288;
  font-size: 0.84rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.category {
  display: inline-block;
  margin: 12px 0 0;
  color: #dce546;
  font-size: 0.7rem;
  font-weight: 700;
}

.course {
  margin: 9px 0 0;
  color: #969288;
  font-size: 0.72rem;
}

.course span {
  color: #6c665a;
}

.seller {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid #6c665a;
  color: #969288;
  font-size: 0.7rem;
}

.seller-icon {
  color: #dce546;
  font-size: 0.5rem;
}

.card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.price-container {
  display: flex;
  flex-direction: column;
}

.price-label {
  margin-bottom: 2px;
  color: #6c665a;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.price-container strong {
  color: #dce546;
  font-size: 1.3rem;
  line-height: 1.1;
}

.cart-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 13px;
  border: none;
  border-radius: 9px;
  background: #dce546;
  color: #29210f;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.cart-button span {
  font-size: 1rem;
  line-height: 0.8;
}

.cart-button:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.cart-button:disabled {
  background: #6c665a;
  color: #969288;
  cursor: not-allowed;
}

.admin-label {
  padding: 9px 12px;
  border: 1px solid #6c665a;
  border-radius: 9px;
  color: #969288;
  font-size: 0.7rem;
  font-weight: 700;
}

/* =========================================
   MESSAGE STATES
========================================= */

.message-card {
  padding: 55px 25px;
  border: 1px solid #6c665a;
  border-radius: 18px;
  background: #3a3221;
  text-align: center;
}

.message-card h3 {
  margin: 12px 0 7px;
  color: #fbfcfd;
}

.message-card p {
  max-width: 500px;
  margin: 0 auto;
  color: #969288;
  line-height: 1.6;
}

.message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(220, 229, 70, 0.12);
  color: #dce546;
  font-size: 1.4rem;
  font-weight: 800;
}

.error-card .message-icon {
  background: rgba(255, 100, 100, 0.1);
  color: #ff9b9b;
}

.primary-button,
.retry-button {
  margin-top: 20px;
  padding: 11px 17px;
  border: none;
  border-radius: 9px;
  background: #dce546;
  color: #29210f;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.primary-button:hover,
.retry-button:hover {
  transform: translateY(-1px);
}

.retry-button {
  margin-top: 18px;
}

.loading-spinner {
  width: 38px;
  height: 38px;
  margin: 0 auto;
  border: 3px solid #6c665a;
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
   TABLET
========================================= */

@media (max-width: 950px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .filter-group:last-child {
    grid-column: span 2;
  }

  .book-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 650px) {
  .browse-page {
    padding: 35px 16px 60px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 28px;
  }

  .page-header h1 {
    font-size: 2.2rem;
  }

  .book-count {
    width: 100%;
  }

  .filter-panel {
    padding: 18px;
    border-radius: 15px;
  }

  .filter-header {
    align-items: flex-start;
  }

  .filter-header h2 {
    font-size: 1.15rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-group:last-child {
    grid-column: auto;
  }

  .clear-button {
    flex-shrink: 0;
  }

  .book-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .book-cover {
    height: 230px;
  }

  .card-footer {
    align-items: center;
  }

  .cart-button {
    padding: 10px 12px;
  }
}

/* =========================================
   SMALL MOBILE
========================================= */

@media (max-width: 400px) {
  .filter-header {
    flex-direction: column;
  }

  .clear-button {
    width: 100%;
  }

  .book-content {
    padding: 18px;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .cart-button,
  .admin-label {
    justify-content: center;
    text-align: center;
  }
}
</style>
