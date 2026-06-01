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
    query: {
      payment: 'success',
      orderId: orderId.value || undefined,
    },
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
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-payhere-reconcile-source': 'return',
      },
      body: JSON.stringify({ source: 'return' }),
    })
  } catch {
    // Ignore and let the status poll retry.
  }
}

const loadOrderStatus = async () => {
  const token = localStorage.getItem('token')
  if (!token || !orderId.value) return

  try {
    const response = await fetch(`http://localhost:5000/api/payments/orders/${orderId.value}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) return

    const data = await response.json()
    orderStatus.value = data.order?.status || 'PENDING'

    if (orderStatus.value === 'PAID') {
      statusMessage.value = 'Payment confirmed and your order has been recorded.'
      if (redirectTimer) {
        window.clearTimeout(redirectTimer)
      }
      redirectTimer = window.setTimeout(() => {
        void redirectToOrderHistory()
      }, 900)
    } else if (orderStatus.value === 'FAILED') {
      statusMessage.value = 'The payment was not completed successfully.'
    } else {
      statusMessage.value = 'Your payment is still being verified by PayHere.'
      if (isSuccess.value) {
        statusPollCount.value += 1
        if (statusPollCount.value === 1) {
          await requestReturnReconcile()
        }

        if (redirectTimer) {
          window.clearTimeout(redirectTimer)
        }

        redirectTimer = window.setTimeout(() => {
          void loadOrderStatus()
        }, 1200)
      }
    }
  } catch {
    statusMessage.value = 'Your payment is still being verified by PayHere.'
    if (isSuccess.value) {
      statusPollCount.value += 1
      if (statusPollCount.value === 1) {
        await requestReturnReconcile()
      }

      if (redirectTimer) {
        window.clearTimeout(redirectTimer)
      }
      redirectTimer = window.setTimeout(() => {
        void loadOrderStatus()
      }, 1500)
    }
  }
}

onMounted(() => {
  void loadOrderStatus()
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 px-6 py-16 text-white">
    <div class="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
      <div
        class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
        :class="isSuccess ? 'bg-emerald-500/15 text-emerald-400' : isCancelled ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-300'"
      >
        <span v-if="isSuccess">✓</span>
        <span v-else-if="isCancelled">!</span>
        <span v-else>?</span>
      </div>

      <h1 class="text-3xl font-bold">{{ title }}</h1>
      <p class="mt-4 text-slate-300">{{ message }}</p>
      <p class="mt-2 text-sm text-slate-400">{{ statusMessage }}</p>

      <div v-if="orderId" class="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
        Order ID: <span class="font-semibold text-white">{{ orderId }}</span>
      </div>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          @click="goToDashboard"
          class="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 font-semibold text-white hover:from-purple-700 hover:to-indigo-700"
        >
          Go to Order History
        </button>
        <button
          @click="goToShop"
          class="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-800"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  </div>
</template>