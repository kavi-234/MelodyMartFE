<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CartView from '../components/CartView.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const orders = ref<any[]>([])
const ordersLoading = ref(false)
const ordersError = ref('')
const paymentNotice = ref('')

const fetchOrders = async () => {
  ordersLoading.value = true
  ordersError.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('http://localhost:5000/api/payments/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to load order history')
    }

    const data = await response.json()
    orders.value = data.orders || []
  } catch (error: any) {
    ordersError.value = error.message || 'Failed to load orders'
  } finally {
    ordersLoading.value = false
  }
}

onMounted(() => {
  if (!authStore.user || authStore.user.role !== 'customer') {
    router.push('/')
    return
  }

  const paymentState = String(route.query.payment || '').toLowerCase()
  const orderId = String(route.query.orderId || '')

  if (paymentState === 'success') {
    paymentNotice.value = orderId
      ? `Payment completed for order ${orderId}.`
      : 'Payment completed successfully.'
  } else if (paymentState === 'cancelled') {
    paymentNotice.value = orderId
      ? `Payment was cancelled for order ${orderId}.`
      : 'Payment was cancelled.'
  }

  fetchOrders()
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 p-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-white">Customer Dashboard</h1>
        <p class="text-slate-400">Welcome back, {{ authStore.user?.name }}!</p>
      </div>

      <!-- Cart Section -->
      <div class="mb-8">
        <CartView />
      </div>

      <div v-if="paymentNotice" class="mb-8 rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-emerald-300">
        {{ paymentNotice }}
      </div>

      <div id="order-history" class="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-white">Order History</h2>
            <p class="text-sm text-slate-400">Recent purchases completed through PayHere</p>
          </div>
          <button
            @click="fetchOrders"
            class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        <div v-if="ordersLoading" class="py-8 text-center text-slate-400">Loading orders...</div>
        <div v-else-if="ordersError" class="rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-300">
          {{ ordersError }}
        </div>
        <div v-else-if="orders.length === 0" class="py-8 text-center text-slate-400">
          No orders yet. Once you complete a PayHere payment, the order will appear here.
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.orderId"
            class="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-sm text-slate-400">Order ID</p>
                <p class="font-semibold text-white">{{ order.orderId }}</p>
              </div>
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="order.status === 'PAID' ? 'bg-emerald-500/15 text-emerald-400' : order.status === 'FAILED' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'"
              >
                {{ order.status }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div>
                <p class="text-slate-500">Amount</p>
                <p class="font-semibold text-white">Rs {{ Number(order.amount).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-slate-500">Items</p>
                <p class="font-semibold text-white">{{ order.itemCount }}</p>
              </div>
              <div>
                <p class="text-slate-500">Placed</p>
                <p class="font-semibold text-white">{{ new Date(order.createdAt).toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <h2 class="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">📦</div>
          <h3 class="mb-2 text-xl font-semibold text-white">My Orders</h3>
          <p class="mb-4 text-slate-400">View your purchase history</p>
          <button class="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500">
            View Orders
          </button>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">📚</div>
          <h3 class="mb-2 text-xl font-semibold text-white">My Lessons</h3>
          <p class="mb-4 text-slate-400">Manage your booked lessons</p>
          <button class="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500">
            View Lessons
          </button>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">🔧</div>
          <h3 class="mb-2 text-xl font-semibold text-white">Repair Requests</h3>
          <p class="mb-4 text-slate-400">Track repair status</p>
          <button class="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500">
            View Repairs
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
