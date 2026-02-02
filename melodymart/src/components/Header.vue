<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{ onNavigateToDashboards?: () => void }>()
const emit = defineEmits<{ (event: 'navigate-to-dashboards'): void }>()

const router = useRouter()
const authStore = useAuthStore()

const navLinks = [
  { target: '#shop', label: 'Shop', icon: 'cart' },
  { target: '#rentals', label: 'Rentals' },
  { target: '#lessons', label: 'Lesson Bookings', icon: 'calendar' },
  { target: '#repairs', label: 'Repair Services', icon: 'wrench' }
]

const mobileMenuOpen = ref(false)

const toggleMobile = () => (mobileMenuOpen.value = !mobileMenuOpen.value)
const closeMobile = () => (mobileMenuOpen.value = false)

const handleNavClick = (target: string) => {
  const element = document.querySelector(target)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  closeMobile()
}

const navigateToAuth = () => {
  console.log('Navigate to auth clicked')
  closeMobile()
  router.push('/auth').catch(err => {
    console.error('Navigation error:', err)
  })
}

const handleSignOut = () => {
  authStore.logout()
  closeMobile()
  router.push('/')
}

const handleGoHome = () => {
  handleNavClick('#home')
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-app-border bg-background/80 backdrop-blur-lg">
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
        <button
          v-for="link in navLinks"
          :key="link.target"
          type="button"
          class="text-sm font-medium text-slate-200 hover:text-purple-300"
          @click="handleNavClick(link.target)"
        >
          {{ link.label }}
        </button>
      </div>

      <!-- Auth Buttons -->
      <div class="hidden items-center gap-3 md:flex">
        <template v-if="authStore.user">
          <span class="text-sm text-slate-200">{{ authStore.user.name }}</span>
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
            class="rounded-full bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
            @click="navigateToAuth"
          >
            Sign Up
          </button>
        </template>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        type="button"
        class="md:hidden text-slate-200"
        @click="toggleMobile"
      >
        ☰
      </button>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-slate-950 px-4 py-4 space-y-3">
      <button
        v-for="link in navLinks"
        :key="'mobile-' + link.target"
        type="button"
        class="block w-full text-left text-slate-200"
        @click="handleNavClick(link.target)"
      >
        {{ link.label }}
      </button>

      <template v-if="!authStore.user">
        <button class="w-full text-left text-purple-300" @click="navigateToAuth">
          Login / Sign Up
        </button>
      </template>

      <template v-else>
        <button class="w-full text-left text-red-400" @click="handleSignOut">
          Sign Out
        </button>
      </template>
    </div>
  </header>
</template>
