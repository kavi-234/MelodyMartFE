<template>
  <aside :class="['admin-sidebar', { open: isOpen, collapsed: collapsed }]">
    <div class="sidebar-inner">
      <nav class="menu">
        <RouterLink
          v-for="item in items"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
          @click="onMenuClick(item)"
        >
          <span class="icon" v-html="item.icon"></span>
          <span class="label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="spacer"></div>

      <div class="profile bottom-profile">
        <img :src="avatarUrl" alt="avatar" class="avatar" />
        <div class="profile-info">
          <div class="name">{{ user?.name || 'Admin' }}</div>
          <div class="email">{{ user?.email || '' }}</div>
        </div>
      </div>

      <button class="logout" @click="handleLogout">Logout</button>
    </div>

    <button class="mobile-toggle" @click="toggle">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div v-if="isOpen" class="overlay" @click="close"></div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const props = defineProps({ collapsed: { type: Boolean, default: false } })
const emits = defineEmits(['compress', 'expand'])

const isOpen = ref(false)
const toggle = () => (isOpen.value = !isOpen.value)
const close = () => (isOpen.value = false)
const closeOnMobile = () => { if (window.innerWidth < 768) close() }

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const avatarUrl = computed(() => authStore.user?.avatar || '/assets/placeholders/avatar.png')

const items = [
  {
    label: 'Dashboard',
    path: '/dashboard/admin',
    exact: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 1.707a1 1 0 00-1.414 0L1 9v8a1 1 0 001 1h5a1 1 0 001-1v-5h2v5a1 1 0 001 1h5a1 1 0 001-1V9l-8.293-7.293z"/></svg>`,
  },
  {
    label: 'Users',
    path: '/dashboard/admin/users',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    label: 'Orders',
    path: '/dashboard/admin/orders',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  },
  {
    label: 'Instruments',
    path: '/dashboard/admin/instruments',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13M9 9h12"/></svg>`,
  },
]

const isActive = (path) => {
  if (path === '/dashboard/admin') return route.path === '/dashboard/admin'
  return route.path.startsWith(path)
}

const onMenuClick = (item) => {
  if (item.path === '/dashboard/admin') emits('compress')
  else emits('expand')
  closeOnMobile()
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
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

.admin-sidebar {
  position: fixed;
  left: 0; top: 0;
  height: 100vh; width: 250px;
  background: linear-gradient(180deg, var(--p-300), var(--p-50));
  box-shadow: 0 10px 30px rgba(98,55,160,0.06);
  z-index: 60;
  transform: translateX(-100%);
  transition: transform 0.28s ease, width 0.2s ease;
  border-right: 1px solid rgba(167,139,250,0.06);
}
.admin-sidebar.collapsed {
  width: 72px;
  background: linear-gradient(180deg, rgba(98,55,160,0.06), rgba(40,16,60,0.04));
  backdrop-filter: blur(4px);
}
.admin-sidebar.open { transform: translateX(0); }

.sidebar-inner {
  display: flex; flex-direction: column; height: 100%;
  padding: 20px; padding-top: 56px;
}

.menu { margin-top: 16px; display: flex; flex-direction: column; gap: 6px; }

.menu-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 8px;
  color: var(--p-900); text-decoration: none;
  transition: background 0.18s ease, transform 0.12s ease;
  font-size: 15px; font-weight: 500;
}
.menu-item:hover {
  background: linear-gradient(90deg, rgba(151,84,203,0.06), rgba(222,172,245,0.04));
  transform: translateX(4px);
}
.menu-item.active {
  background: linear-gradient(90deg, rgba(151,84,203,0.12), rgba(222,172,245,0.08));
  color: var(--p-700); font-weight: 700;
  box-shadow: inset 4px 0 0 var(--p-500);
}
.menu-item .icon { display: inline-flex; width: 20px; height: 20px; flex-shrink: 0; }
.admin-sidebar.collapsed .label { display: none; }

.spacer { flex: 1 1 auto; }

.profile {
  display: flex; gap: 12px; align-items: center;
  margin-bottom: 12px; padding-top: 12px;
  border-top: 1px solid rgba(167,139,250,0.04);
}
.avatar {
  width: 56px; height: 56px; border-radius: 9999px; object-fit: cover;
  background: linear-gradient(135deg,var(--p-500),var(--p-300));
  border: 3px solid rgba(255,255,255,0.85);
  box-shadow: 0 6px 18px rgba(98,55,160,0.12);
}
.admin-sidebar.collapsed .avatar { width: 40px; height: 40px; }
.profile-info .name { font-weight: 700; color: var(--p-900); font-size: 14px; }
.profile-info .email { font-size: 11px; color: rgba(40,16,60,0.65); }
.admin-sidebar.collapsed .profile-info { display: none; }

.logout {
  width: 100%; padding: 10px 12px;
  background: linear-gradient(90deg, #ff6b6b, #ff4d4d);
  color: white; border: none; border-radius: 10px;
  cursor: pointer; font-weight: 600;
  box-shadow: 0 8px 20px rgba(255,77,77,0.12);
}

.mobile-toggle {
  position: fixed; left: 12px; top: 12px;
  background: linear-gradient(90deg,var(--p-500),var(--p-300));
  color: white; border: none; padding: 8px; border-radius: 8px;
  display: inline-flex; z-index: 70;
  box-shadow: 0 6px 18px rgba(151,84,203,0.12);
}
.overlay {
  position: fixed; inset: 0;
  background: rgba(40,16,60,0.06); z-index: 50;
}

@media (min-width: 768px) {
  .admin-sidebar { transform: translateX(0); }
  .mobile-toggle { display: none; }
}
</style>
