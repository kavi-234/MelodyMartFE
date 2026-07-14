<template>
  <aside :class="['mm-sidebar', { 'is-open': isOpen, 'is-collapsed': collapsed }]">
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
        </RouterLink>
      </nav>

      <div class="flex-1" />

      <!-- Profile -->
      <div v-if="!collapsed" class="mm-sidebar-profile">
        <div class="profile-avatar-wrap">
          <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="profile-avatar" />
          <div v-else class="profile-avatar-fallback">{{ user?.name?.[0]?.toUpperCase() }}</div>
        </div>
        <div class="profile-info">
          <div class="profile-name">{{ user?.name || 'Tutor' }}</div>
          <div class="profile-role">Tutor</div>
        </div>
      </div>
      <div v-else class="flex justify-center py-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-mm-gold-dk to-mm-copper flex items-center justify-center text-mm-ink text-xs font-bold">
          {{ user?.name?.[0]?.toUpperCase() }}
        </div>
      </div>

      <!-- Logout -->
      <button class="mm-logout-btn" @click="handleLogout">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span v-if="!collapsed">Sign Out</span>
      </button>
    </div>

    <!-- Mobile toggle -->
    <button class="mm-mobile-toggle" @click="toggle">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6" stroke-linecap="round"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
        <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
      </svg>
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="mm-overlay" @click="close" />
    </Transition>
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
const close  = () => (isOpen.value = false)
const closeOnMobile = () => { if (window.innerWidth < 768) close() }

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const user      = computed(() => authStore.user)
const avatarUrl = computed(() => authStore.user?.avatar || '')

const items = [
  { label: 'Dashboard',       path: '/dashboard/tutor',               icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { label: 'Create Lesson',   path: '/dashboard/tutor/create-lesson', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>` },
  { label: 'My Lessons',      path: '/dashboard/tutor/lessons',       icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>` },
  { label: 'Bookings',        path: '/dashboard/tutor/bookings',      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { label: 'Earnings',        path: '/dashboard/tutor/earnings',      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>` },
  { label: 'Profile',         path: '/dashboard/tutor/profile',       icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  { label: 'Messages',        path: '/messages',                       icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>` },
]

const isActive = (path) => {
  if (path === '/dashboard/tutor') return route.path === '/dashboard/tutor'
  return route.path.startsWith(path)
}
const onMenuClick = (item) => {
  if (item.path === '/dashboard/tutor') emits('compress')
  else emits('expand')
  closeOnMobile()
}
const handleLogout = () => { authStore.logout(); router.push('/') }
</script>

<style scoped>
.mm-sidebar {
  position: fixed; left: 0; top: 57px;
  height: calc(100vh - 57px); width: 250px;
  z-index: 60;
  transform: translateX(-100%);
  transition: transform 0.28s ease, width 0.22s ease;
}
.mm-sidebar.is-collapsed { width: 72px; }
.mm-sidebar.is-open { transform: translateX(0); }

.mm-sidebar-inner {
  height: 100%; display: flex; flex-direction: column;
  background: var(--mm-carbon);
  border-right: 1px solid var(--mm-warm-line);
  overflow: hidden;
}

.mm-sidebar-logo {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1.25rem 1rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--mm-warm-line);
  min-height: 60px;
}
.logo-mark {
  position: relative; width: 32px; height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper));
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.logo-ring { position: absolute; inset: 20%; border-radius: 50%; border: 1.5px solid rgba(9,8,12,0.4); }
.logo-dot  { position: absolute; inset: 42%; border-radius: 50%; background: rgba(9,8,12,0.5); }
.logo-text { font-size: 1rem; color: var(--mm-ivory); letter-spacing: -0.01em; }

.mm-sidebar-nav {
  display: flex; flex-direction: column; gap: 2px;
  padding: 0.75rem 0.6rem; flex: 0 0 auto;
}
.mm-nav-item {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.6rem 0.8rem; border-radius: 0.65rem;
  color: var(--mm-sand); text-decoration: none;
  font-size: 0.875rem; font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s ease;
  position: relative; white-space: nowrap;
}
.mm-nav-item:hover { background: var(--mm-onyx); color: var(--mm-ivory); }
.mm-nav-item.is-active {
  background: rgba(212,168,83,0.1);
  color: var(--mm-gold-lt);
  border: 1px solid rgba(212,168,83,0.15);
}
.mm-nav-item.is-active::before {
  content: '';
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 2.5px; background: var(--mm-gold);
  border-radius: 0 2px 2px 0;
}
.nav-icon { display: inline-flex; flex-shrink: 0; width: 18px; height: 18px; }
.nav-label { flex: 1; }

.mm-sidebar-profile {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border-top: 1px solid var(--mm-warm-line);
  margin: 0 0.4rem;
  border-radius: 0.75rem;
}
.profile-avatar-wrap { flex-shrink: 0; }
.profile-avatar {
  width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
  background: linear-gradient(135deg, var(--mm-gold-dk), var(--mm-copper));
}
.profile-avatar-fallback {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold-dk), var(--mm-copper));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700; color: var(--mm-ink);
}
.profile-name  { font-size: 0.8rem; font-weight: 600; color: var(--mm-ivory); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.profile-role  { font-size: 0.68rem; color: var(--mm-gold-lt); font-weight: 500; margin-top: 0.05rem; }

.mm-logout-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: calc(100% - 1.2rem); margin: 0.4rem 0.6rem 0.75rem;
  padding: 0.6rem 0.8rem; border-radius: 0.65rem;
  border: 1px solid rgba(224,112,96,0.15);
  background: transparent; color: rgba(224,112,96,0.7);
  font-size: 0.85rem; font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s ease; cursor: pointer;
}
.mm-logout-btn:hover { background: rgba(224,112,96,0.08); border-color: rgba(224,112,96,0.3); color: #E07060; }

.mm-mobile-toggle {
  position: fixed; left: 12px; top: 12px; z-index: 70;
  display: none; width: 38px; height: 38px;
  align-items: center; justify-content: center;
  border-radius: 0.6rem;
  background: var(--mm-carbon); border: 1px solid var(--mm-warm-line);
  color: var(--mm-sand); cursor: pointer; transition: all 0.2s ease;
}
.mm-mobile-toggle:hover { color: var(--mm-gold-lt); }

.mm-overlay {
  position: fixed; inset: 0;
  background: rgba(9,8,12,0.7); z-index: 50;
  backdrop-filter: blur(2px);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (min-width: 768px) { .mm-sidebar { transform: translateX(0); } .mm-mobile-toggle { display: none; } }
@media (max-width: 767px) { .mm-sidebar { top: 0; height: 100vh; } .mm-mobile-toggle { display: flex; } }
</style>
