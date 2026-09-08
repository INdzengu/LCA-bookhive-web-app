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
      <router-link to="/browse" class="footer-logo">
        BookHive
      </router-link>

      <p>
        A student marketplace for buying and selling
        affordable secondhand books.
      </p>

      <span class="footer-tagline">
        Buy smarter. Sell easier. Study better.
      </span>
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

      <button
        v-if="!user"
        class="footer-login"
        @click="showAuthModal = true"
      >
        Login / Register
      </button>

      <button
        v-else
        class="footer-login"
        @click="logout"
      >
        Logout
      </button>
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

      <p>
        © {{ new Date().getFullYear() }} BookHive.
        All rights reserved.
      </p>

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
import AuthModal from "./components/icons/AuthModal.vue";

export default {
  name: "App",

  components: {
    AuthModal,
  },

  data() {
    return {
      showAuthModal: false,

      user: null,

      cart: [],
    };
  },

  computed: {
    cartCount() {
      return this.cart.length;
    },
  },

  mounted() {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch (error) {
        localStorage.removeItem("user");
      }
    }

    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
      } catch (error) {
        localStorage.removeItem("cart");
      }
    }
  },

  methods: {
    handleAddToCart(book) {
      const exists = this.cart.some((item) => item.product_id === book.product_id);

      if (!exists) {
        this.cart.push(book);

        this.saveCart();
      } else {
        alert("This book is already in your cart.");
      }
    },

    handleRemoveFromCart(productId) {
      this.cart = this.cart.filter((item) => item.product_id !== productId);

      this.saveCart();
    },

    saveCart() {
      localStorage.setItem("cart", JSON.stringify(this.cart));
    },

    clearCart() {
      this.cart = [];

      localStorage.removeItem("cart");
    },

    handleLoginSuccess(userData) {
      this.user = userData;

      localStorage.setItem("user", JSON.stringify(userData));

      this.showAuthModal = false;
    },

    logout() {
      this.user = null;

      localStorage.removeItem("user");

      localStorage.removeItem("token");

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
