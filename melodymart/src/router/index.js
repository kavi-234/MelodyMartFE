import { createRouter, createWebHistory } from "vue-router"
import Home from "../views/HomeView.vue"
import Shop from "../views/ShopView.vue"
import Rent from "../views/RentalsView.vue"
import Lessons from "../views/LessonsView.vue"
import Repairs from "../views/RepairsView.vue"
import Auth from "../views/AuthView.vue"
import CompleteProfile from "../views/CompleteProfileView.vue"

const routes = [
  { path: "/", component: Home, name: "Home" },
  { path: "/shop", component: Shop, name: "Shop" },
  { path: "/rent", component: Rent, name: "Rent" },
  { path: "/lessons", component: Lessons, name: "Lessons" },
  { path: "/repairs", component: Repairs, name: "Repairs" },
  { path: "/auth", component: Auth, name: "Auth" },
  { path: "/complete-profile", component: CompleteProfile, name: "CompleteProfile" },
  { path: "/dashboard/customer", component: () => import("../views/CustomerDashboard.vue"), name: "CustomerDashboard" },
  { path: "/dashboard/tutor", component: () => import("../views/TutorDashboard.vue"), name: "TutorDashboard" },
  { path: "/dashboard/repair", component: () => import("../views/RepairDashboard.vue"), name: "RepairDashboard" },
  { path: "/dashboard/admin", component: () => import("../views/AdminDashboard.vue"), name: "AdminDashboard" },
  { path: "/settings", component: () => import("../views/SettingsView.vue"), name: "Settings" },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
