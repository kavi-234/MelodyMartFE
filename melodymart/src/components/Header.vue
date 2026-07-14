<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const landingNavLinks = [
  { target: '#shop',    label: 'Shop' },
  { target: '#rentals', label: 'Rentals' },
  { target: '#lessons', label: 'Lessons' },
  { target: '#repairs', label: 'Repairs' },
]

const dashboardRoute = computed(() => {
  if (!authStore.user) return '/'
  const map: Record<string, string> = {
    customer:          '/dashboard/customer',
    tutor:             '/dashboard/tutor',
    repair_specialist: '/dashboard/specialist',
    admin:             '/dashboard/admin',
  }
  return map[authStore.user.role] || '/'
})

const toggleMobile = () => (mobileMenuOpen.value = !mobileMenuOpen.value)
const closeMobile  = () => (mobileMenuOpen.value = false)

const handleNavClick = (target: string) => {
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  closeMobile()
}
const navigateToDashboard = () => { closeMobile(); router.push(dashboardRoute.value) }
const navigateToHome      = () => { closeMobile(); router.push('/') }
const navigateToAuth      = () => { closeMobile(); router.push('/auth') }
const navigateToMessages  = () => { closeMobile(); router.push('/messages') }
const handleSignOut       = () => { authStore.logout(); closeMobile(); router.push('/') }

const roleLabel: Record<string, string> = {
  customer:          'Customer',
  tutor:             'Tutor',
  repair_specialist: 'Specialist',
  admin:             'Admin',
}
const rolePillClass: Record<string, string> = {
  customer:          'role-pill-teal',
  tutor:             'role-pill-gold',
  repair_specialist: 'role-pill-copper',
  admin:             'role-pill-coral',
}
</script>

