<template>
  <div id="app" class="bookhive-app">
    <!-- NAVBAR -->
    <header class="bookhive-navbar">
      <nav class="navbar-inner">
        <!-- LOGO -->
        <router-link to="/browse" class="brand"> BookHive </router-link>

        <!-- MAIN NAVIGATION -->
        <div class="nav-links">
          <router-link to="/browse"> Browse Books </router-link>

          <!-- STUDENT NAVIGATION -->
          <template v-if="!user || user.role_id === 1">
            <router-link to="/sell"> Sell Books </router-link>

            <router-link to="/cart">
              Cart
              <span class="cart-badge">
                {{ cartCount }}
              </span>
            </router-link>

            <router-link to="/returns"> Returns </router-link>

            <router-link to="/reviews"> Reviews </router-link>
          </template>

          <!-- ADMIN NAVIGATION -->
          <template v-if="user && user.role_id === 2">
            <router-link to="/admin/returns"> Manage Returns </router-link>

            <router-link to="/admin/reviews"> Manage Reviews </router-link>
          </template>
        </div>

        <!-- USER AREA -->
        <div class="user-area">
          <!-- LOGGED OUT -->
          <button v-if="!user" class="login-button" @click="showAuthModal = true">
            Login / Register
          </button>

          <!-- LOGGED IN -->
          <div v-else class="logged-user">
            <div class="user-info">
              <span class="welcome-text"> Welcome, {{ user.full_name }} </span>

              <span v-if="user.role_name" class="role-badge">
                {{ user.role_name }}
              </span>
            </div>

            <button class="logout-button" @click="logout">Logout</button>
          </div>
        </div>
      </nav>
    </header>

    <!-- PAGE CONTENT -->
    <main class="main-content">
      <router-view
        :cart="cart"
        :user="user"
        @add-to-cart="handleAddToCart"
        @remove-from-cart="handleRemoveFromCart"
        @clear-cart="clearCart"
        @open-auth="showAuthModal = true"
      />
    </main>

    <!-- FOOTER -->
    <footer class="bookhive-footer">
      <div class="footer-inner">
        <!-- BRAND -->
        <div class="footer-brand">
          <router-link to="/browse" class="footer-logo"> BookHive </router-link>

          <p>A student marketplace for buying and selling affordable secondhand books.</p>

          <span class="footer-tagline"> Buy smarter. Sell easier. Study better. </span>
        </div>

        <!-- QUICK LINKS -->
        <div class="footer-column">
          <h3>Explore</h3>

          <router-link to="/browse">Browse Books</router-link>
          <router-link to="/sell">Sell Books</router-link>
          <router-link to="/cart">Shopping Cart</router-link>
        </div>

        <!-- ACCOUNT -->
        <div class="footer-column">
          <h3>Account</h3>

          <router-link to="/returns">My Returns</router-link>
          <router-link to="/reviews">My Reviews</router-link>

          <button v-if="!user" class="footer-login" @click="showAuthModal = true">
            Login / Register
          </button>

          <button v-else class="footer-login" @click="logout">Logout</button>
        </div>

        <!-- BUSINESS INFORMATION -->
        <div class="footer-column">
          <h3>BookHive</h3>

          <span>Student-focused marketplace</span>
          <span>Secondhand books</span>
          <span>Affordable learning</span>
          <span>South Africa</span>
        </div>
      </div>

      <!-- FOOTER BOTTOM -->
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <p>© {{ new Date().getFullYear() }} BookHive. All rights reserved.</p>

          <div class="footer-legal">
            <a href="#" @click.prevent>Privacy Policy</a>
            <a href="#" @click.prevent>Terms & Conditions</a>
            <a href="#" @click.prevent>Contact</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- AUTH MODAL -->

    <!-- AUTH MODAL -->
    <AuthModal
      v-if="showAuthModal"
      @close="showAuthModal = false"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script>
/**
 * ============================================
 * APP.VUE - ROOT COMPONENT
 * ============================================
 * This is the main/root component that defines the overall page layout
 *
 * Structure:
 * - Navbar (header with navigation)
 * - Main content area (router-view renders current page)
 * - Footer
 * - Auth modal (login/register popup)
 *
 * Features:
 * - User authentication state management
 * - Shopping cart management
 * - Navigation between pages
 * - Login/logout functionality
 *
 * Author: Iviwe Ndzengu
 * Project: BookHive
 */

