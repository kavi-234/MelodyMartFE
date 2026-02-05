import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

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
    {
      path: '/complete-profile',
      name: 'complete-profile',
      component: () => import('../views/CompleteProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/customer',
      name: 'customer-dashboard',
      component: () => import('../views/CustomerDashboard.vue'),
      meta: { requiresAuth: true, role: 'customer', requiresApproval: true }
    },
    {
      path: '/dashboard/tutor',
      name: 'tutor-dashboard',
      component: () => import('../views/TutorDashboard.vue'),
      meta: { requiresAuth: true, role: 'tutor', requiresApproval: true }
    },
    {
      path: '/dashboard/repair',
      name: 'repair-dashboard',
      component: () => import('../views/RepairDashboard.vue'),
      meta: { requiresAuth: true, role: 'repair_specialist', requiresApproval: true }
    },
    {
      path: '/dashboard/admin',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/auth')
  }
  
  // If user is authenticated
  if (authStore.isAuthenticated && authStore.user) {
    // Check if user account is rejected
    if (authStore.isRejected && to.name !== 'auth' && to.name !== 'home') {
      alert('Your account has been rejected. Please contact support.')
      authStore.logout()
      return next('/auth')
    }
    
    // Check if route requires approval (for tutor/repair specialist)
    if (to.meta.requiresApproval) {
      if (authStore.isPendingApproval && to.name !== 'home') {
        alert('Your account is pending admin approval. Please wait for approval to access this page.')
        return next('/')
      }
      
      // Check if user has approved status
      if ((authStore.user.role === 'tutor' || authStore.user.role === 'repair_specialist') && 
          !authStore.isApproved && to.name !== 'home') {
        return next('/')
      }
    }
    
    // Check if route requires specific role
    if (to.meta.role && authStore.user.role !== to.meta.role) {
      // Redirect to appropriate dashboard
      return next(`/dashboard/${authStore.user.role}`)
    }
    
    // Redirect from auth page if already logged in and approved
    if (to.name === 'auth' && authStore.isApproved) {
      return next(`/dashboard/${authStore.user.role}`)
    }
  }
  
  next()
})

export default router