<template>
  <header class="sticky top-0 z-50 glass border-b border-mm-line/50">
    <!-- Warm top accent -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-mm-gold/50 to-transparent pointer-events-none" />

    <nav class="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">

      <!-- Logo -->
      <button type="button" class="flex items-center gap-3 group" @click="navigateToHome">
        <div class="relative w-9 h-9 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
          <div class="absolute inset-0 rounded-full bg-gradient-to-br from-mm-gold via-mm-copper to-mm-gold-dk" />
          <div class="absolute inset-0 rounded-full flex items-center justify-center">
            <div class="w-4 h-4 rounded-full border border-mm-ink/40 flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-mm-ink/50" />
            </div>
          </div>
        </div>
        <div class="leading-none">
          <div class="font-serif text-[1.05rem] text-mm-ivory group-hover:text-mm-gold-lt transition-colors">Melody Mart</div>
          <div class="text-[8px] tracking-[0.18em] uppercase text-mm-sand font-sans mt-px">Music Marketplace</div>
        </div>
      </button>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-0.5">
        <template v-if="!authStore.user">
          <button
            v-for="link in landingNavLinks"
            :key="link.target"
            type="button"
            class="relative px-4 py-2 text-sm font-medium text-mm-cream hover:text-mm-ivory transition-colors rounded-lg hover:bg-mm-carbon/60 group"
            @click="handleNavClick(link.target)"
          >
            {{ link.label }}
            <span class="absolute bottom-1 left-4 right-4 h-px bg-mm-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          </button>
        </template>
        <template v-else>
          <button type="button" class="px-4 py-2 text-sm font-medium text-mm-cream hover:text-mm-ivory hover:bg-mm-carbon/60 rounded-lg transition-all" @click="navigateToHome">Home</button>
          <button type="button" class="px-4 py-2 text-sm font-medium text-mm-gold-lt hover:text-mm-gold hover:bg-mm-carbon/60 rounded-lg transition-all" @click="navigateToDashboard">Dashboard</button>
        </template>
      </div>

      <!-- Desktop Actions -->
      <div class="hidden md:flex items-center gap-2.5">
        <template v-if="authStore.user">
          <span :class="['role-pill', rolePillClass[authStore.user.role] || 'role-pill-gold']">
            {{ roleLabel[authStore.user.role] || authStore.user.role }}
          </span>
          <span class="text-sm text-mm-cream max-w-[130px] truncate">{{ authStore.user.name }}</span>

          <button type="button" class="icon-btn" title="Messages" @click="navigateToMessages">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>

          <button type="button" class="signout-btn" @click="handleSignOut">Sign Out</button>
        </template>
        <template v-else>
          <button type="button" class="text-sm font-medium text-mm-cream hover:text-mm-ivory px-4 py-2 rounded-lg hover:bg-mm-carbon/60 transition-all" @click="navigateToAuth">Login</button>
          <button type="button" class="btn-primary text-sm px-5 py-2" @click="navigateToAuth">Get Started</button>
        </template>
      </div>

      <!-- Mobile Toggle -->
      <button type="button" class="md:hidden icon-btn" @click="toggleMobile">
        <svg v-if="!mobileMenuOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </nav>

    <!-- Mobile Menu -->
    <Transition name="menu-drop">
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-mm-line/50 bg-mm-carbon/96 backdrop-blur-xl px-5 py-4 space-y-1">
        <template v-if="!authStore.user">
          <button
            v-for="link in landingNavLinks"
            :key="'m-' + link.target"
            type="button"
            class="w-full text-left px-3 py-2.5 text-mm-cream hover:text-mm-gold-lt hover:bg-mm-onyx rounded-lg text-sm font-medium transition-all"
            @click="handleNavClick(link.target)"
          >{{ link.label }}</button>
          <div class="pt-3 border-t border-mm-line/40 space-y-2">
            <button type="button" class="w-full btn-outline text-sm py-2.5" @click="navigateToAuth">Login</button>
            <button type="button" class="w-full btn-primary text-sm py-2.5" @click="navigateToAuth">Get Started</button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-mm-onyx border border-mm-line/60">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-mm-gold to-mm-copper flex items-center justify-center text-mm-ink text-xs font-bold flex-shrink-0">
              {{ authStore.user.name?.[0]?.toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-mm-ivory truncate">{{ authStore.user.name }}</div>
              <div class="text-xs text-mm-sand">{{ roleLabel[authStore.user.role] || authStore.user.role }}</div>
            </div>
          </div>
          <button type="button" class="w-full text-left px-3 py-2.5 text-mm-cream hover:text-mm-ivory hover:bg-mm-onyx rounded-lg text-sm transition-all" @click="navigateToHome">Home</button>
          <button type="button" class="w-full text-left px-3 py-2.5 text-mm-gold-lt hover:text-mm-gold hover:bg-mm-onyx rounded-lg text-sm font-medium transition-all" @click="navigateToDashboard">Dashboard</button>
          <button type="button" class="w-full text-left px-3 py-2.5 text-mm-cream hover:text-mm-ivory hover:bg-mm-onyx rounded-lg text-sm transition-all" @click="navigateToMessages">Messages</button>
          <div class="pt-2 border-t border-mm-line/40">
            <button type="button" class="w-full text-left px-3 py-2.5 text-mm-coral hover:bg-mm-coral/10 rounded-lg text-sm transition-all" @click="handleSignOut">Sign Out</button>
          </div>
        </template>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.icon-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 0.6rem;
  color: var(--mm-sand);
  transition: all 0.2s ease;
  background: transparent; border: none;
}
.icon-btn:hover { background: var(--mm-carbon); color: var(--mm-gold-lt); }

.signout-btn {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(224,112,96,0.75);
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  transition: all 0.2s ease;
}
.signout-btn:hover { color: #E07060; background: rgba(224,112,96,0.08); }

.role-pill {
  display: inline-flex; align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 2rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  font-family: 'DM Sans', sans-serif;
  border: 1px solid;
}
.role-pill-gold   { background: rgba(212,168,83,0.1);  border-color: rgba(212,168,83,0.25); color: #E8C47A; }
.role-pill-teal   { background: rgba(42,157,159,0.1);  border-color: rgba(42,157,159,0.25); color: #5CBEC0; }
.role-pill-copper { background: rgba(192,123,80,0.1);  border-color: rgba(192,123,80,0.25); color: #D49870; }
.role-pill-coral  { background: rgba(224,112,96,0.1);  border-color: rgba(224,112,96,0.25); color: #EE9080; }

.menu-drop-enter-active, .menu-drop-leave-active { transition: all 0.2s ease; }
.menu-drop-enter-from, .menu-drop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
