import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShopView.vue'),
    },
    {
      path: '/rentals',
      name: 'rentals',
      component: () => import('../views/RentalsView.vue'),
    },
    {
      path: '/lessons',
      name: 'lessons',
      component: () => import('../views/LessonsView.vue'),
    },
    {
      path: '/repairs',
      name: 'repairs',
      component: () => import('../views/RepairsView.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router
