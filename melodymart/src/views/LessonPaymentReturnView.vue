<template>
  <div class="lpr-page">
    <div class="lpr-card">
      <div class="lpr-icon" :class="iconClass">
        <svg v-if="isSuccess" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else-if="isCancelled" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>

      <h1 class="lpr-title">{{ title }}</h1>
      <p class="lpr-message">{{ message }}</p>
      <p class="lpr-status">{{ statusMessage }}</p>

      <div v-if="bookingId" class="lpr-booking-box">
        Booking ID: <span class="lpr-booking-id">{{ bookingId }}</span>
      </div>

      <div class="lpr-actions">
        <button @click="goToMyLessons" class="lpr-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          Go to My Lessons
        </button>
        <button @click="goToBrowse" class="lpr-btn-secondary">Browse More Lessons</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import lessonService from '../services/lessonService'

const route = useRoute()
const router = useRouter()

const paymentState = computed(() => String(route.query.payment || '').toLowerCase())
const bookingId = computed(() => String(route.query.bookingId || route.query.orderId || ''))

const isSuccess = computed(() => paymentState.value === 'success')
const isCancelled = computed(() => paymentState.value === 'cancelled')

const statusMessage = ref('Verifying your payment...')
const reconcileRequested = ref(false)
const statusPollCount = ref(0)
const isRedirecting = ref(false)

let redirectTimer

const iconClass = computed(() => {
  if (isSuccess.value) return 'icon-emerald'
  if (isCancelled.value) return 'icon-amber'
  return 'icon-default'
})

const title = computed(() => {
  if (isSuccess.value) return 'Payment Successful!'
  if (isCancelled.value) return 'Payment Cancelled'
  return 'Payment Status'
})

const message = computed(() => {
  if (isSuccess.value) return 'Your payment was completed. Your lesson booking is being confirmed — you will be redirected to My Lessons shortly.'
  if (isCancelled.value) return 'Your payment was cancelled. Your booking is still saved — you can pay anytime from My Lessons.'
  return 'We could not determine the payment result. Please check My Lessons for your booking status.'
})

const goToMyLessons = () => {
  if (isRedirecting.value) return
  router.replace('/dashboard/customer/lessons')
}

const goToBrowse = () => router.push('/lessons')

const requestReconcile = async () => {
  if (reconcileRequested.value || !bookingId.value) return
  reconcileRequested.value = true
  try {
    await lessonService.reconcilePayment(bookingId.value)
  } catch { /* let poll retry */ }
}

const redirectToMyLessons = () => {
  if (isRedirecting.value) return
  isRedirecting.value = true
  redirectTimer = window.setTimeout(() => {
    router.replace('/dashboard/customer/lessons')
  }, 1200)
}

const pollBookingStatus = async () => {
  const token = localStorage.getItem('token')
  if (!token || !bookingId.value) return
  try {
    const data = await lessonService.getBookingDetails(bookingId.value)
    const payStatus = data?.paymentStatus || ''
    if (payStatus === 'Paid') {
      statusMessage.value = 'Payment confirmed! Your lesson is now booked.'
      clearTimeout(redirectTimer)
      redirectToMyLessons()
    } else if (payStatus === 'Failed') {
      statusMessage.value = 'Payment was not completed successfully.'
    } else {
      statusMessage.value = 'Still verifying your payment with PayHere...'
      if (isSuccess.value) {
        statusPollCount.value += 1
        if (statusPollCount.value === 1) await requestReconcile()
        clearTimeout(redirectTimer)
        redirectTimer = window.setTimeout(() => void pollBookingStatus(), 1500)
      }
    }
  } catch {
    statusMessage.value = 'Verifying payment status...'
    if (isSuccess.value) {
      statusPollCount.value += 1
      if (statusPollCount.value === 1) await requestReconcile()
      clearTimeout(redirectTimer)
      redirectTimer = window.setTimeout(() => void pollBookingStatus(), 2000)
    }
  }
}

onMounted(() => {
  if (isSuccess.value) void pollBookingStatus()
  else if (isCancelled.value) statusMessage.value = 'Your booking has been saved. Complete payment anytime from My Lessons.'
})
</script>

<style scoped>
.lpr-page {
  min-height: 100vh;
  background: var(--mm-graphite);
  display: flex; align-items: center; justify-content: center;
  padding: 2rem 1.5rem;
}
.lpr-card {
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  border-radius: 1.5rem;
  padding: 2.5rem;
  max-width: 32rem; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: flex; flex-direction: column; gap: 0;
}
.lpr-icon {
  width: 64px; height: 64px; border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.25rem;
}
.icon-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1.5px solid rgba(56,168,130,0.25); }
.icon-amber   { background: rgba(245,158,11,0.12);  color: #F59E0B; border: 1.5px solid rgba(245,158,11,0.25); }
.icon-default { background: rgba(42,157,159,0.1);   color: var(--mm-teal); border: 1.5px solid rgba(42,157,159,0.25); }
.lpr-title   { font-family: 'DM Serif Display', serif; font-size: 1.75rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.75rem; letter-spacing: -0.02em; }
.lpr-message { font-size: 0.9375rem; color: var(--mm-sand); line-height: 1.6; margin: 0 0 0.5rem; font-family: 'DM Sans', sans-serif; }
.lpr-status  { font-size: 0.8125rem; color: var(--mm-stone); margin: 0 0 1.25rem; font-family: 'DM Sans', sans-serif; }
.lpr-booking-box {
  padding: 0.75rem 1rem;
  background: var(--mm-onyx); border: 1px solid var(--mm-warm-line);
  border-radius: 0.625rem; font-size: 0.8125rem; color: var(--mm-stone);
  margin-bottom: 1.5rem; font-family: 'DM Sans', sans-serif;
}
.lpr-booking-id { font-family: 'Courier New', monospace; font-weight: 700; color: var(--mm-teal); word-break: break-all; }
.lpr-actions { display: flex; flex-direction: column; gap: 0.625rem; }
.lpr-btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.8125rem 1.25rem;
  background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink);
  border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 14px rgba(42,157,159,0.25);
}
.lpr-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(42,157,159,0.35); }
.lpr-btn-secondary {
  padding: 0.75rem 1.25rem;
  background: transparent; color: var(--mm-sand); border: 1px solid var(--mm-warm-line);
  border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.lpr-btn-secondary:hover { background: var(--mm-mist); color: var(--mm-ivory); }
@media (max-width: 480px) { .lpr-card { padding: 1.5rem; border-radius: 1rem; } .lpr-title { font-size: 1.5rem; } }
</style>
