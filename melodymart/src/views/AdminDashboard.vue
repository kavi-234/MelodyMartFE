<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import AddInstrument from '../components/AddInstrument.vue'
import InstrumentList from '../components/InstrumentList.vue'

const authStore = useAuthStore()
const activeTab = ref<'users' | 'add-instrument' | 'instruments'>('users')

interface PendingUser {
  _id: string
  name: string
  email: string
  role: string
  documentUrl?: string
  specialization?: string
  experience?: number
  hourlyRate?: number
  bio?: string
  certifications?: string[]
  serviceTypes?: string[]
  createdAt: string
}

const pendingUsers = ref<PendingUser[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const processingUserId = ref<string | null>(null)
const selectedDocument = ref<string | null>(null)

const fetchPendingUsers = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:5000/api/admin/pending-users', {
      headers: {
        'Authorization': `Bearer ${authStore.token || localStorage.getItem('token')}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to fetch pending users'
      return
    }

    pendingUsers.value = data.users || []
  } catch (error) {
    console.error('Error fetching pending users:', error)
    errorMessage.value = 'An error occurred while fetching users'
  } finally {
    isLoading.value = false
  }
}

const handleVerifyUser = async (userId: string, status: 'verified' | 'rejected') => {
  processingUserId.value = userId
  errorMessage.value = ''

  try {
    // Convert frontend status to backend expected values
    const backendStatus = status === 'verified' ? 'APPROVED' : 'REJECTED'
    
    const response = await fetch(`http://localhost:5000/api/admin/verify-user/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token || localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: backendStatus })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to update user status'
      return
    }

    // Remove user from pending list
    pendingUsers.value = pendingUsers.value.filter(user => user._id !== userId)

    // Show success message
    alert(`User ${status === 'verified' ? 'approved' : 'rejected'} successfully!`)
  } catch (error) {
    console.error('Error updating user:', error)
    errorMessage.value = 'An error occurred while updating user'
  } finally {
    processingUserId.value = null
  }
}

const openDocument = (url: string) => {
  selectedDocument.value = `http://localhost:5000${url}`
}

const closeDocument = () => {
  selectedDocument.value = null
}

