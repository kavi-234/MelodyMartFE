import { createRouter, createWebHistory } from "vue-router"
import Home from "../views/HomeView.vue"
import Shop from "../views/ShopView.vue"
import Rent from "../views/RentalsView.vue"
import Lessons from "../views/LessonsView.vue"
import Repairs from "../views/RepairsView.vue"

const routes = [
  { path: "/", component: Home, name: "Home" },
  { path: "/shop", component: Shop, name: "Shop" },
  { path: "/rent", component: Rent, name: "Rent" },
  { path: "/lessons", component: Lessons, name: "Lessons" },
  { path: "/repairs", component: Repairs, name: "Repairs" },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
