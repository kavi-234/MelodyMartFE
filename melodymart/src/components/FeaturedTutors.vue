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

interface Lesson {
  _id: string
  title: string
  description: string
  instrument: string
  level: string
  duration: number
  price: number
  maxStudents: number
  enrolledStudents: any[]
  availableDays: string[]
  availableTimeSlots: string[]
  isOnline: boolean
  location?: string
  isActive: boolean
  createdAt: string
}

const tutors = ref<Tutor[]>([])
const loading = ref(false)
const showModal = ref(false)
const selectedTutor = ref<Tutor | null>(null)
const loadingProfile = ref(false)
const showLessonModal = ref(false)
const selectedLesson = ref<Lesson | null>(null)
const lessons = ref<Lesson[]>([])
const loadingLessons = ref(false)

const fetchTutors = async () => {
  loading.value = true
  try {
    console.log('Fetching tutors from API...')
    const response = await fetch('http://localhost:5000/api/tutors')
    console.log('Tutors response status:', response.status)
    if (response.ok) {
      const data = await response.json()
      console.log('Tutors data received:', data)
      console.log('Number of tutors:', data.tutors?.length)
      tutors.value = data.tutors // Show all tutors
    } else {
      const errorData = await response.json()
      console.error('Failed to fetch tutors - response not ok:', errorData)
    }
  } catch (error) {
    console.error('Failed to fetch tutors - error:', error)
  } finally {
    loading.value = false
  }
}

const handleViewLessons = async (tutorId: string) => {
  loadingLessons.value = true
  showLessonModal.value = true
  lessons.value = []
  try {
    const response = await fetch(`http://localhost:5000/api/lessons/tutor/${tutorId}`)
    if (response.ok) {
      const data = await response.json()
      lessons.value = data.lessons
    }
  } catch (error) {
    console.error('Failed to fetch lessons:', error)
  } finally {
    loadingLessons.value = false
  }
}

const handleViewLessonDetails = (lesson: Lesson) => {
  selectedLesson.value = lesson
}

const closeLessonModal = () => {
  showLessonModal.value = false
  selectedLesson.value = null
  lessons.value = []
}

