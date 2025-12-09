import { createRouter, createWebHistory } from "vue-router"
import Home from "../pages/Home.vue"
import Shop from "../pages/Shop.vue"
import Rent from "../pages/Rent.vue"
import Sell from "../pages/Sell.vue"
import Lessons from "../pages/Lessons.vue"
import Cart from "../pages/Cart.vue"
import Profile from "../pages/Profile.vue"

const routes = [
  { path: "/", component: Home, name: "Home" },
  { path: "/shop", component: Shop, name: "Shop" },
  { path: "/rent", component: Rent, name: "Rent" },
  { path: "/sell", component: Sell, name: "Sell" },
  { path: "/lessons", component: Lessons, name: "Lessons" },
  { path: "/cart", component: Cart, name: "Cart" },
  { path: "/profile", component: Profile, name: "Profile" },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
