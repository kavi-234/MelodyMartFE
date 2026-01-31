<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ onNavigateToDashboards?: () => void }>()

const emit = defineEmits<{ (event: 'navigate-to-dashboards'): void }>()

const navLinks = [
  { href: '#shop', label: 'Shop', icon: 'cart' },
  { href: '#rentals', label: 'Rentals' },
  { href: '#lessons', label: 'Lesson Bookings', icon: 'calendar' },
  { href: '#repairs', label: 'Repair Services', icon: 'wrench' }
]

const mobileMenuOpen = ref(false)
const showAuthModal = ref(false)

const navLinkClass =
  'flex items-center gap-2 text-sm font-medium text-slate-200 transition-colors hover:text-purple-300'
const mobileLinkClass =
  'flex items-center gap-3 rounded-xl bg-slate-900/40 px-4 py-3 text-slate-100 transition hover:bg-slate-900/70'

const toggleMobile = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobile = () => {
  mobileMenuOpen.value = false
}

const openSignIn = () => {
  showAuthModal.value = true
  closeMobile()
}

const closeSignIn = () => {
  showAuthModal.value = false
}

const handleGetStarted = () => {
  emit('navigate-to-dashboards')
  props.onNavigateToDashboards?.()
  closeMobile()
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-app-border bg-background/80 backdrop-blur-lg">
    <nav class="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8" aria-label="Primary">
      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center justify-center rounded-xl border border-slate-700/50 p-2 text-slate-200 md:hidden"
          type="button"
          aria-label="Toggle navigation"
          :aria-expanded="mobileMenuOpen"
          @click="toggleMobile"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <a class="flex items-center gap-2" href="#home" aria-label="Melody Mart home">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-900 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 3v10.5a3.5 3.5 0 11-2-3.2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M18 3v10.5a3.5 3.5 0 11-2-3.2" />
            </svg>
          </span>
          <span class="bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
            Melody Mart
          </span>
        </a>
      </div>

      <div class="hidden items-center gap-8 md:flex">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          :class="navLinkClass"
          @click="closeMobile"
        >
          <svg v-if="link.icon === 'cart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4">
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M1 1h3l2.6 13.4a2 2 0 002 1.6h9.5a2 2 0 001.9-1.5L22 6H6" />
          </svg>
          <svg v-else-if="link.icon === 'calendar'" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <svg v-else-if="link.icon === 'wrench'" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M21.6 15.9l-6.5-6.5a3 3 0 10-3.1 3.1l6.5 6.5a2 2 0 002.8 0l0.3-0.3a2 2 0 000-2.8z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M14.3 8.6l2.8-2.8" />
          </svg>
          <span>{{ link.label }}</span>
        </a>
      </div>

      <div class="hidden items-center gap-3 md:flex">
        <button
          class="rounded-full border border-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:text-purple-300"
          type="button"
          @click="openSignIn"
        >
          Sign In
        </button>
        <button
          class="rounded-full bg-gradient-to-r from-purple-600 to-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:shadow-purple-600/50"
          type="button"
          @click="handleGetStarted"
        >
          Get Started
        </button>
      </div>
    </nav>

    <div v-if="mobileMenuOpen" class="border-t border-slate-800/60 bg-slate-950/95 px-4 pb-6 pt-4 md:hidden">
      <div class="space-y-3">
        <a
          v-for="link in navLinks"
          :key="`mobile-${link.href}`"
          :href="link.href"
          :class="mobileLinkClass"
          @click="closeMobile"
        >
          <svg v-if="link.icon === 'cart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4">
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M1 1h3l2.6 13.4a2 2 0 002 1.6h9.5a2 2 0 001.9-1.5L22 6H6" />
          </svg>
          <svg v-else-if="link.icon === 'calendar'" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <svg v-else-if="link.icon === 'wrench'" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M21.6 15.9l-6.5-6.5a3 3 0 10-3.1 3.1l6.5 6.5a2 2 0 002.8 0l0.3-0.3a2 2 0 000-2.8z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M14.3 8.6l2.8-2.8" />
          </svg>
          <span>{{ link.label }}</span>
        </a>
      </div>

      <div class="space-y-2 pt-4">
        <button
          class="w-full rounded-full border border-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:text-purple-300"
          type="button"
          @click="openSignIn"
        >
          Sign In
        </button>
        <button
          class="w-full rounded-full bg-gradient-to-r from-purple-600 to-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:shadow-purple-600/50"
          type="button"
          @click="handleGetStarted"
        >
          Get Started
        </button>
      </div>
    </div>

    <div v-if="showAuthModal" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 backdrop-blur-sm">
      <div class="relative w-full max-w-sm rounded-2xl border border-slate-700/50 bg-slate-900 p-6 text-slate-100 shadow-xl">
        <button class="absolute right-4 top-4 text-slate-400 hover:text-purple-300" type="button" aria-label="Close" @click="closeSignIn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
        <h2 class="mb-2 text-lg font-bold">Sign in to Melody Mart</h2>
        <p class="mb-6 text-sm text-slate-300">Authentication flow placeholder.</p>
        <div class="flex justify-end gap-2">
          <button class="rounded-full border border-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-200" type="button" @click="closeSignIn">
            Close
          </button>
          <button class="rounded-full bg-gradient-to-r from-purple-600 to-slate-900 px-4 py-2 text-sm font-semibold text-white" type="button">
            Continue
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
