<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.user || authStore.user.role !== 'customer') {
    router.push('/')
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 p-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-white">Customer Dashboard</h1>
        <p class="text-slate-400">Welcome back, {{ authStore.user?.name }}!</p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">🛒</div>
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
