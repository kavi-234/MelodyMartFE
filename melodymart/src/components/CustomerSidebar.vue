<template>
  <aside :class="['mm-sidebar', { 'is-open': isOpen, 'is-collapsed': collapsed }]">

    <!-- Sidebar inner -->
    <div class="mm-sidebar-inner">

      <!-- Nav -->
      <nav class="mm-sidebar-nav">
        <RouterLink
          v-for="item in items"
          :key="item.path"
          :to="item.path"
          class="mm-nav-item"
          :class="{ 'is-active': isActive(item.path) }"
          @click="onMenuClick(item)"
        >
          <span class="nav-icon" v-html="item.icon" />
          <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          <span
            v-if="!collapsed && item.path.endsWith('/lessons') && myLessonsCount"
            class="nav-badge"
          >{{ myLessonsCount }}</span>
        </RouterLink>
      </nav>

      <div class="flex-1" />

      <!-- User profile -->
      <div v-if="!collapsed" class="mm-sidebar-profile">
        <img :src="avatarUrl" alt="avatar" class="profile-avatar" @error="handleAvatarError" />
        <div class="profile-info">
          <div class="profile-name">{{ user?.name || 'Guest' }}</div>
          <div class="profile-email">{{ user?.email || '' }}</div>
        </div>
      </div>
      <div v-else class="flex justify-center py-3">
        <img :src="avatarUrl" alt="avatar" class="w-9 h-9 rounded-full object-cover border border-mm-line" @error="handleAvatarError" />
      </div>

      <!-- Logout -->
      <button class="mm-logout-btn" @click="handleLogout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span v-if="!collapsed">Sign Out</span>
      </button>
    </div>

    <!-- Mobile toggle -->
    <button class="mm-mobile-toggle" @click="toggle" aria-label="Toggle sidebar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6" stroke-linecap="round"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
        <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div v-if="isOpen" class="mm-overlay" @click="close" />
    </Transition>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  collapsed: { type: Boolean, default: false }
})
const emits = defineEmits(['compress', 'expand'])

const isOpen = ref(false)
const toggle = () => (isOpen.value = !isOpen.value)
const close  = () => (isOpen.value = false)
const closeOnMobile = () => { if (window.innerWidth < 768) close() }

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const user           = computed(() => authStore.user)
const myLessonsCount = computed(() => authStore.myLessonsCount || 0)
const avatarUrl      = computed(() => authStore.user?.avatar || '')

const handleAvatarError = (e) => {
  e.target.style.display = 'none'
}

onMounted(() => {
  if (authStore.isAuthenticated) authStore.fetchMyLessonsCount()
})

const items = [
  {
    label: 'Dashboard',
    path:  '/dashboard/customer',
    icon:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  },
  {
    label: 'My Cart',
    path:  '/dashboard/customer/cart',
    icon:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  },
  {
    label: 'Orders',
    path:  '/dashboard/customer/orders',
    icon:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },
  {
    label: 'Lessons',
    path:  '/dashboard/customer/lessons',
    icon:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  },
  {
    label: 'Repair Services',
    path:  '/dashboard/customer/services',
    icon:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  },
  {
    label: 'Messages',
    path:  '/messages',
    icon:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  },
  {
    label: 'Settings',
    path:  '/dashboard/customer/settings',
    icon:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  },
]

const isActive = (path) => route.path === path || (path !== '/dashboard/customer' && route.path.startsWith(path))

const onMenuClick = (item) => {
  closeOnMobile()
  emits('expand')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.mm-sidebar {
  position: fixed;
  left: 0; top: 57px;
  height: calc(100vh - 57px);
  width: 250px;
  z-index: 60;
  transform: translateX(-100%);
  transition: transform 0.28s ease, width 0.22s ease;
}
.mm-sidebar.is-collapsed { width: 72px; }
.mm-sidebar.is-open { transform: translateX(0); }

.mm-sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--mm-carbon);
  border-right: 1px solid var(--mm-warm-line);
  padding: 0;
  overflow: hidden;
}

/* Logo area */
.mm-sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--mm-warm-line);
  min-height: 60px;
}
.logo-mark {
  position: relative;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper));
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.logo-ring {
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  border: 1.5px solid rgba(9,8,12,0.4);
}
.logo-dot {
  position: absolute;
  inset: 42%;
  border-radius: 50%;
  background: rgba(9,8,12,0.5);
}
.logo-text {
  font-size: 1rem;
  color: var(--mm-ivory);
  letter-spacing: -0.01em;
}

/* Nav */
.mm-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.75rem 0.6rem;
  flex: 0 0 auto;
}
.mm-nav-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.65rem;
  color: var(--mm-sand);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}
.mm-nav-item:hover {
  background: var(--mm-onyx);
  color: var(--mm-ivory);
}
.mm-nav-item.is-active {
  background: rgba(212,168,83,0.1);
  color: var(--mm-gold-lt);
  border: 1px solid rgba(212,168,83,0.15);
}
.mm-nav-item.is-active::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 2.5px;
  background: var(--mm-gold);
  border-radius: 0 2px 2px 0;
}
.nav-icon {
  display: inline-flex;
  flex-shrink: 0;
  width: 18px; height: 18px;
}
.nav-label { flex: 1; }
.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--mm-gold);
  color: var(--mm-ink);
  border-radius: 2rem;
  font-size: 0.65rem;
  font-weight: 700;
}

/* Profile */
.mm-sidebar-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border-top: 1px solid var(--mm-warm-line);
  margin: 0 0.4rem;
  border-radius: 0.75rem;
}
.profile-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, var(--mm-gold-dk), var(--mm-copper));
  flex-shrink: 0;
}
.profile-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--mm-ivory);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.profile-email {
  font-size: 0.7rem;
  color: var(--mm-stone);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Logout */
.mm-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: calc(100% - 1.2rem);
  margin: 0.4rem 0.6rem 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(224,112,96,0.15);
  background: transparent;
  color: rgba(224,112,96,0.7);
  font-size: 0.85rem;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s ease;
  cursor: pointer;
}
.mm-logout-btn:hover {
  background: rgba(224,112,96,0.08);
  border-color: rgba(224,112,96,0.3);
  color: #E07060;
}

/* Mobile toggle */
.mm-mobile-toggle {
  position: fixed;
  left: 12px; top: 12px;
  z-index: 70;
  display: none;
  width: 38px; height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  color: var(--mm-sand);
  cursor: pointer;
  transition: all 0.2s ease;
}
.mm-mobile-toggle:hover { color: var(--mm-gold-lt); }

/* Overlay */
.mm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(9,8,12,0.7);
  z-index: 50;
  backdrop-filter: blur(2px);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (min-width: 768px) {
  .mm-sidebar { transform: translateX(0); }
  .mm-mobile-toggle { display: none; }
}
@media (max-width: 767px) {
  .mm-sidebar { top: 0; height: 100vh; }
  .mm-mobile-toggle { display: flex; }
}
</style>
