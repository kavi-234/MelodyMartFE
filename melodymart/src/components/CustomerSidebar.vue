<template>
  <aside :class="['customer-sidebar', { open: isOpen, collapsed: collapsed }]">
    <div class="sidebar-inner">

      <nav class="menu">
        <RouterLink v-for="item in items" :key="item.path" :to="item.path" class="menu-item" :class="{ active: isActive(item.path) }" @click="onMenuClick(item)">
          <span class="icon" v-html="item.icon"></span>
          <span class="label">{{ item.label }}</span>
          <span v-if="item.path.endsWith('/lessons') && myLessonsCount" class="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full lesson-badge">{{ myLessonsCount }}</span>
        </RouterLink>
      </nav>

      <div class="spacer"></div>
      <div class="profile bottom-profile">
        <img :src="avatarUrl" alt="avatar" class="avatar" />
        <div class="profile-info">
          <div class="name">{{ user?.name || 'Guest' }}</div>
          <div class="email">{{ user?.email || 'guest@melodymart.com' }}</div>
        </div>
      </div>

      <button class="logout" @click="handleLogout">Logout</button>
    </div>

    <!-- Mobile toggle button -->
    <button class="mobile-toggle" @click="toggle">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- overlay for mobile when open -->
    <div v-if="isOpen" class="overlay" @click="close"></div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { onMounted } from 'vue'

const props = defineProps({
  collapsed: { type: Boolean, default: false }
})

const isOpen = ref(false)
const toggle = () => (isOpen.value = !isOpen.value)
const close = () => (isOpen.value = false)
const closeOnMobile = () => {
  if (window.innerWidth < 768) close()
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const myLessonsCount = computed(() => authStore.myLessonsCount || 0)

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchMyLessonsCount()
  }
})
const avatarUrl = computed(() => authStore.user?.avatar || '/assets/placeholders/avatar.png')

const items = [
  { label: 'Home', path: '/dashboard/customer/home', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 1.707a1 1 0 00-1.414 0L1 9v8a1 1 0 001 1h5a1 1 0 001-1v-5h2v5a1 1 0 001 1h5a1 1 0 001-1V9l-8.293-7.293z"/></svg>' },
  { label: 'My Cart', path: '/dashboard/customer/cart', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.74L23 6H6"/></svg>' },
  { label: 'Orders', path: '/dashboard/customer/orders', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v4H3z"/><path d="M3 11h18v10H3z"/></svg>' },
  { label: 'Lessons', path: '/dashboard/customer/lessons', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/></svg>' },
  { label: 'Requested Services', path: '/dashboard/customer/services', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4L19 22l-7-4-7 4 1.5-9L3 9h7z"/></svg>' },
  { label: 'Settings', path: '/dashboard/customer/settings', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 112.27 17.9l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09c.66 0 1.25-.44 1.51-1a1.65 1.65 0 00-.33-1.82L3.3 5.6A2 2 0 115.6 2.27l.06.06A1.65 1.65 0 007.48 2a1.65 1.65 0 001 .15H9a2 2 0 110 4h-.09c-.66 0-1.25.44-1.51 1A1.65 1.65 0 007.48 9l.06.06A2 2 0 119.73 11.3l-.06.06c-.48.48-.73 1.12-.73 1.76v.09a2 2 0 110 4v-.09c0-.64.25-1.28.73-1.76l.06-.06A2 2 0 1114.27 12.7l-.06.06c.48.48.73 1.12.73 1.76v.09a2 2 0 110 4v-.09c0-.64.25-1.28.73-1.76l.06-.06A2 2 0 1119.4 15z"/></svg>' }
]

const emits = defineEmits(['compress', 'expand'])

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path)
}

const routerInstance = router

const onMenuClick = (item) => {
  // compress when navigating to dashboard embedded home, expand otherwise
  if (item.path === '/dashboard/customer/home') {
    emits('compress')
  } else {
    emits('expand')
  }
  closeOnMobile()
}

const handleLogout = () => {
  authStore.logout()
  routerInstance.push('/')
}
</script>

<style scoped>
:root {
  --p-900: #28104E;
  --p-700: #6237A0;
  --p-500: #9754CB;
  --p-300: #DEACF5;
  --p-50: #FBF7FF;
}

.customer-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 250px;
  background: linear-gradient(180deg, var(--p-300), var(--p-50));
  background-blend-mode: overlay;
  box-shadow: 0 10px 30px rgba(98,55,160,0.06);
  z-index: 60;
  transform: translateX(-100%);
  transition: transform 0.28s ease, width 0.2s ease;
  border-right: 1px solid rgba(167,139,250,0.06);
}

.customer-sidebar.collapsed {
  width: 72px;
  background: linear-gradient(180deg, rgba(98,55,160,0.06), rgba(40,16,60,0.04));
  backdrop-filter: blur(4px);
}

.customer-sidebar.open {
  transform: translateX(0);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  padding-top: 56px; /* push menu down so it doesn't overlap header/logo */
}

.profile {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(167,139,250,0.06);
}

.bottom-profile {
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(167,139,250,0.04);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  object-fit: cover;
}

.avatar {
  background: linear-gradient(135deg,var(--p-500),var(--p-300));
  border: 3px solid rgba(255,255,255,0.85);
  box-shadow: 0 6px 18px rgba(98,55,160,0.12);
}

.customer-sidebar.collapsed .avatar {
  width: 40px;
  height: 40px;
}

.profile-info .name {
  font-weight: 700;
  color: var(--p-900);
}

.profile-info .email {
  font-size: 12px;
  color: rgba(40,16,60,0.7);
}

.menu {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--p-900);
  text-decoration: none;
  transition: background 0.18s ease, transform 0.12s ease;
}

.menu-item:hover {
  background: linear-gradient(90deg, rgba(151,84,203,0.06), rgba(222,172,245,0.04));
  transform: translateX(4px);
}

.menu-item .icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
}

.menu-item .label { font-size: 15px; }

.lesson-badge {
  background: linear-gradient(90deg,var(--p-500),var(--p-300));
  color: white;
}

.customer-sidebar.collapsed .label {
  display: none;
}

.customer-sidebar.collapsed .profile-info {
  display: none;
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(151,84,203,0.12), rgba(222,172,245,0.08));
  color: var(--p-700);
  font-weight: 700;
  box-shadow: inset 4px 0 0 var(--p-500);
}

.spacer {
  flex: 1 1 auto;
}

.logout {
  width: 100%;
  padding: 10px 12px;
  background: linear-gradient(90deg, #ff6b6b, #ff4d4d); /* visible contrasting red */
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(255,77,77,0.12);
}

.mobile-toggle {
  position: fixed;
  left: 12px;
  top: 12px;
  background: linear-gradient(90deg,var(--p-500),var(--p-300));
  color: white;
  border: none;
  padding: 8px;
  border-radius: 8px;
  display: inline-flex;
  z-index: 70;
  box-shadow: 0 6px 18px rgba(151,84,203,0.12);
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(40,16,60,0.06);
  z-index: 50;
}

/* Desktop: keep visible */
@media (min-width: 768px) {
  .customer-sidebar {
    transform: translateX(0);
  }
  .mobile-toggle { display: none; }
}
</style>
