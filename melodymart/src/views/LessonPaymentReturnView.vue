<template>
  <div class="return-page">
    <div class="return-card">
      <!-- Status Icon -->
      <div class="status-icon" :class="iconClass">
        <span v-if="isSuccess">✓</span>
        <span v-else-if="isCancelled">!</span>
        <span v-else>?</span>
      </div>

      <h1 class="return-title">{{ title }}</h1>
      <p class="return-message">{{ message }}</p>
      <p class="status-message">{{ statusMessage }}</p>

      <div v-if="bookingId" class="booking-id-box">
        Booking ID: <span class="booking-id-value">{{ bookingId }}</span>
      </div>

      <div class="action-buttons">
        <button @click="goToMyLessons" class="btn-primary">
          📚 Go to My Lessons
        </button>
        <button @click="goToBrowse" class="btn-secondary">
          Browse More Lessons
        </button>
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
  if (isSuccess.value) return 'icon-success'
  if (isCancelled.value) return 'icon-cancelled'
  return 'icon-unknown'
})

const title = computed(() => {
  if (isSuccess.value) return 'Payment Successful!'
  if (isCancelled.value) return 'Payment Cancelled'
  return 'Payment Status'
})

const message = computed(() => {
  if (isSuccess.value) {
    return 'Your payment was completed. Your lesson booking is being confirmed — you will be redirected to My Lessons shortly.'
  }
  if (isCancelled.value) {
    return 'Your payment was cancelled. Your booking is still saved — you can pay anytime from My Lessons.'
  }
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
  } catch {
    // Let poll retry
  }
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
  if (isSuccess.value) {
    void pollBookingStatus()
  } else if (isCancelled.value) {
    statusMessage.value = 'Your booking has been saved. Complete payment anytime from My Lessons.'
  }
})
</script>

<style scoped>
.return-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FBF7FF 0%, rgba(222, 172, 245, 0.12) 50%, #f8f5fb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.return-card {
  background: white;
  border: 2px solid #DEACF5;
  border-radius: 24px;
  padding: 40px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(151, 84, 203, 0.12);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

.status-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
}

.icon-success {
  background: rgba(5, 150, 105, 0.12);
  color: #059669;
  border: 1.5px solid rgba(5, 150, 105, 0.2);
}

.icon-cancelled {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1.5px solid rgba(245, 158, 11, 0.2);
}

.icon-unknown {
  background: rgba(151, 84, 203, 0.08);
  color: #9754CB;
  border: 1.5px solid rgba(151, 84, 203, 0.15);
}

.return-title {
  font-size: 28px;
  font-weight: 800;
  color: #1b1030;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.return-message {
  font-size: 15px;
  color: rgba(40, 16, 60, 0.7);
  line-height: 1.6;
  margin: 0 0 8px 0;
}

.status-message {
  font-size: 13px;
  color: rgba(40, 16, 60, 0.5);
  margin: 0 0 20px 0;
}

.booking-id-box {
  width: 100%;
  padding: 12px 16px;
  background: rgba(151, 84, 203, 0.05);
  border: 1px solid rgba(151, 84, 203, 0.15);
  border-radius: 10px;
  font-size: 13px;
  color: rgba(40, 16, 60, 0.65);
  margin-bottom: 24px;
}

.booking-id-value {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #6237A0;
  word-break: break-all;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.btn-primary {
  padding: 13px 20px;
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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(151, 84, 203, 0.3);
}

.btn-secondary {
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

.btn-secondary:hover {
  background: rgba(151, 84, 203, 0.06);
}

@media (max-width: 480px) {
  .return-card {
    padding: 28px 20px;
    border-radius: 16px;
  }

  .return-title {
    font-size: 22px;
  }
}
</style>
