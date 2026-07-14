<template>
  <div class="lp-page">
    <!-- Header -->
    <div class="lp-header">
      <button class="lp-back-btn" @click="router.back()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </button>
      <div>
        <h1 class="lp-title">Complete Payment</h1>
        <p class="lp-sub">Review your booking and complete payment to confirm your lesson.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="lp-state">
      <div class="lp-spinner" />
      <p>Loading booking details...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="lp-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--mm-coral);margin-bottom:0.5rem;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h3 class="lp-error-title">Something went wrong</h3>
      <p class="lp-error-msg">{{ error }}</p>
      <button class="lp-retry-btn" @click="fetchBooking">Try Again</button>
    </div>

    <!-- Payment Layout -->
    <div v-else-if="booking" class="lp-layout">
      <!-- Booking Summary Card -->
      <div class="lp-card">
        <div class="lp-card-hdr">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <h2>Booking Summary</h2>
        </div>

        <div class="lp-summary-grid">
          <div class="lp-summary-item">
            <span class="lp-sl">Lesson</span>
            <span class="lp-sv">{{ lessonTitle }}</span>
          </div>
          <div class="lp-summary-item">
            <span class="lp-sl">Instructor</span>
            <span class="lp-sv lp-sv-accent">{{ instructorName }}</span>
          </div>
          <div class="lp-summary-item">
            <span class="lp-sl">Available Days</span>
            <span class="lp-sv">{{ availableDays }}</span>
          </div>
          <div class="lp-summary-item">
            <span class="lp-sl">Time Slot</span>
            <span class="lp-sv">{{ timeSlot }}</span>
          </div>
          <div class="lp-summary-item">
            <span class="lp-sl">Duration</span>
            <span class="lp-sv">{{ duration }} minutes</span>
          </div>
          <div class="lp-summary-item">
            <span class="lp-sl">Status</span>
            <span class="lp-status-chip">{{ booking.bookingStatus || 'Pending Payment' }}</span>
          </div>
        </div>

        <div class="lp-id-row">
          <span class="lp-sl">Booking ID</span>
          <code class="lp-id-code">{{ booking._id }}</code>
        </div>

        <div class="lp-price-bar">
          <span class="lp-price-label">Total Amount Due</span>
          <span class="lp-price-value">Rs {{ lessonPrice }}</span>
        </div>
      </div>

      <!-- Payment Action Card -->
      <div class="lp-card lp-pay-card">
        <div class="lp-card-hdr">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <h2>Secure Payment</h2>
        </div>

        <div class="lp-payhere-info">
          <div class="lp-payhere-logo">
            <span class="lp-payhere-brand">PayHere</span>
            <span class="lp-payhere-sandbox">Sandbox</span>
          </div>
          <p class="lp-payhere-desc">You will be securely redirected to PayHere's payment gateway. Your card details are never stored by us.</p>
        </div>

        <div class="lp-amount-box">
          <span class="lp-amount-label">Amount to Pay</span>
          <span class="lp-amount-val">Rs {{ lessonPrice }}</span>
        </div>

        <div v-if="payError" class="lp-pay-error">{{ payError }}</div>

        <button class="lp-pay-btn" @click="payWithPayHere" :disabled="paymentLoading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          {{ paymentLoading ? 'Redirecting to PayHere...' : 'Pay with PayHere' }}
        </button>

        <button class="lp-later-btn" @click="router.push('/dashboard/customer/lessons')" :disabled="paymentLoading">
          Pay Later
        </button>

        <p class="lp-security-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Secured by PayHere. Payments are encrypted and processed safely.
        </p>
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

const bookingId = computed(() => route.params.bookingId)
const booking = ref(null)
const loading = ref(false)
const error = ref(null)
const paymentLoading = ref(false)
const payError = ref(null)

const lessonData = computed(() => booking.value?.lesson || booking.value)
const lessonTitle = computed(() => lessonData.value?.title || 'Music Lesson')
const instructorName = computed(() => lessonData.value?.tutor?.name || 'Unknown Instructor')
const availableDays = computed(() => {
  const days = lessonData.value?.availableDays || []
  return days.length ? days.join(', ') : 'To be confirmed'
})
const timeSlot = computed(() => {
  const slots = lessonData.value?.availableTimeSlots || []
  return slots[0] || 'To be confirmed'
})
const duration = computed(() => lessonData.value?.duration || 'N/A')
const lessonPrice = computed(() => lessonData.value?.price || 0)