import AuthModal from "./components/icons/AuthModal.vue";

export default {
  /**
   * Component name (used for debugging)
   */
  name: "App",

  /**
   * ============================================
   * CHILD COMPONENTS
   * ============================================
   * Components used within this component
   * AuthModal: Pop-up for login/registration
   */
  components: {
    AuthModal,
  },

  /**
   * ============================================
   * DATA PROPERTIES
   * ============================================
   * Reactive data that the component tracks and updates
   * Changes to these properties trigger re-renders
   */
  data() {
    return {
      /**
       * Controls whether the auth modal is visible
       * false = hidden, true = shown
       */
      showAuthModal: false,

      /**
       * Stores current logged-in user information
       * Structure: { user_id, email, full_name, role_id, role_name }
       * null = no user logged in
       */
      user: null,

      /**
       * Array of items in the shopping cart
       * Each item: { product_id, title, price, quantity, ... }
       * Persisted to localStorage so cart survives page refresh
       */
      cart: [],
    };
  },

  /**
   * ============================================
   * COMPUTED PROPERTIES
   * ============================================
   * Derived data calculated from other data
   * Automatically updates when dependencies change
   * These are read-only (unless you provide a setter)
   */
  computed: {
    /**
     * cartCount: Number of items currently in cart
     * Used in navbar to show cart badge with item count
     * Example: If cart has 3 items, shows "3" in cart badge
     */
    cartCount() {
      return this.cart.length;
    },
  },

  /**
   * ============================================
   * LIFECYCLE HOOKS
   * ============================================
   * Functions that run at specific stages of component lifecycle
   */

  /**
   * mounted(): Runs after component is inserted into DOM
   * Perfect for:
   * - Fetching data from API
   * - Restoring state from localStorage
   * - Setting up event listeners
   */
  mounted() {
    /**
     * Try to restore user data from localStorage
     * When user logs in, we save their data to localStorage
     * This allows user to stay logged in after page refresh
     */
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        // Parse JSON string back to object
        this.user = JSON.parse(savedUser);
      } catch (error) {
        // If JSON is corrupted, remove it
        localStorage.removeItem("user");
      }
    }

    /**
     * Try to restore cart from localStorage
     * Users want their cart to persist after page refresh
     */
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
      } catch (error) {
        localStorage.removeItem("cart");
      }
    }
  },

  /**
   * ============================================
   * METHODS
   * ============================================
   * Functions that define component behavior
   * Can be called from template or from other methods
   */
  methods: {
    /**
     * ============================================
     * handleAddToCart(book)
     * ============================================
     * Purpose: Add a book to the shopping cart
     *
     * Parameters:
     *   book: Book object with product_id, title, price, etc.
     *
     * Logic:
     * 1. Check if book already in cart (prevent duplicates)
     * 2. If not, add it to cart array
     * 3. Save updated cart to localStorage
     * 4. Navbar badge updates automatically (computed property)
     */
    handleAddToCart(book) {
      /**
       * Check if this book already exists in cart
       * some() returns true if any item matches the condition
       */
      const exists = this.cart.some((item) => item.product_id === book.product_id);

      if (!exists) {
        // Add book to cart
        this.cart.push(book);

        // Persist to localStorage so it survives refresh
        this.saveCart();
      } else {
        // Book already in cart, show message
        alert("This book is already in your cart.");
      }
    },

    /**
     * ============================================
     * handleRemoveFromCart(productId)
     * ============================================
     * Purpose: Remove a book from the shopping cart
     *
     * Parameters:
     *   productId: ID of the book to remove
     *
     * Logic:
     * 1. Filter cart to exclude the book with this ID
     * 2. Update cart with filtered array
     * 3. Save to localStorage
     * 4. Navbar badge updates automatically
     */
    handleRemoveFromCart(productId) {
      /**
       * filter() returns new array with only items that DON'T match
       * This effectively removes the item with matching productId
       */
      this.cart = this.cart.filter((item) => item.product_id !== productId);

      this.saveCart();
    },

    /**
     * ============================================
     * saveCart()
     * ============================================
     * Purpose: Persist cart to localStorage
     * Called after any cart modification
     */
    saveCart() {
      /**
       * Convert cart array to JSON string and save to localStorage
       * JSON format allows cart to survive browser refresh
       */
      localStorage.setItem("cart", JSON.stringify(this.cart));
    },

    /**
     * ============================================
     * clearCart()
     * ============================================
     * Purpose: Empty the shopping cart completely
     * Called after successful checkout
     */
    clearCart() {
      /**
       * Empty the cart array
       */
      this.cart = [];

      /**
       * Remove cart from localStorage
       */
      localStorage.removeItem("cart");
    },

    /**
     * ============================================
     * handleLoginSuccess(userData)
     * ============================================
     * Purpose: Update app state when user successfully logs in
     *
     * Parameters:
     *   userData: User object returned from login API
     *             Contains: user_id, email, full_name, role_id, role_name, token
     *
     * Logic:
     * 1. Store user data in component data (this.user)
     * 2. Save user to localStorage for persistence
     * 3. Close auth modal
     * 4. Navbar shows "Welcome, [name]" and logout button
     */
    handleLoginSuccess(userData) {
      /**
       * Store user data in component
       * This triggers navbar to show logged-in state
       */
      this.user = userData;

      /**
       * Save to localStorage for persistence after page refresh
       */
      localStorage.setItem("user", JSON.stringify(userData));

      /**
       * Close the auth modal (hide login form)
       */
      this.showAuthModal = false;
    },

    /**
     * ============================================
     * logout()
     * ============================================
     * Purpose: Log out the current user
     *
     * Logic:
     * 1. Clear user data
     * 2. Clear authentication token
     * 3. Redirect to browse page
     * 4. Navbar shows login button again
     */
    logout() {
      /**
       * Clear user data
       * This triggers navbar to show logged-out state
       */
      this.user = null;

      /**
       * Remove user from localStorage
       */
      localStorage.removeItem("user");

      /**
       * Remove JWT token from localStorage
       * Token is needed for API requests that require authentication
       */
      localStorage.removeItem("token");

      /**
       * Redirect to browse page
       * $router.push() is Vue Router method for navigation
       */
      this.$router.push("/browse");
    },
  },
};
</script>
<style scoped>
/* =========================================
   BOOKHIVE COLOUR PALETTE
========================================= */