const getRoleDisplay = (role: string) => {
  if (role === 'tutor') return 'Tutor'
  if (role === 'repair_specialist') return 'Repair Specialist'
  return role
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchPendingUsers()
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Header -->
    <div class="border-b border-slate-800 bg-slate-900/50">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-white">Admin Dashboard</h1>
        
        <!-- Navigation Tabs -->
        <div class="mt-6 flex gap-2">
          <button @click="activeTab = 'users'"
            :class="activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'"
            class="rounded-lg px-4 py-2 text-sm font-medium transition">
            User Verifications
          </button>
          <button @click="activeTab = 'add-instrument'"
            :class="activeTab === 'add-instrument' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'"
            class="rounded-lg px-4 py-2 text-sm font-medium transition">
            Add Instrument
          </button>
          <button @click="activeTab = 'instruments'"
            :class="activeTab === 'instruments' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'"
            class="rounded-lg px-4 py-2 text-sm font-medium transition">
            View Instruments
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- User Verifications Tab -->
      <div v-if="activeTab === 'users'">
        <div class="mb-6 flex items-center justify-between">
          <p class="text-sm text-slate-400">Manage pending user verifications</p>
          <button @click="fetchPendingUsers" :disabled="isLoading"
            class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50">
            {{ isLoading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 rounded-lg bg-red-900/20 border border-red-800 p-4">
        <p class="text-sm text-red-400">{{ errorMessage }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="pendingUsers.length === 0" class="rounded-lg border border-slate-800 bg-slate-900/30 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-slate-300">No Pending Verifications</h3>
        <p class="mt-2 text-sm text-slate-500">All users have been verified or there are no new registrations.</p>
      </div>

      <!-- Users List -->
      <div v-else class="space-y-4">
        <div
          v-for="user in pendingUsers"
          :key="user._id"
          class="rounded-lg border border-slate-800 bg-slate-900/30 p-6 transition hover:border-slate-700"
        >
          <div class="flex flex-col gap-6 lg:flex-row">
            <!-- User Info -->
            <div class="flex-1 space-y-4">
              <div>
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-xl font-semibold text-white">{{ user.name }}</h3>
                    <p class="mt-1 text-sm text-slate-400">{{ user.email }}</p>
                  </div>
                  <span class="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                    {{ getRoleDisplay(user.role) }}
                  </span>
                </div>
                <p class="mt-2 text-xs text-slate-500">Applied on {{ formatDate(user.createdAt) }}</p>
              </div>

              <!-- Tutor Details -->
              <div v-if="user.role === 'tutor' && (user.specialization || user.experience || user.hourlyRate)" class="space-y-2">
                <div v-if="user.specialization" class="flex items-center gap-2 text-sm">
                  <span class="text-slate-500">Specialization:</span>
                  <span class="text-slate-300">{{ user.specialization }}</span>
                </div>
                <div v-if="user.experience" class="flex items-center gap-2 text-sm">
                  <span class="text-slate-500">Experience:</span>
                  <span class="text-slate-300">{{ user.experience }} years</span>
                </div>
                <div v-if="user.hourlyRate" class="flex items-center gap-2 text-sm">
                  <span class="text-slate-500">Hourly Rate:</span>
                  <span class="text-slate-300">Rs {{ user.hourlyRate }}</span>
                </div>
                <div v-if="user.bio" class="text-sm">
                  <span class="text-slate-500">Bio:</span>
                  <p class="mt-1 text-slate-300">{{ user.bio }}</p>
                </div>
              </div>

              <!-- Repair Specialist Details -->
              <div v-if="user.role === 'repair_specialist'" class="space-y-2">
                <div v-if="user.serviceTypes && user.serviceTypes.length > 0" class="text-sm">
                  <span class="text-slate-500">Service Types:</span>
                  <div class="mt-1 flex flex-wrap gap-2">
                    <span
                      v-for="service in user.serviceTypes"
                      :key="service"
                      class="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                    >
                      {{ service }}
                    </span>
                  </div>
                </div>
                <div v-if="user.certifications && user.certifications.length > 0" class="text-sm">
                  <span class="text-slate-500">Certifications:</span>
                  <div class="mt-1 flex flex-wrap gap-2">
                    <span
                      v-for="cert in user.certifications"
                      :key="cert"
                      class="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                    >
                      {{ cert }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Document -->
              <div v-if="user.documentUrl" class="pt-2">
                <button
                  @click="openDocument(user.documentUrl)"
                  class="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Document
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3 lg:w-48">
              <button
                @click="handleVerifyUser(user._id, 'verified')"
                :disabled="processingUserId === user._id"
                class="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="processingUserId !== user._id" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-if="processingUserId === user._id">Processing...</span>
                <span v-else>Approve</span>
              </button>
              <button
                @click="handleVerifyUser(user._id, 'rejected')"
                :disabled="processingUserId === user._id"
                class="flex items-center justify-center gap-2 rounded-lg border border-red-600 bg-red-600/10 px-4 py-3 font-medium text-red-400 transition hover:bg-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="processingUserId !== user._id" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span v-if="processingUserId === user._id">Processing...</span>
                <span v-else>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Add Instrument Tab -->
      <AddInstrument v-if="activeTab === 'add-instrument'" />

      <!-- Instruments List Tab -->
      <InstrumentList v-if="activeTab === 'instruments'" />
    </div>

    <!-- Document Modal -->
    <div
      v-if="selectedDocument"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      @click="closeDocument"
    >
      <div class="relative max-h-[90vh] max-w-4xl w-full overflow-auto rounded-lg bg-slate-900 p-4" @click.stop>
        <button
          @click="closeDocument"
          class="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <iframe
          :src="selectedDocument"
          class="h-[80vh] w-full rounded border border-slate-700"
        ></iframe>
      </div>
    </div>
  </div>
</template>
