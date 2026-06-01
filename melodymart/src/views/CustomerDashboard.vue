<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const paymentNotice = ref('')

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

  // orders and cart were moved to their dedicated pages
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 p-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-white">Customer Dashboard</h1>
        <p class="text-slate-400">Welcome back, {{ authStore.user?.name }}!</p>
      </div>

      <div v-if="paymentNotice" class="mb-8 rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-emerald-300">
        {{ paymentNotice }}
      </div>
    </div>
  </div>
</template>
