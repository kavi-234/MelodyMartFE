<script setup lang="ts">
import { ref, onMounted } from 'vue'

const orders = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const fetchOrders = async () => {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not authenticated')

    const res = await fetch('http://localhost:5000/api/payments/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to fetch orders')
    }

    const data = await res.json()
    orders.value = data.orders || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void fetchOrders()
})
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Orders</h1>

    <div v-if="loading" class="text-slate-400">Loading orders...</div>

    <div v-else-if="error" class="rounded-lg bg-red-900/20 border border-red-800 p-4 text-red-400">{{ error }}</div>

    <div v-else>
      <div v-if="orders.length === 0" class="text-slate-400">You have no orders yet.</div>

      <ul v-else class="space-y-4">
        <li v-for="order in orders" :key="order._id" class="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm text-slate-400">Order ID</div>
              <div class="font-mono font-semibold text-white">{{ order.orderId }}</div>
            </div>

            <div class="text-right">
              <div class="text-sm text-slate-400">Amount</div>
              <div class="font-semibold text-purple-400">{{ order.currency }} {{ Number(order.amount).toFixed(2) }}</div>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="text-sm text-slate-400">Items: <span class="text-white font-medium">{{ order.itemCount }}</span></div>
            <div class="flex items-center gap-3">
              <div :class="['px-3 py-1 rounded-full text-sm font-semibold', order.status === 'PAID' ? 'bg-emerald-600/20 text-emerald-300' : order.status === 'FAILED' ? 'bg-red-600/20 text-red-300' : 'bg-yellow-600/20 text-yellow-300']">
                {{ order.status }}
              </div>
              <div class="text-sm text-slate-400">{{ new Date(order.createdAt).toLocaleString() }}</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* keep styling minimal and consistent with app */
</style>
