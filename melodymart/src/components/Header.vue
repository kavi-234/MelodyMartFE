<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const landingNavLinks = [
  { target: '#shop', label: 'Shop', icon: 'cart' },
  { target: '#rentals', label: 'Rentals' },
  { target: '#lessons', label: 'Lesson Bookings', icon: 'calendar' },
  { target: '#repairs', label: 'Repair Services', icon: 'wrench' }
]

const mobileMenuOpen = ref(false)
const isDarkMode = ref(true)

const dashboardRoute = computed(() => {
  if (!authStore.user) return '/'
  const roleMap: Record<string, string> = {
    'customer': '/dashboard/customer',
    'tutor': '/dashboard/tutor',
    'repair_specialist': '/dashboard/repair',
    'admin': '/dashboard/admin'
  }
  return roleMap[authStore.user.role] || '/'
})

const toggleMobile = () => (mobileMenuOpen.value = !mobileMenuOpen.value)
const closeMobile = () => (mobileMenuOpen.value = false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const handleNavClick = (target: string) => {
  const element = document.querySelector(target)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  closeMobile()
}

const navigateToAuth = () => {
  closeMobile()
  router.push('/auth')
}

const navigateToDashboard = () => {
  closeMobile()
  router.push(dashboardRoute.value)
}

const navigateToHome = () => {
  closeMobile()
  router.push('/')
}

const navigateToSettings = () => {
  closeMobile()
  router.push('/settings')
}

const handleSignOut = () => {
  authStore.logout()
  closeMobile()
  router.push('/')
}

const handleGoHome = () => {
  if (authStore.user) {
    navigateToHome()
  } else {
    handleNavClick('#home')
  }
}

onMounted(() => {
  // Load dark mode preference from localStorage
  const savedMode = localStorage.getItem('darkMode')
  isDarkMode.value = savedMode !== 'false'
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-purple-900/50 bg-[#0a0118] backdrop-blur-lg">
    <nav class="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3 lg:px-8">

      <!-- Logo -->
      <button
        type="button"
        class="flex items-center gap-2"
        aria-label="Melody Mart home"
        @click="handleGoHome"
      >
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-900 text-white">
          🎵
        </span>
        <span class="text-xl font-bold text-purple-300">Melody Mart</span>
      </button>

      <!-- Desktop Nav -->
      <div class="hidden items-center gap-8 md:flex">
        <!-- Show landing page sections when NOT logged in -->
        <template v-if="!authStore.user">
          <button
            v-for="link in landingNavLinks"
            :key="link.target"
            type="button"
            class="text-sm font-medium text-slate-200 hover:text-purple-300"
            @click="handleNavClick(link.target)"
          >
            {{ link.label }}
          </button>
        </template>

        <!-- Show dashboard link when logged in -->
        <template v-else>
          <button
            type="button"
            class="text-sm font-medium text-slate-200 hover:text-purple-300"
            @click="navigateToHome"
          >
            Home
          </button>
          <button
            type="button"
            class="text-sm font-medium text-purple-400 hover:text-purple-300"
            @click="navigateToDashboard"
          >
            Dashboard
          </button>
        </template>
      </div>

      <!-- Auth Buttons -->
      <div class="hidden items-center gap-3 md:flex">
        <!-- Dark Mode Toggle -->
        <button
          type="button"
          @click="toggleDarkMode"
          class="text-slate-400 hover:text-white transition-colors"
          :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <!-- Moon Icon (Dark Mode) -->
          <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
          <!-- Sun Icon (Light Mode) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
        </button>

        <template v-if="authStore.user">
          <span class="text-sm text-slate-200">{{ authStore.user.name }}</span>
          <button
            type="button"
            class="text-sm text-slate-400 hover:text-white"
            @click="navigateToSettings"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button
            type="button"
            class="text-sm text-red-400 hover:text-red-500"
            @click="handleSignOut"
          >
            Sign Out
          </button>
        </template>

        <template v-else>
          <button
            type="button"
            class="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:text-purple-300"
            @click="navigateToAuth"
          >
            Login
          </button>
          <button
            type="button"
            class="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm text-white hover:from-purple-700"
            @click="navigateToAuth"
          >
            Sign Up
          </button>
        </template>
      </div>

      <!-- Mobile Menu Button -->
      <button
        type="button"
        class="md:hidden"
        @click="toggleMobile"
        aria-label="Toggle mobile menu"
      >
        <span class="text-2xl">☰</span>
      </button>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-slate-950 px-4 py-4 space-y-3">
      <!-- Dark Mode Toggle (Mobile) -->
      <button
        type="button"
        @click="toggleDarkMode"
        class="flex items-center gap-2 w-full text-left text-slate-200"
      >
        <!-- Moon Icon (Dark Mode) -->
        <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
        <!-- Sun Icon (Light Mode) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
        <span>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <!-- Show landing page sections when NOT logged in -->
      <template v-if="!authStore.user">
        <button
          v-for="link in landingNavLinks"
          :key="'mobile-' + link.target"
          type="button"
          class="block w-full text-left text-slate-200"
          @click="handleNavClick(link.target)"
        >
          {{ link.label }}
        </button>
        <button class="w-full text-left text-purple-300" @click="navigateToAuth">
          Login / Sign Up
        </button>
      </template>

      <!-- Show dashboard link when logged in -->
      <template v-else>
        <button
          type="button"
          class="block w-full text-left text-slate-200"
          @click="navigateToHome"
        >
          Home
        </button>
        <button
          type="button"
          class="block w-full text-left text-purple-400"
          @click="navigateToDashboard"
        >
          Dashboard
        </button>
        <button
          type="button"
          class="block w-full text-left text-slate-200"
          @click="navigateToSettings"
        >
          Settings
        </button>
        <button class="w-full text-left text-red-400" @click="handleSignOut">
          Sign Out
        </button>
      </template>
    </div>
  </header>
</template>