const fetchBooking = async () => {
  const stateBooking = window.history.state?.booking
  if (stateBooking) {
    booking.value = stateBooking
    const currentPrice = stateBooking?.lesson?.price ?? stateBooking?.price
    if (!currentPrice) {
      try {
        const lessonId = stateBooking?.lesson?._id || stateBooking?._id || bookingId.value
        const lessonDetail = await lessonService.getLessonDetails(lessonId)
        if (lessonDetail?.price) {
          if (stateBooking.lesson) {
            booking.value = { ...stateBooking, lesson: { ...stateBooking.lesson, price: lessonDetail.price } }
          } else {
            booking.value = { ...stateBooking, price: lessonDetail.price }
          }
        }
      } catch (_) { /* non-fatal */ }
    }
    return
  }

  loading.value = true
  error.value = null
  try {
    const lesson = await lessonService.getLessonDetails(bookingId.value)
    booking.value = { _id: bookingId.value, bookingStatus: 'Pending Payment', paymentStatus: 'Pending', lesson }
  } catch (err) {
    error.value = 'Failed to load booking details. Please go back and try again.'
  } finally {
    loading.value = false
  }
}

const payWithPayHere = async () => {
  paymentLoading.value = true
  payError.value = null
  try {
    const data = await lessonService.initiatePayment(bookingId.value, lessonData.value)
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = data.actionUrl
    form.target = '_self'
    Object.entries(data.payload).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'; input.name = key; input.value = String(value)
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  } catch (err) {
    payError.value = err.message || 'Failed to initiate payment. Please try again.'
    paymentLoading.value = false
  }
}

onMounted(() => { fetchBooking() })
</script>

<style scoped>
.lp-page { padding: 1.75rem 2rem; max-width: 1100px; margin: 0 auto; }

.lp-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 2rem; }
.lp-back-btn {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.5rem 0.875rem; background: rgba(42,157,159,0.08); border: 1px solid rgba(42,157,159,0.2);
  border-radius: 0.5rem; color: var(--mm-teal); font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; white-space: nowrap; margin-top: 0.25rem; font-family: 'DM Sans', sans-serif;
}
.lp-back-btn:hover { background: rgba(42,157,159,0.14); }
.lp-title { font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.lp-sub { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; font-family: 'DM Sans', sans-serif; }

.lp-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 1.25rem; gap: 1rem; }
.lp-spinner { width: 44px; height: 44px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-teal); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.lp-state p { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; font-family: 'DM Sans', sans-serif; }
.lp-error-title { font-size: 1.25rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.lp-error-msg { font-size: 0.875rem; color: var(--mm-sand); max-width: 400px; text-align: center; margin: 0; font-family: 'DM Sans', sans-serif; }
.lp-retry-btn { padding: 0.625rem 1.5rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 0.5rem; }

.lp-layout { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start; }

.lp-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 1rem; overflow: hidden; }
.lp-card-hdr {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 1.125rem 1.5rem;
  background: linear-gradient(135deg, var(--mm-teal), #1F8080);
  color: var(--mm-ink);
}
.lp-card-hdr h2 { margin: 0; font-size: 1rem; font-weight: 700; }
.lp-card-hdr svg { flex-shrink: 0; }

.lp-summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 0.5rem 1.5rem; }
.lp-summary-item {
  display: flex; flex-direction: column; gap: 0.3rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--mm-warm-line);
}
.lp-summary-item:nth-child(odd) { padding-right: 1rem; border-right: 1px solid var(--mm-warm-line); }
.lp-summary-item:nth-child(even) { padding-left: 1rem; }
.lp-sl { font-size: 0.6875rem; font-weight: 700; color: var(--mm-teal); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'DM Sans', sans-serif; }
.lp-sv { font-size: 0.875rem; font-weight: 700; color: var(--mm-ivory); font-family: 'DM Sans', sans-serif; }
.lp-sv-accent { color: var(--mm-teal); }
.lp-status-chip { display: inline-flex; align-items: center; padding: 0.2rem 0.5625rem; border-radius: 2rem; font-size: 0.6875rem; font-weight: 700; background: rgba(245,158,11,0.1); color: #F59E0B; border: 1px solid rgba(245,158,11,0.25); }

.lp-id-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; background: rgba(42,157,159,0.03); border-top: 1px solid var(--mm-warm-line); flex-wrap: wrap; }
.lp-id-code { font-family: 'Courier New', monospace; font-size: 0.75rem; color: var(--mm-teal); background: rgba(42,157,159,0.08); padding: 0.25rem 0.625rem; border-radius: 0.375rem; border: 1px solid rgba(42,157,159,0.15); word-break: break-all; }

