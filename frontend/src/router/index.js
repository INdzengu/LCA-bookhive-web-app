// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";

import BrowseBooks from "../views/BrowseBooks.vue";
import SellBooks from "../views/SellBooks.vue";
import CartView from "../views/CartView.vue";
import ReturnsView from "../views/ReturnsView.vue";
import AdminReturnsView from "../views/AdminReturnsView.vue";
import ReviewsView from "../views/ReviewsView.vue";
import AdminReviewsView from "../views/AdminReviewsView.vue";

const routes = [
  { path: "/browse", name: "Browse", component: BrowseBooks },
  { path: "/sell", name: "Sell", component: SellBooks },
  { path: "/cart", name: "Cart", component: CartView },
  { path: "/returns", component: ReturnsView, props: true },
  { path: "/admin/returns", component: AdminReturnsView },
  { path: "/reviews", component: ReviewsView },
  { path: "/admin/reviews", component: AdminReviewsView },
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes,
});

export default router;
