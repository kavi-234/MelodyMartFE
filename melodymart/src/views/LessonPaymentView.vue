<template>
  <div class="payment-page">
    <!-- Page Header -->
    <div class="page-header">
      <button class="back-btn" @click="router.back()">← Back</button>
      <div class="header-content">
        <h1 class="page-title">Complete Payment</h1>
        <p class="page-subtitle">Review your booking and complete payment to confirm your lesson.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>Loading booking details...</p>
    </div>

    <!-- Error State -->
    <div class="error-state" v-else-if="error">
      <span class="error-icon">⚠️</span>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchBooking">Try Again</button>
    </div>

    <!-- Payment Layout -->
    <div class="payment-layout" v-else-if="booking">

      <!-- Booking Summary Card -->
      <div class="booking-card">
        <div class="card-header-bar">
          <span class="card-icon">🎵</span>
          <h2>Booking Summary</h2>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">📚 Lesson</span>
            <span class="summary-value">{{ lessonTitle }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">👨‍🏫 Instructor</span>
            <span class="summary-value instructor">{{ instructorName }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">📅 Available Days</span>
            <span class="summary-value">{{ availableDays }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">⏰ Time Slot</span>
            <span class="summary-value">{{ timeSlot }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">⏱️ Duration</span>
            <span class="summary-value">{{ duration }} minutes</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">📋 Status</span>
            <span class="status-chip pending">{{ booking.bookingStatus || 'Pending Payment' }}</span>
          </div>
        </div>

        <div class="booking-id-row">
          <span class="summary-label">🆔 Booking ID</span>
          <code class="booking-id-code">{{ booking._id }}</code>
        </div>

        <div class="price-bar">
          <span class="price-label">Total Amount Due</span>
          <span class="price-value">Rs {{ lessonPrice }}</span>
        </div>
      </div>

      <!-- Payment Action Card -->
      <div class="payment-action-card">
        <div class="card-header-bar">
          <span class="card-icon">💳</span>
          <h2>Secure Payment</h2>
        </div>

        <div class="payhere-info">
          <div class="payhere-logo-box">
            <span class="payhere-brand">PayHere</span>
            <span class="payhere-tag">Sandbox</span>
          </div>
          <p class="payhere-desc">
            You will be securely redirected to PayHere's payment gateway. Your card details are never stored by us.
          </p>
        </div>

        <div class="amount-display">
          <span class="amount-label">Amount to Pay</span>
          <span class="amount-value">Rs {{ lessonPrice }}</span>
        </div>

        <div v-if="payError" class="pay-error">
          ⚠️ {{ payError }}
        </div>

        <button
          class="pay-btn"
          @click="payWithPayHere"
          :disabled="paymentLoading"
        >
          <span v-if="paymentLoading">Redirecting to PayHere...</span>
          <span v-else>💳 Pay with PayHere</span>
        </button>

        <button
          class="later-btn"
          @click="router.push('/dashboard/customer/lessons')"
          :disabled="paymentLoading"
        >
          Pay Later
        </button>

        <p class="security-note">
          🔒 Secured by PayHere. Payments are encrypted and processed safely.
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

// Support both flat API response and nested lesson object
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
  // Use booking data passed via router state first (avoids needing /api/bookings/:id endpoint)
  const stateBooking = window.history.state?.booking
  if (stateBooking) {
    booking.value = stateBooking

    // Enrollment records from My Lessons often omit price — silently fetch it
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
      } catch (_) { /* non-fatal: price stays 0 */ }
    }
    return
  }

  // Fall back to lesson details API (works without /api/bookings/:id endpoint)
  loading.value = true
  error.value = null
  try {
    const lesson = await lessonService.getLessonDetails(bookingId.value)
    booking.value = {
      _id: bookingId.value,
      bookingStatus: 'Pending Payment',
      paymentStatus: 'Pending',
      lesson
    }
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
      input.type = 'hidden'
      input.name = key
      input.value = String(value)
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

onMounted(() => {
  fetchBooking()
})
</script>

<style scoped>
:root {
  --p-900: #28104E;
  --p-700: #6237A0;
  --p-500: #9754CB;
  --p-300: #DEACF5;
  --p-50: #FBF7FF;
  --text-dark: #1b1030;
}

.payment-page {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
  min-height: calc(100vh - 96px);
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  padding: 8px 16px;
  background: rgba(151, 84, 203, 0.08);
  border: 1px solid rgba(151, 84, 203, 0.2);
  border-radius: 8px;
  color: #6237A0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-top: 4px;
}

.back-btn:hover {
  background: rgba(151, 84, 203, 0.14);
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: #1b1030;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(40, 16, 60, 0.65);
  margin: 0;
}

/* Layout */
.payment-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}

/* Shared card base */
.booking-card,
.payment-action-card {
  background: #ffffff;
  border: 2px solid #DEACF5;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(151, 84, 203, 0.1);
}

.card-header-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 24px;
  background: linear-gradient(90deg, #9754CB, #DEACF5);
}

.card-icon {
  font-size: 20px;
}

.card-header-bar h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 8px 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(151, 84, 203, 0.08);
}

.summary-item:nth-child(odd) {
  padding-right: 16px;
  border-right: 1px solid rgba(151, 84, 203, 0.08);
}

.summary-item:nth-child(even) {
  padding-left: 16px;
}

.summary-label {
  font-size: 11px;
  font-weight: 700;
  color: #9754CB;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.summary-value {
  font-size: 14px;
  font-weight: 700;
  color: #1b1030;
}

.summary-value.instructor {
  color: #6237A0;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  width: fit-content;
}

.status-chip.pending {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

/* Booking ID */
.booking-id-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: rgba(151, 84, 203, 0.03);
  border-top: 1px solid rgba(151, 84, 203, 0.1);
}

.booking-id-code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #6237A0;
  background: rgba(151, 84, 203, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(151, 84, 203, 0.15);
  word-break: break-all;
}

/* Price Bar */
.price-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: linear-gradient(90deg, #FBF7FF, #F3E8FF);
  border-top: 2px solid #DEACF5;
}

.price-label {
  font-size: 14px;
  font-weight: 700;
  color: #6237A0;
}

.price-value {
  font-size: 28px;
  font-weight: 800;
  color: #9754CB;
}

/* Payment Action Card */
.payment-action-card {
  display: flex;
  flex-direction: column;
}

.payhere-info {
  padding: 20px 24px 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payhere-logo-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payhere-brand {
  font-size: 22px;
  font-weight: 800;
  color: #1b1030;
  letter-spacing: -0.5px;
}

.payhere-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  border: 1px solid #fcd34d;
}

.payhere-desc {
  font-size: 13px;
  color: rgba(40, 16, 60, 0.65);
  line-height: 1.5;
  margin: 0;
}

.amount-display {
  margin: 16px 24px 0;
  padding: 14px;
  background: linear-gradient(90deg, #FBF7FF, #F3E8FF);
  border-radius: 10px;
  border: 1.5px solid #DEACF5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 13px;
  font-weight: 700;
  color: #6237A0;
}

.amount-value {
  font-size: 22px;
  font-weight: 800;
  color: #9754CB;
}

.pay-error {
  margin: 12px 24px 0;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
}

.pay-btn {
  margin: 16px 24px 0;
  padding: 14px 20px;
  background: linear-gradient(90deg, #9754CB, #DEACF5);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(151, 84, 203, 0.25);
}

.pay-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(151, 84, 203, 0.35);
}

.pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.later-btn {
  margin: 10px 24px 0;
  padding: 11px 20px;
  background: transparent;
  color: #6237A0;
  border: 1.5px solid rgba(151, 84, 203, 0.25);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.later-btn:hover:not(:disabled) {
  background: rgba(151, 84, 203, 0.06);
}

.later-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.security-note {
  margin: 14px 24px 20px;
  font-size: 12px;
  color: rgba(40, 16, 60, 0.5);
  text-align: center;
  line-height: 1.4;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(151, 84, 203, 0.1);
  border-top-color: #9754CB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 16px;
  color: rgba(40, 16, 60, 0.65);
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 12px;
  text-align: center;
}

.error-icon { font-size: 48px; }

.error-state h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1b1030;
  margin: 0;
}

.error-state p {
  font-size: 14px;
  color: rgba(40, 16, 60, 0.65);
  max-width: 400px;
  margin: 0;
}

.retry-btn {
  padding: 10px 24px;
  background: #9754CB;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 8px;
}

.retry-btn:hover { background: #6237A0; }

/* Responsive */
@media (max-width: 900px) {
  .payment-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .payment-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .page-title {
    font-size: 24px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    padding: 8px 16px;
  }

  .summary-item:nth-child(odd) {
    padding-right: 0;
    border-right: none;
  }

  .summary-item:nth-child(even) {
    padding-left: 0;
  }

  .booking-id-row {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
  }

  .price-bar {
    padding: 16px;
  }
}
</style>