.lp-price-bar { display: flex; justify-content: space-between; align-items: center; padding: 1.125rem 1.5rem; background: rgba(42,157,159,0.06); border-top: 1px solid rgba(42,157,159,0.2); }
.lp-price-label { font-size: 0.875rem; font-weight: 700; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }
.lp-price-value { font-family: 'DM Serif Display', serif; font-size: 1.75rem; font-weight: 400; color: var(--mm-teal); }

.lp-pay-card { display: flex; flex-direction: column; }
.lp-payhere-info { padding: 1.25rem 1.5rem 0.25rem; }
.lp-payhere-logo { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.75rem; }
.lp-payhere-brand { font-size: 1.375rem; font-weight: 800; color: var(--mm-ivory); letter-spacing: -0.5px; }
.lp-payhere-sandbox { font-size: 0.6875rem; font-weight: 700; padding: 0.1875rem 0.5rem; background: rgba(245,158,11,0.1); color: #F59E0B; border-radius: 0.375rem; border: 1px solid rgba(245,158,11,0.25); }
.lp-payhere-desc { font-size: 0.8125rem; color: var(--mm-sand); line-height: 1.5; margin: 0; font-family: 'DM Sans', sans-serif; }

.lp-amount-box { margin: 1rem 1.5rem 0; padding: 0.875rem 1rem; background: rgba(42,157,159,0.07); border: 1px solid rgba(42,157,159,0.2); border-radius: 0.75rem; display: flex; justify-content: space-between; align-items: center; }
.lp-amount-label { font-size: 0.8125rem; font-weight: 700; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }
.lp-amount-val { font-family: 'DM Serif Display', serif; font-size: 1.375rem; font-weight: 400; color: var(--mm-teal); }

.lp-pay-error { margin: 0.75rem 1.5rem 0; padding: 0.625rem 0.875rem; background: rgba(224,112,96,0.1); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.5rem; color: var(--mm-coral); font-size: 0.8125rem; font-weight: 600; font-family: 'DM Sans', sans-serif; }

.lp-pay-btn {
  margin: 1rem 1.5rem 0;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink);
  border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 4px 14px rgba(42,157,159,0.25); font-family: 'DM Sans', sans-serif;
}
.lp-pay-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(42,157,159,0.35); }
.lp-pay-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.lp-later-btn {
  margin: 0.625rem 1.5rem 0;
  padding: 0.6875rem 1.25rem;
  background: transparent; color: var(--mm-sand); border: 1px solid var(--mm-warm-line);
  border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.lp-later-btn:hover:not(:disabled) { background: var(--mm-mist); color: var(--mm-ivory); }
.lp-later-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.lp-security-note {
  display: flex; align-items: center; justify-content: center; gap: 0.375rem;
  margin: 0.875rem 1.5rem 1.5rem; font-size: 0.75rem; color: var(--mm-stone); text-align: center;
  font-family: 'DM Sans', sans-serif; line-height: 1.4;
}

@media (max-width: 900px) { .lp-layout { grid-template-columns: 1fr; } }
@media (max-width: 640px) {
  .lp-page { padding: 1.25rem; }
  .lp-header { flex-direction: column; gap: 0.75rem; }
  .lp-title { font-size: 1.5rem; }
  .lp-summary-grid { grid-template-columns: 1fr; padding: 0.5rem 1rem; }
  .lp-summary-item:nth-child(odd) { padding-right: 0; border-right: none; }
  .lp-summary-item:nth-child(even) { padding-left: 0; }
  .lp-id-row { flex-direction: column; align-items: flex-start; padding: 0.875rem 1rem; }
  .lp-price-bar, .lp-card-hdr, .lp-payhere-info, .lp-amount-box, .lp-pay-btn, .lp-later-btn, .lp-pay-error, .lp-security-note { padding-left: 1rem; padding-right: 1rem; }
  .lp-amount-box { margin-left: 1rem; margin-right: 1rem; }
  .lp-pay-btn { margin-left: 1rem; margin-right: 1rem; }
  .lp-later-btn { margin-left: 1rem; margin-right: 1rem; }
  .lp-pay-error { margin-left: 1rem; margin-right: 1rem; }
}
</style>