.bookhive-app {
  --espresso: #2a220f;
  --dark: #12110e;
  --card: #3a3221;
  --lime: #dce546;
  --white: #fbfcfd;
  --grey: #969288;
  --charcoal: #29210f;
  --muted: #6c665a;

  min-height: 100vh;

  background:
    radial-gradient(circle at 80% 10%, rgba(220, 229, 70, 0.06), transparent 30%), var(--dark);

  color: var(--white);
}

/* =========================================
   NAVBAR
========================================= */

.bookhive-navbar {
  position: sticky;

  top: 0;

  z-index: 1000;

  background: rgba(25, 23, 20, 0.96);

  backdrop-filter: blur(12px);

  border-bottom: 1px solid #302e29;
}

.navbar-inner {
  max-width: 1250px;

  margin: auto;

  min-height: 74px;

  padding: 0 25px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 25px;
}

/* =========================================
   LOGO
========================================= */

.brand {
  color: var(--white);

  text-decoration: none;

  font-size: 1.5rem;

  font-weight: 800;

  letter-spacing: -0.04em;

  transition: color 0.2s ease;
}

.brand:hover {
  color: var(--lime);
}

/* =========================================
   NAV LINKS
========================================= */

.nav-links {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 25px;

  flex: 1;
}

.nav-links a {
  color: var(--grey);

  text-decoration: none;

  font-size: 0.9rem;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.nav-links a:hover {
  color: var(--white);
}

.nav-links a.router-link-active {
  color: var(--white);

  font-weight: 600;
}

/* =========================================
   CART
========================================= */

.cart-badge {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 19px;

  height: 19px;

  margin-left: 3px;

  padding: 0 5px;

  border-radius: 50px;

  background: var(--lime);

  color: var(--charcoal);

  font-size: 0.65rem;

  font-weight: 800;
}

/* =========================================
   LOGIN
========================================= */

.login-button {
  padding: 11px 18px;

  border-radius: 50px;

  border: 1px solid #454239;

  background: transparent;

  color: var(--white);

  font-weight: 600;

  cursor: pointer;

  transition: all 0.2s ease;
}

.login-button:hover {
  background: var(--lime);

  color: var(--charcoal);

  border-color: var(--lime);
}

/* =========================================
   USER
========================================= */

.logged-user {
  display: flex;

  align-items: center;

  gap: 14px;
}

.user-info {
  display: flex;

  align-items: center;

  gap: 8px;
}

.welcome-text {
  font-size: 0.85rem;

  color: var(--white);
}

.role-badge {
  padding: 4px 8px;

  border-radius: 50px;

  background: var(--lime);

  color: var(--charcoal);

  font-size: 0.65rem;

  font-weight: 800;
}

.logout-button {
  padding: 8px 14px;

  border: 1px solid #454239;

  border-radius: 50px;

  background: transparent;

  color: var(--grey);

  cursor: pointer;
}

.logout-button:hover {
  color: var(--white);

  border-color: var(--lime);
}

/* =========================================
   MAIN
========================================= */

.main-content {
  min-height: calc(100vh - 74px);
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 900px) {
  .navbar-inner {
    flex-wrap: wrap;

    padding: 15px 20px;
  }

  .nav-links {
    order: 3;

    width: 100%;

    overflow-x: auto;

    justify-content: flex-start;

    padding-bottom: 5px;
  }
}

@media (max-width: 600px) {
  .welcome-text {
    display: none;
  }

  .nav-links {
    gap: 18px;
  }
}
/* =========================================
   FOOTER
========================================= */

.bookhive-footer {
  margin-top: 60px;

  background: #191713;

  border-top: 1px solid #302e29;

  color: var(--white);
}

.footer-inner {
  max-width: 1250px;

  margin: auto;

  padding: 55px 25px 45px;

  display: grid;

  grid-template-columns: 2fr 1fr 1fr 1.3fr;

  gap: 50px;
}

/* =========================================
   FOOTER BRAND
========================================= */

.footer-brand {
  max-width: 330px;
}

.footer-logo {
  display: inline-block;

  margin-bottom: 14px;

  color: var(--white);

  text-decoration: none;

  font-size: 1.6rem;

  font-weight: 800;

  letter-spacing: -0.04em;

  transition: color 0.2s ease;
}

.footer-logo:hover {
  color: var(--lime);
}

.footer-brand p {
  margin: 0 0 14px;

  color: var(--grey);

  font-size: 0.88rem;

  line-height: 1.7;
}

.footer-tagline {
  color: var(--lime);

  font-size: 0.72rem;

  font-weight: 700;

  letter-spacing: 0.04em;
}

/* =========================================
   FOOTER COLUMNS
========================================= */

.footer-column {
  display: flex;

  flex-direction: column;

  align-items: flex-start;

  gap: 11px;
}

.footer-column h3 {
  margin: 0 0 8px;

  color: var(--white);

  font-size: 0.82rem;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 0.1em;
}

.footer-column a,
.footer-column span,
.footer-login {
  color: var(--grey);

  font-size: 0.82rem;

  text-decoration: none;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.footer-column a:hover,
.footer-login:hover {
  color: var(--lime);

  transform: translateX(2px);
}

/* =========================================
   FOOTER LOGIN BUTTON
========================================= */

.footer-login {
  padding: 0;

  border: 0;

  background: transparent;

  font-family: inherit;

  cursor: pointer;
}

/* =========================================
   FOOTER BOTTOM
========================================= */

.footer-bottom {
  border-top: 1px solid #302e29;
}

.footer-bottom-inner {
  max-width: 1250px;

  margin: auto;

  padding: 20px 25px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;
}

.footer-bottom p {
  margin: 0;

  color: #706c64;

  font-size: 0.72rem;
}

.footer-legal {
  display: flex;

  align-items: center;

  gap: 20px;
}

.footer-legal a {
  color: #706c64;

  font-size: 0.72rem;

  text-decoration: none;

  transition: color 0.2s ease;
}

.footer-legal a:hover {
  color: var(--lime);
}

/* =========================================
   FOOTER RESPONSIVE
========================================= */

@media (max-width: 900px) {
  .footer-inner {
    grid-template-columns: repeat(2, 1fr);

    gap: 40px;
  }

  .footer-brand {
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .footer-inner {
    grid-template-columns: 1fr;

    padding: 45px 20px 35px;

    gap: 32px;
  }

  .footer-column {
    gap: 9px;
  }

  .footer-bottom-inner {
    flex-direction: column;

    align-items: flex-start;

    padding: 20px;
  }

  .footer-legal {
    flex-wrap: wrap;

    gap: 12px 18px;
  }
}
</style>
