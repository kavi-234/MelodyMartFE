<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const verificationStatusText = computed(() => {
  if (authStore.user?.verificationStatus === 'APPROVED') return 'Verified'
  if (authStore.user?.verificationStatus === 'REJECTED') return 'Rejected'
  return 'Pending Verification'
})

const verificationStatusColor = computed(() => {
  if (authStore.user?.verificationStatus === 'APPROVED') return 'text-green-400'
  if (authStore.user?.verificationStatus === 'REJECTED') return 'text-red-400'
  return 'text-yellow-400'
})

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'repair_specialist') {
    router.push('/')
    return
  }
  
  // Refresh user data to get latest verification status
  await authStore.refreshUser()
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 p-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-white">Repair Specialist Dashboard</h1>
        <p class="text-slate-400">Welcome, {{ authStore.user?.name }}!</p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">🔧</div>
          <h3 class="mb-2 text-xl font-semibold text-white">Active Repairs</h3>
          <p class="mb-4 text-slate-400">Instruments in repair</p>
          <button class="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500">
            View Repairs
          </button>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">📋</div>
          <h3 class="mb-2 text-xl font-semibold text-white">Work Orders</h3>
          <p class="mb-4 text-slate-400">Pending repair requests</p>
          <button class="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500">
            View Orders
          </button>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">💰</div>
          <h3 class="mb-2 text-xl font-semibold text-white">Earnings</h3>
          <p class="mb-4 text-slate-400">View your income</p>
          <button class="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500">
            View Earnings
          </button>
        </div>
      </div>

      <div class="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 class="mb-4 text-xl font-semibold text-white">Profile Information</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-sm text-slate-400">Service Types</div>
            <div class="text-white">{{ authStore.user?.serviceTypes || 'Not set' }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-400">Certifications</div>
            <div class="text-white">{{ authStore.user?.certifications || 'None' }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-400">Status</div>
            <div :class="verificationStatusColor">
              {{ verificationStatusText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
