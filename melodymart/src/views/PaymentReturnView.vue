<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const paymentState = computed(() => String(route.query.payment || '').toLowerCase())
const orderId = computed(() => String(route.query.orderId || ''))

const isSuccess = computed(() => paymentState.value === 'success')
const isCancelled = computed(() => paymentState.value === 'cancelled')
const orderStatus = ref('PENDING')
const statusMessage = ref('Waiting for payment confirmation...')
const isRedirecting = ref(false)
const reconcileRequested = ref(false)
const statusPollCount = ref(0)

let redirectTimer: number | undefined

const title = computed(() => {
  if (isSuccess.value) return 'Payment Successful'
  if (isCancelled.value) return 'Payment Cancelled'
  return 'Payment Status'
})

const message = computed(() => {
  if (isSuccess.value) {
    return 'Your payment was completed. You will be redirected to your order history once the backend confirms the order.'
  }
  if (isCancelled.value) {
    return 'Your payment was cancelled. Your cart items are still available for checkout.'
  }
  return 'We could not determine the payment result from the return data.'
})

const goToDashboard = () => router.push('/dashboard/customer#order-history')
const goToShop = () => router.push('/shop')

const redirectToOrderHistory = async () => {
  if (isRedirecting.value) return
  isRedirecting.value = true
  await router.replace({
    path: '/dashboard/customer',
    query: { payment: 'success', orderId: orderId.value || undefined },
    hash: '#order-history',
  })
}

const requestReturnReconcile = async () => {
  if (reconcileRequested.value || !orderId.value) return
  reconcileRequested.value = true
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    await fetch(`http://localhost:5000/api/payments/orders/${orderId.value}/reconcile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'x-payhere-reconcile-source': 'return' },
      body: JSON.stringify({ source: 'return' }),
    })
  } catch { /* ignore */ }
}

const loadOrderStatus = async () => {
  const token = localStorage.getItem('token')
  if (!token || !orderId.value) return
  try {
    const response = await fetch(`http://localhost:5000/api/payments/orders/${orderId.value}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) return
    const data = await response.json()
    orderStatus.value = data.order?.status || 'PENDING'
    if (orderStatus.value === 'PAID') {
      statusMessage.value = 'Payment confirmed and your order has been recorded.'
      if (redirectTimer) window.clearTimeout(redirectTimer)
      redirectTimer = window.setTimeout(() => { void redirectToOrderHistory() }, 900)
    } else if (orderStatus.value === 'FAILED') {
      statusMessage.value = 'The payment was not completed successfully.'
    } else {
      statusMessage.value = 'Your payment is still being verified by PayHere.'
      if (isSuccess.value) {
        statusPollCount.value += 1
        if (statusPollCount.value === 1) await requestReturnReconcile()
        if (redirectTimer) window.clearTimeout(redirectTimer)
        redirectTimer = window.setTimeout(() => { void loadOrderStatus() }, 1200)
      }
    }
  } catch {
    statusMessage.value = 'Your payment is still being verified by PayHere.'
    if (isSuccess.value) {
      statusPollCount.value += 1
      if (statusPollCount.value === 1) await requestReturnReconcile()
      if (redirectTimer) window.clearTimeout(redirectTimer)
      redirectTimer = window.setTimeout(() => { void loadOrderStatus() }, 1500)
    }
  }
}

onMounted(() => { void loadOrderStatus() })
</script>

<template>
  <div class="prv-page">
    <div class="prv-card">
      <div class="prv-icon" :class="isSuccess ? 'icon-emerald' : isCancelled ? 'icon-amber' : 'icon-default'">
        <svg v-if="isSuccess" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else-if="isCancelled" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>

      <h1 class="prv-title">{{ title }}</h1>
      <p class="prv-msg">{{ message }}</p>
      <p class="prv-status">{{ statusMessage }}</p>

      <div v-if="orderId" class="prv-order-box">
        Order ID: <span class="prv-order-id">{{ orderId }}</span>
      </div>

      <div class="prv-actions">
        <button @click="goToDashboard" class="prv-btn-primary">Go to Order History</button>
        <button @click="goToShop" class="prv-btn-secondary">Continue Shopping</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prv-page {
  min-height: 100vh;
  background: var(--mm-graphite);
  display: flex; align-items: center; justify-content: center;
  padding: 4rem 1.5rem;
}
.prv-card {
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  border-radius: 1.5rem;
  padding: 2.5rem;
  max-width: 42rem; width: 100%;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}
.prv-icon {
  width: 64px; height: 64px; border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.5rem;
}
.icon-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.icon-amber   { background: rgba(245,158,11,0.12);  color: #F59E0B; border: 1px solid rgba(245,158,11,0.25); }
.icon-default { background: var(--mm-mist); color: var(--mm-stone); border: 1px solid var(--mm-warm-line); }
.prv-title  { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 1rem; letter-spacing: -0.02em; }
.prv-msg    { font-size: 1rem; color: var(--mm-sand); margin: 0 0 0.5rem; line-height: 1.6; font-family: 'DM Sans', sans-serif; }
.prv-status { font-size: 0.875rem; color: var(--mm-stone); margin: 0 0 1.5rem; font-family: 'DM Sans', sans-serif; }
.prv-order-box {
  margin-bottom: 2rem; padding: 1rem 1.25rem;
  background: var(--mm-onyx); border: 1px solid var(--mm-warm-line);
  border-radius: 0.75rem; font-size: 0.875rem; color: var(--mm-stone);
  font-family: 'DM Sans', sans-serif;
}
.prv-order-id { font-weight: 700; color: var(--mm-ivory); font-family: 'Courier New', monospace; }
.prv-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.prv-btn-primary {
  flex: 1; min-width: 180px; padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink);
  border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 16px rgba(212,168,83,0.25);
}
.prv-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(212,168,83,0.35); }
.prv-btn-secondary {
  flex: 1; min-width: 160px; padding: 0.875rem 1.5rem;
  background: transparent; color: var(--mm-cream); border: 1px solid var(--mm-warm-line);
  border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.prv-btn-secondary:hover { background: var(--mm-mist); border-color: var(--mm-stone); color: var(--mm-ivory); }
@media (max-width: 480px) { .prv-card { padding: 1.5rem; } .prv-actions { flex-direction: column; } .prv-btn-primary, .prv-btn-secondary { min-width: unset; } }
</style>