const backToLessonsList = () => {
  selectedLesson.value = null
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
  <section class="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold uppercase tracking-wider">
          Expert Instructors
        </span>

        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white">
          Featured Tutors
        </h2>

        <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Meet our experienced instructors who are passionate about helping you master your craft.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p class="mt-4 text-slate-600 dark:text-slate-400">Loading tutors...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="tutors.length === 0" class="text-center py-12">
        <p class="text-slate-600 dark:text-slate-400">No tutors available at the moment.</p>
      </div>

      <!-- Tutors Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="tutor in tutors"
        :key="tutor._id"
        class="group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300"
      >
        <div class="relative aspect-square overflow-hidden bg-slate-100">
          <!-- Avatar or Initials -->
          <div v-if="getAvatarUrl(tutor.avatar)" class="w-full h-full">
            <img 
              :src="getAvatarUrl(tutor.avatar)" 
              :alt="tutor.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
            <span class="text-4xl font-bold text-white">{{ getInitials(tutor.name) }}</span>
          </div>

          <!-- Verified Badge -->
          <span
            v-if="tutor.isVerified"
            class="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded flex items-center shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-2.5 h-2.5 mr-0.5">
              <circle cx="12" cy="8" r="6"></circle>
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
            </svg>
            Verified
          </span>
        </div>

        <div class="p-4">
          <h3 class="text-base font-bold mb-1 text-black dark:text-white truncate">
            {{ tutor.name }}
          </h3>

          <p class="text-xs text-purple-600 mb-2 truncate">
            {{ tutor.specialization || 'Music Instructor' }}
          </p>

          <!-- Tutor Details -->
          <div class="space-y-1.5 mb-3 text-xs text-slate-600 dark:text-slate-400">
            <div class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="flex-1 truncate">{{ tutor.experience || 0 }}+ years</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span class="truncate">Rs {{ tutor.hourlyRate || 0 }}/hr</span>
            </div>
          </div>

          <div class="border-t border-slate-100 dark:border-slate-700 pt-3">
            <div class="space-y-1.5">
              <button
                @click="handleViewProfile(tutor._id)"
                class="w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20"
              >
                View Profile
              </button>
              <button
                @click="handleViewLessons(tutor._id)"
                class="w-full text-center px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 text-xs font-bold rounded-lg hover:bg-purple-50 transition-colors"
              >
                View Lessons
              </button>
            </div>
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

    <!-- Lessons Modal -->
    <Teleport to="body">
      <div
        v-if="showLessonModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="closeLessonModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                v-if="selectedLesson"
                @click="backToLessonsList"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <h3 class="text-2xl font-bold text-black dark:text-white">
                {{ selectedLesson ? 'Lesson Details' : 'Available Lessons' }}
              </h3>
            </div>
            <button
              @click="closeLessonModal"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loadingLessons" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p class="mt-4 text-slate-600 dark:text-slate-400">Loading lessons...</p>
          </div>

          <!-- Lesson Details View -->
          <div v-else-if="selectedLesson" class="p-6">
            <div class="mb-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h4 class="text-2xl font-bold text-black dark:text-white mb-2">{{ selectedLesson.title }}</h4>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                      {{ selectedLesson.instrument }}
                    </span>
                    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                      {{ selectedLesson.level }}
                    </span>
                    <span class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                      {{ selectedLesson.isOnline ? 'Online' : 'In-Person' }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold text-purple-600">Rs {{ selectedLesson.price }}</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">per lesson</p>
                </div>
              </div>

              <p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{{ selectedLesson.description }}</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Duration</p>
                      <p class="text-lg font-bold text-black dark:text-white">{{ selectedLesson.duration }} minutes</p>
                    </div>
                  </div>
                </div>

                <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Availability</p>
                      <p class="text-lg font-bold text-black dark:text-white">{{ selectedLesson.enrolledStudents.length }} / {{ selectedLesson.maxStudents }}</p>
                    </div>
                  </div>
                </div>

                <div v-if="!selectedLesson.isOnline && selectedLesson.location" class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 md:col-span-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Location</p>
                      <p class="text-sm font-semibold text-black dark:text-white">{{ selectedLesson.location }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedLesson.availableDays && selectedLesson.availableDays.length" class="mb-6">
                <h5 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Available Days</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="day in selectedLesson.availableDays"
                    :key="day"
                    class="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg"
                  >
                    {{ day }}
                  </span>
                </div>
              </div>

              <div v-if="selectedLesson.availableTimeSlots && selectedLesson.availableTimeSlots.length" class="mb-6">
                <h5 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Available Time Slots</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="slot in selectedLesson.availableTimeSlots"
                    :key="slot"
                    class="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg"
                  >
                    {{ slot }}
                  </span>
                </div>
              </div>

              <button class="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all">
                Enroll Now
              </button>
            </div>
          </div>

          <!-- Lessons List View -->
          <div v-else-if="lessons.length === 0" class="p-12 text-center">
            <p class="text-slate-600 dark:text-slate-400">No lessons available from this tutor.</p>
          </div>

          <div v-else class="p-6">
            <div class="grid gap-4">
              <div
                v-for="lesson in lessons"
                :key="lesson._id"
                class="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-slate-800"
                @click="handleViewLessonDetails(lesson)"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="text-lg font-bold text-black dark:text-white mb-2">{{ lesson.title }}</h4>
                    <div class="flex flex-wrap gap-2 mb-2">
                      <span class="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                        {{ lesson.instrument }}
                      </span>
                      <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                        {{ lesson.level }}
                      </span>
                      <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                        {{ lesson.isOnline ? 'Online' : 'In-Person' }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{{ lesson.description }}</p>
                  </div>
                  <div class="text-right ml-4">
                    <p class="text-2xl font-bold text-purple-600">Rs {{ lesson.price }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ lesson.duration }} min</p>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-600 dark:text-slate-400">
                    {{ lesson.enrolledStudents.length }} / {{ lesson.maxStudents }} enrolled
                  </span>
                  <button
                    @click.stop="handleViewLessonDetails(lesson)"
                    class="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    </div>
  </section>
</template>
