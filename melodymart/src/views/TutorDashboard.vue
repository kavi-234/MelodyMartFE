<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.user || authStore.user.role !== 'tutor') {
    router.push('/')
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 p-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-white">Tutor Dashboard</h1>
        <p class="text-slate-400">Welcome, {{ authStore.user?.name }}!</p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">📅</div>
          <h3 class="mb-2 text-xl font-semibold text-white">My Schedule</h3>
          <p class="mb-4 text-slate-400">Manage your lesson bookings</p>
          <button class="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500">
            View Schedule
          </button>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div class="mb-4 text-4xl">👥</div>
          <h3 class="mb-2 text-xl font-semibold text-white">My Students</h3>
          <p class="mb-4 text-slate-400">Track student progress</p>
          <button class="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500">
            View Students
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
            <div class="text-sm text-slate-400">Specialization</div>
            <div class="text-white">{{ authStore.user?.specialization || 'Not set' }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-400">Experience</div>
            <div class="text-white">{{ authStore.user?.experience || '0' }} years</div>
          </div>
          <div>
            <div class="text-sm text-slate-400">Hourly Rate</div>
            <div class="text-white">${{ authStore.user?.hourlyRate || '0' }}/hour</div>
          </div>
          <div>
            <div class="text-sm text-slate-400">Status</div>
            <div :class="authStore.user?.verified ? 'text-green-400' : 'text-yellow-400'">
              {{ authStore.user?.verified ? 'Verified' : 'Pending Verification' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
