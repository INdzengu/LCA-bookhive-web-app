/**
 * ============================================
 * BOOKHIVE FRONTEND - MAIN ENTRY POINT
 * ============================================
 * This file initializes the Vue.js application
 *
 * Flow:
 * 1. Import global styles
 * 2. Create Vue app instance
 * 3. Import router and components
 * 4. Mount to DOM
 *
 * Author: Iviwe Ndzengu
 * Project: BookHive - Secondhand Book Marketplace
 */

/**
 * Import global CSS styles
 * These styles apply to the entire application
 */
import "./assets/main.css";

/**
 * Import Vue.js core functionality
 * createApp: Factory function to create a Vue application
 */
import { createApp } from "vue";

/**
 * Import the root Vue component (App.vue)
 * This is the top-level component that renders the page layout
 * All other components are nested inside App.vue
 */
import App from "./App.vue";

/**
 * Import Vue Router for client-side routing
 * This allows navigation between different pages/views without full page reload
 */
import router from "./router";

/**
 * Create the Vue application instance
 * This initializes the entire Vue app with App.vue as the root component
 */
const app = createApp(App);

/**
 * ============================================
 * BOOTSTRAP CSS FRAMEWORK
 * ============================================
 * Import Bootstrap CSS for responsive design and UI components
 * These styles provide:
 * - Grid system for responsive layouts
 * - Buttons, forms, navigation components
 * - Utility classes for spacing, typography, etc.
 */
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Import Bootstrap JavaScript bundle
 * Provides interactive components:
 * - Modals (pop-up dialogs)
 * - Dropdowns
 * - Tooltips
 * - Navbars
 * etc.
 */
import "bootstrap/dist/js/bootstrap.bundle.min.js";

/**
 * ============================================
 * REGISTER ROUTER
 * ============================================
 * Use Vue Router for the application
 * This enables client-side routing for single-page app navigation
 */
app.use(router);

/**
 * ============================================
 * MOUNT TO DOM
 * ============================================
 * Mount the Vue application to the #app element in index.html
 * After this, Vue takes over and renders the interface
 *
 * The #app element is in public/index.html:
 *   <div id="app"></div>
 */
app.mount("#app");
