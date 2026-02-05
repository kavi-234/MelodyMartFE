<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

interface Specialist {
  _id: string
  name: string
  email: string
  phone?: string
  specialization?: string
  experience?: string
  hourlyRate?: number
  avatar?: string
  certifications?: string
  serviceTypes?: string
  bio?: string
  verificationStatus?: string
}

const specialists = ref<Specialist[]>([])
const loading = ref(true)
const error = ref('')
const showModal = ref(false)
const selectedSpecialist = ref<Specialist | null>(null)
const loadingProfile = ref(false)

const avatarPlaceholder = new URL('../assets/placeholders/avatar-default.svg', import.meta.url).href

const fetchSpecialists = async () => {
  try {
    loading.value = true
    const response = await fetch('http://localhost:5000/api/specialists')
    const data = await response.json()
    
    if (data.success) {
      specialists.value = data.specialists
    } else {
      error.value = 'Failed to load repair specialists'
    }
  } catch (err) {
    console.error('Error fetching specialists:', err)
    error.value = 'Failed to load repair specialists'
  } finally {
    loading.value = false
  }
}

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return avatarPlaceholder
  
  // If it's a base64 string
  if (avatar.startsWith('data:image')) {
    return avatar
  }
  
  // If it's a URL
  if (avatar.startsWith('http')) {
    return avatar
  }
  
  return avatarPlaceholder
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleSpecialistError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target || target.dataset.fallbackApplied === 'true') return
  target.src = avatarPlaceholder
  target.dataset.fallbackApplied = 'true'
}

const handleViewProfile = async (specialistId: string) => {
  loadingProfile.value = true
  showModal.value = true
  try {
    const response = await fetch(`http://localhost:5000/api/specialists/${specialistId}`)
    if (response.ok) {
      const data = await response.json()
      selectedSpecialist.value = data.specialist
    }
  } catch (error) {
    console.error('Failed to fetch specialist profile:', error)
  } finally {
    loadingProfile.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  selectedSpecialist.value = null
}

onMounted(() => {
  fetchSpecialists()
})
</script>

<template>
  <section id="repairs" class="py-16 md:py-24 bg-white dark:bg-slate-900">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold uppercase tracking-wider">
          Expert Technicians
        </span>

        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white">
          Repair Specialists
        </h2>

        <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          From tuning to total restoration, our skilled technicians ensure your instruments sound their absolute best.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p class="mt-4 text-slate-600">Loading repair specialists...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="specialists.length === 0" class="text-center py-12">
        <p class="text-slate-600">No repair specialists available at the moment.</p>
      </div>

      <!-- Specialists Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <div
          v-for="specialist in specialists"
          :key="specialist._id"
          class="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-2xl transition-all duration-300"
        >
          <div class="relative aspect-square overflow-hidden bg-slate-100">
            <!-- Avatar or Initials -->
            <div v-if="specialist.avatar" class="w-full h-full">
              <img
                :src="getAvatarUrl(specialist.avatar)"
                :alt="specialist.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                @error="handleSpecialistError"
              />
            </div>
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
              <span class="text-5xl font-bold text-white">{{ getInitials(specialist.name) }}</span>
            </div>

            <!-- Verified Badge -->
            <span
              class="absolute top-4 right-4 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded flex items-center shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 mr-1">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
              Verified
            </span>
          </div>

          <div class="p-6">
            <h3 class="text-xl font-bold mb-1 text-black">
              {{ specialist.name }}
            </h3>

            <p class="text-sm text-purple-600 mb-3">
              {{ specialist.specialization || 'Instrument Repair' }}
            </p>

            <div class="space-y-2 mb-4 text-sm text-slate-600">
              <div v-if="specialist.experience" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="flex-1">{{ specialist.experience }} of experience</span>
              </div>
              <div v-if="specialist.hourlyRate" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span>Rs {{ specialist.hourlyRate }}/hour</span>
              </div>
              <div v-if="specialist.phone" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{{ specialist.phone }}</span>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-4">
              <div class="space-y-2">
                <button
                  @click="handleViewProfile(specialist._id)"
                  class="w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                >
                  View Profile
                </button>
                <RouterLink
                  to="/repairs"
                  class="block w-full text-center px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 text-xs font-bold rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Request Service
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- View All Button -->
      <div v-if="!loading && !error && specialists.length > 0" class="mt-16 text-center">
        <RouterLink
          to="/repairs"
          class="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-purple-500/20"
        >
          View All Specialists
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </RouterLink>
      </div>
    </div>

    <!-- Profile Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-2xl font-bold text-black">Repair Specialist Profile</h3>
            <button
              @click="closeModal"
              class="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loadingProfile" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p class="mt-4 text-slate-600">Loading profile...</p>
          </div>

          <!-- Profile Content -->
          <div v-else-if="selectedSpecialist" class="p-6">
            <!-- Avatar and Name -->
            <div class="flex items-start gap-6 mb-6">
              <div class="relative">
                <div v-if="selectedSpecialist.avatar" class="w-24 h-24 rounded-full overflow-hidden">
                  <img :src="getAvatarUrl(selectedSpecialist.avatar)" :alt="selectedSpecialist.name" class="w-full h-full object-cover" @error="handleSpecialistError" />
                </div>
                <div v-else class="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-3xl font-bold">
                  {{ getInitials(selectedSpecialist.name) }}
                </div>
                <span class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-3 border-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
              </div>
              <div class="flex-1">
                <h4 class="text-2xl font-bold text-black mb-2">{{ selectedSpecialist.name }}</h4>
                <p class="text-lg text-purple-600 font-semibold mb-2">
                  {{ selectedSpecialist.specialization || 'Instrument Repair' }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Verified Specialist
                  </span>
                  <span v-if="selectedSpecialist.experience" class="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    {{ selectedSpecialist.experience }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bio -->
            <div v-if="selectedSpecialist.bio" class="mb-6">
              <h5 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">About</h5>
              <p class="text-slate-600 leading-relaxed">{{ selectedSpecialist.bio }}</p>
            </div>

            <!-- Certifications -->
            <div v-if="selectedSpecialist.certifications" class="mb-6">
              <h5 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Certifications</h5>
              <p class="text-slate-600 leading-relaxed">{{ selectedSpecialist.certifications }}</p>
            </div>

            <!-- Service Types -->
            <div v-if="selectedSpecialist.serviceTypes" class="mb-6">
              <h5 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Service Types</h5>
              <p class="text-slate-600 leading-relaxed">{{ selectedSpecialist.serviceTypes }}</p>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div v-if="selectedSpecialist.hourlyRate" class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 font-medium">Hourly Rate</p>
                    <p class="text-lg font-bold text-black">Rs {{ selectedSpecialist.hourlyRate }}/hour</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedSpecialist.experience" class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 font-medium">Experience</p>
                    <p class="text-lg font-bold text-black">{{ selectedSpecialist.experience }}</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedSpecialist.email" class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-xs text-slate-500 font-medium">Email</p>
                    <p class="text-sm font-semibold text-black truncate">{{ selectedSpecialist.email }}</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedSpecialist.phone" class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 font-medium">Phone</p>
                    <p class="text-sm font-semibold text-black">{{ selectedSpecialist.phone }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <RouterLink
                to="/repairs"
                class="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all text-center"
              >
                Request Service
              </RouterLink>
              <button
                @click="closeModal"
                class="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
/* Scoped styles removed in favor of utility classes */
</style>
