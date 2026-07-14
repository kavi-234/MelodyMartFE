<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const paymentNotice = ref('')
const noticeType    = ref<'success' | 'cancel'>('success')

onMounted(() => {
  if (!authStore.user || authStore.user.role !== 'customer') {
    router.push('/')
    return
  }
  const paymentState = String(route.query.payment || '').toLowerCase()
  const orderId      = String(route.query.orderId || '')
  if (paymentState === 'success') {
    noticeType.value    = 'success'
    paymentNotice.value = orderId ? `Payment completed for order #${orderId}.` : 'Payment completed successfully.'
  } else if (paymentState === 'cancelled') {
    noticeType.value    = 'cancel'
    paymentNotice.value = orderId ? `Payment cancelled for order #${orderId}.` : 'Payment was cancelled.'
  }
})

const quickLinks = [
  { label: 'Shop',          icon: 'shop',    path: '#shop',    desc: 'Browse instruments',   color: '#D4A853' },
  { label: 'My Cart',       icon: 'cart',    path: '/dashboard/customer/cart',    desc: 'View & checkout',      color: '#38A882' },
  { label: 'My Orders',     icon: 'orders',  path: '/dashboard/customer/orders',  desc: 'Track deliveries',     color: '#2A9D9F' },
  { label: 'My Lessons',    icon: 'lessons', path: '/dashboard/customer/lessons', desc: 'Upcoming sessions',    color: '#C07B50' },
  { label: 'Repair Status', icon: 'repairs', path: '/dashboard/customer/services',desc: 'Track repairs',        color: '#E07060' },
]

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
</script>

<template>
  <div class="min-h-screen" style="background: var(--mm-graphite);">
    <!-- Page ambient glow -->
    <div class="fixed top-0 right-0 w-[500px] h-[300px] pointer-events-none" aria-hidden="true"
         style="background: radial-gradient(ellipse, rgba(212,168,83,0.04) 0%, transparent 70%); filter: blur(60px);" />

    <div class="relative z-10 mx-auto max-w-6xl px-5 py-10 lg:px-8">

      <!-- ── Greeting Header ─────────────────────────────── -->
      <div class="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p class="text-sm text-mm-sand font-sans mb-1">{{ greeting() }}</p>
          <h1 class="font-serif text-[2rem] text-mm-ivory leading-tight">
            {{ authStore.user?.name?.split(' ')[0] || 'Welcome back' }}<span class="text-mm-gold"> ♪</span>
          </h1>
          <p class="text-sm text-mm-sand font-sans mt-1">Here's what's happening with your Melody Mart account.</p>
        </div>
        <div class="flex gap-3">
          <router-link to="/dashboard/customer/lessons" class="btn-outline text-sm px-4 py-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6l4-4 4 4"/><path d="M12 2v10.3"/><path d="M4.93 10.93A10 10 0 1 0 19.07 10"/></svg>
            Book Lesson
          </router-link>
          <router-link to="/dashboard/customer/cart" class="btn-primary text-sm px-4 py-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
            My Cart
          </router-link>
        </div>
      </div>

      <!-- Payment notice -->
      <div v-if="paymentNotice" class="mb-8 rounded-xl px-4 py-3.5 flex items-center gap-3 border"
           :class="noticeType === 'success'
             ? 'bg-mm-emerald/8 border-mm-emerald/25 text-mm-emerald'
             : 'bg-mm-coral/8 border-mm-coral/25 text-mm-coral'">
        <svg v-if="noticeType === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <span class="text-sm font-medium">{{ paymentNotice }}</span>
      </div>

      <!-- ── Quick Access Grid ────────────────────────────── -->
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-5">
          <div class="h-px flex-1 bg-gradient-to-r from-mm-line to-transparent" />
          <span class="text-xs font-semibold tracking-[0.15em] uppercase text-mm-sand font-sans">Quick Access</span>
          <div class="h-px flex-1 bg-gradient-to-l from-mm-line to-transparent" />
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <router-link
            v-for="link in quickLinks"
            :key="link.label"
            :to="link.path"
            class="quick-card group"
          >
            <!-- Icon circle -->
            <div class="quick-icon" :style="{ '--accent': link.color }">
              <!-- Shop -->
              <svg v-if="link.icon === 'shop'" width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="link.color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              <!-- Cart -->
              <svg v-else-if="link.icon === 'cart'" width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="link.color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <!-- Orders -->
              <svg v-else-if="link.icon === 'orders'" width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="link.color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <!-- Lessons -->
              <svg v-else-if="link.icon === 'lessons'" width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="link.color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <!-- Repairs -->
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="link.color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <span class="text-sm font-semibold text-mm-cream group-hover:text-mm-ivory transition-colors font-sans">{{ link.label }}</span>
            <span class="text-xs text-mm-stone font-sans mt-0.5">{{ link.desc }}</span>
          </router-link>
        </div>
      </div>

      <!-- ── Explore sections ────────────────────────────── -->
      <div class="grid md:grid-cols-2 gap-5">
        <!-- Find Instruments -->
        <div class="explore-card" style="--card-glow: rgba(212,168,83,0.1);">
          <div class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div class="absolute right-[-20px] bottom-[-20px] w-48 h-48 rounded-full opacity-15"
                 style="background: radial-gradient(circle, rgba(212,168,83,0.3), transparent);" />
          </div>
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <span class="badge text-xs">Featured</span>
            </div>
            <h3 class="font-serif text-xl text-mm-ivory mb-2">Discover Instruments</h3>
            <p class="text-sm text-mm-sand font-sans mb-5 leading-relaxed">Guitars, pianos, drums, winds & more — new and pre-loved gear from trusted sellers.</p>
            <router-link to="/shop" class="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
              Browse Shop
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </router-link>
          </div>
        </div>

        <!-- Find Tutors -->
        <div class="explore-card" style="--card-glow: rgba(56,168,130,0.1);">
          <div class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div class="absolute right-[-20px] bottom-[-20px] w-48 h-48 rounded-full opacity-15"
                 style="background: radial-gradient(circle, rgba(56,168,130,0.3), transparent);" />
          </div>
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <span class="badge badge-emerald text-xs">Live Sessions</span>
            </div>
            <h3 class="font-serif text-xl text-mm-ivory mb-2">Learn from Experts</h3>
            <p class="text-sm text-mm-sand font-sans mb-5 leading-relaxed">One-on-one lessons with certified tutors. Guitar, piano, vocals, production and more.</p>
            <router-link to="/lessons" class="btn-secondary text-sm px-5 py-2.5 inline-flex items-center gap-2">
              Find Tutors
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </router-link>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.quick-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.1rem 1rem;
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  border-radius: 1rem;
  transition: all 0.25s ease;
  text-decoration: none;
  cursor: pointer;
}
.quick-card:hover {
  background: var(--mm-onyx);
  border-color: rgba(212,168,83,0.2);
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.35);
}
.quick-icon {
  width: 44px; height: 44px;
  border-radius: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 0.15rem;
  transition: background 0.2s;
}
.quick-card:hover .quick-icon {
  background: rgba(212,168,83,0.06);
}

.explore-card {
  position: relative;
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  border-radius: 1.25rem;
  padding: 1.75rem;
  transition: all 0.3s ease;
  overflow: hidden;
}
.explore-card:hover {
  border-color: rgba(212,168,83,0.18);
  box-shadow: 0 0 0 1px rgba(212,168,83,0.08), 0 16px 40px rgba(0,0,0,0.4);
  transform: translateY(-2px);
}
</style>
