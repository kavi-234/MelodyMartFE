<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CreateLesson from '../components/CreateLesson.vue'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('overview')

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
  if (!authStore.user || authStore.user.role !== 'tutor') {
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
        <h1 class="mb-2 text-3xl font-bold text-white">Tutor Dashboard</h1>
        <p class="text-slate-400">Welcome, {{ authStore.user?.name }}!</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="mb-6 border-b border-slate-800">
        <div class="flex gap-4">
          <button
            @click="activeTab = 'overview'"
            :class="[
              'px-4 py-2 font-medium transition-colors border-b-2',
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            ]"
          >
            Overview
          </button>
          <button
            @click="activeTab = 'create-lesson'"
            :class="[
              'px-4 py-2 font-medium transition-colors border-b-2',
              activeTab === 'create-lesson'
                ? 'border-purple-600 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            ]"
          >
            Create Lesson
          </button>
          <button
            @click="activeTab = 'my-lessons'"
            :class="[
              'px-4 py-2 font-medium transition-colors border-b-2',
              activeTab === 'my-lessons'
                ? 'border-purple-600 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            ]"
          >
            My Lessons
          </button>
        </div>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'">
        <div class="grid gap-6 md:grid-cols-3 mb-8">
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

        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
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
              <div class="text-white">Rs {{ authStore.user?.hourlyRate || '0' }}/hour</div>
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

      <!-- Create Lesson Tab -->
      <div v-if="activeTab === 'create-lesson'">
        <CreateLesson />
      </div>

      <!-- My Lessons Tab -->
      <div v-if="activeTab === 'my-lessons'">
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 class="mb-4 text-2xl font-bold text-white">My Lessons</h2>
          <p class="text-slate-400">Your created lessons will appear here.</p>
        </div>
      </div>
    </div>
  </div>
</template>
