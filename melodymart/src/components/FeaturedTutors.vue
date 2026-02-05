<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Tutor {
  _id: string
  name: string
  email: string
  phone?: string
  specialization?: string
  experience?: number
  hourlyRate?: number
  avatar?: string
  bio?: string
  isVerified: boolean
  verificationStatus?: string
  authProvider?: string
  createdAt?: string
}

const tutors = ref<Tutor[]>([])
const loading = ref(false)
const showModal = ref(false)
const selectedTutor = ref<Tutor | null>(null)
const loadingProfile = ref(false)

const fetchTutors = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:5000/api/tutors')
    if (response.ok) {
      const data = await response.json()
      tutors.value = data.tutors.slice(0, 3) // Show only 3 tutors
    }
  } catch (error) {
    console.error('Failed to fetch tutors:', error)
  } finally {
    loading.value = false
  }
}

const handleViewLessons = (tutorId: string) => {
  // TODO: Navigate to tutor's lessons
  console.log('View lessons for tutor:', tutorId)
}

const handleViewProfile = async (tutorId: string) => {
  loadingProfile.value = true
  showModal.value = true
  try {
    const response = await fetch(`http://localhost:5000/api/tutors/${tutorId}`)
    if (response.ok) {
      const data = await response.json()
      selectedTutor.value = data.tutor
    }
  } catch (error) {
    console.error('Failed to fetch tutor profile:', error)
  } finally {
    loadingProfile.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  selectedTutor.value = null
}

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return ''
  if (avatar.startsWith('data:image')) return avatar
  if (avatar.startsWith('http')) return avatar
  return ''
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(() => {
  fetchTutors()
})
</script>

<template>
  <div class="pb-12 border-b border-slate-200">
    <div class="mb-8">
      <h3 class="text-2xl md:text-3xl font-bold mb-3 text-black">
        Featured Tutors
      </h3>
      <p class="text-slate-600 max-w-2xl">
        Meet our experienced instructors who are passionate about helping you master your craft.
      </p>
    </div>

    <div v-if="loading" class="text-center py-8 text-slate-600">
      Loading tutors...
    </div>

    <div v-else-if="tutors.length === 0" class="text-center py-12 bg-slate-50 rounded-xl">
      <p class="text-slate-600">No tutors available at the moment.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="tutor in tutors"
        :key="tutor._id"
        class="group rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <div class="p-5">
          <!-- Tutor Header -->
          <div class="flex items-start gap-4 mb-4">
            <div class="relative">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {{ tutor.name.charAt(0) }}
              </div>
              <span
                v-if="tutor.isVerified"
                class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
                title="Verified Tutor"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-black mb-1 truncate">
                {{ tutor.name }}
              </h4>
              <p class="text-sm text-purple-600 font-medium">
                {{ tutor.specialization || 'Music Instructor' }}
              </p>
            </div>
          </div>

          <!-- Tutor Details -->
          <div class="space-y-2 mb-4 text-sm">
            <div class="flex items-center gap-2 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{{ tutor.experience || 0 }}+ years experience</span>
            </div>
            <div class="flex items-center gap-2 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>Rs {{ tutor.hourlyRate || 0 }}/hour</span>
            </div>
          </div>

          <!-- Bio -->
          <p v-if="tutor.bio" class="text-sm text-slate-600 mb-4 line-clamp-2">
            {{ tutor.bio }}
          </p>

          <!-- Action Buttons -->
          <div class="space-y-2">
            <button
              @click="handleViewProfile(tutor._id)"
              class="w-full py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-all"
            >
              View Profile
            </button>
            <button
              @click="handleViewLessons(tutor._id)"
              class="w-full py-2.5 bg-white border-2 border-purple-600 text-purple-600 text-sm font-semibold rounded-lg hover:bg-purple-50 transition-all"
            >
              View Lessons
            </button>
          </div>
        </div>
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
            <h3 class="text-2xl font-bold text-black">Tutor Profile</h3>
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
          <div v-else-if="selectedTutor" class="p-6">
            <!-- Avatar and Name -->
            <div class="flex items-start gap-6 mb-6">
              <div class="relative">
                <div v-if="getAvatarUrl(selectedTutor.avatar)" class="w-24 h-24 rounded-full overflow-hidden">
                  <img :src="getAvatarUrl(selectedTutor.avatar)" :alt="selectedTutor.name" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                  {{ getInitials(selectedTutor.name) }}
                </div>
                <span
                  v-if="selectedTutor.isVerified"
                  class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-3 border-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
              </div>
              <div class="flex-1">
                <h4 class="text-2xl font-bold text-black mb-2">{{ selectedTutor.name }}</h4>
                <p class="text-lg text-purple-600 font-semibold mb-2">
                  {{ selectedTutor.specialization || 'Music Instructor' }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span v-if="selectedTutor.isVerified" class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Verified Tutor
                  </span>
                  <span class="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    {{ selectedTutor.experience || 0 }}+ Years Experience
                  </span>
                </div>
              </div>
            </div>

            <!-- Bio -->
            <div v-if="selectedTutor.bio" class="mb-6">
              <h5 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">About</h5>
              <p class="text-slate-600 leading-relaxed">{{ selectedTutor.bio }}</p>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 font-medium">Hourly Rate</p>
                    <p class="text-lg font-bold text-black">Rs {{ selectedTutor.hourlyRate || 0 }}/hour</p>
                  </div>
                </div>
              </div>

              <div class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 font-medium">Experience</p>
                    <p class="text-lg font-bold text-black">{{ selectedTutor.experience || 0 }}+ years</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedTutor.email" class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-xs text-slate-500 font-medium">Email</p>
                    <p class="text-sm font-semibold text-black truncate">{{ selectedTutor.email }}</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedTutor.phone" class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 font-medium">Phone</p>
                    <p class="text-sm font-semibold text-black">{{ selectedTutor.phone }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                @click="handleViewLessons(selectedTutor._id)"
                class="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
              >
                View Lessons
              </button>
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
  </div>
</template>
