<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Lesson {
  _id: string
  title: string
  description: string
  instrument: string
  level: string
  price: number
  duration: number
  tutor: {
    _id: string
    name: string
    avatar?: string
    specialization?: string
    experience?: number
  }
  enrolledStudents: string[]
  maxStudents: number
  availableDays: string[]
  availableTimeSlots: string[]
  isOnline: boolean
  location?: string
  isActive: boolean
  createdAt: string
}

const lessons = ref<Lesson[]>([])
const loading = ref(false)
const showDetailModal = ref(false)
const selectedLesson = ref<Lesson | null>(null)
const loadingDetail = ref(false)

const fetchLessons = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:5000/api/lessons')
    if (response.ok) {
      const data = await response.json()
      lessons.value = data.lessons.slice(0, 4) // Show only 4 lessons
    }
  } catch (error) {
    console.error('Failed to fetch lessons:', error)
  } finally {
    loading.value = false
  }
}

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    'beginner': 'bg-green-100 text-green-700 border-green-200',
    'intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'advanced': 'bg-red-100 text-red-700 border-red-200'
  }
  return colors[level] || 'bg-slate-100 text-slate-700 border-slate-200'
}

import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import lessonService from '../services/lessonService'

const router = useRouter()
const authStore = useAuthStore()

const bookingInProgress = ref<string | null>(null)

const handleBookLesson = async (lessonId: string) => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Please login to book a lesson')
    router.push('/auth')
    return
  }

  bookingInProgress.value = lessonId
  try {
    await lessonService.bookLesson(lessonId)

    // Increment sidebar badge
    authStore.incrementMyLessonsCount()

    // Build booking object from lesson data already in memory
    const lessonObj = lessons.value.find((l) => l._id === lessonId) || selectedLesson.value
    const syntheticBooking = {
      _id: lessonId,
      bookingStatus: 'Pending Payment',
      paymentStatus: 'Pending',
      lesson: lessonObj
    }

    // Navigate to payment page carrying booking data — avoids needing /api/bookings/:id
    router.push({
      path: `/dashboard/customer/lesson-payment/${lessonId}`,
      state: { booking: syntheticBooking }
    })
  } catch (err: any) {
    alert(err.message || 'Failed to book lesson. Please try again.')
  } finally {
    bookingInProgress.value = null
  }
}

const handleViewDetails = async (lessonId: string) => {
  loadingDetail.value = true
  showDetailModal.value = true
  try {
    const response = await fetch(`http://localhost:5000/api/lessons/${lessonId}`)
    if (response.ok) {
      const data = await response.json()
      selectedLesson.value = data.lesson
    }
  } catch (error) {
    console.error('Failed to fetch lesson details:', error)
  } finally {
    loadingDetail.value = false
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedLesson.value = null
}

onMounted(() => {
  fetchLessons()
})
</script>

<template>
  <div class="py-12">
    <div class="mb-8">
      <h3 class="text-2xl md:text-3xl font-bold mb-3 text-black">
        Popular Lessons
      </h3>
      <p class="text-slate-600 max-w-2xl">
        Explore our most popular lessons and start learning from expert tutors today.
      </p>
    </div>

    <div v-if="loading" class="text-center py-8 text-slate-600">
      Loading lessons...
    </div>

    <div v-else-if="lessons.length === 0" class="text-center py-12 bg-slate-50 rounded-xl">
      <p class="text-slate-600">No lessons available at the moment.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="lesson in lessons"
        :key="lesson._id"
        class="group rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <div class="p-5">
          <!-- Lesson Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h4 class="font-bold text-black mb-1 text-base">
                {{ lesson.title }}
              </h4>
              <p class="text-sm text-purple-600 font-medium">
                🎵 {{ lesson.instrument }}
              </p>
            </div>
            <span
              :class="[
                'px-2 py-1 rounded text-xs font-semibold border',
                getLevelColor(lesson.level)
              ]"
            >
              {{ lesson.level }}
            </span>
          </div>

          <!-- Tutor Info -->
          <div class="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {{ lesson.tutor.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-900 font-medium truncate">
                {{ lesson.tutor.name }}
              </p>
              <p class="text-xs text-slate-500">
                {{ lesson.duration }} min session
              </p>
            </div>
          </div>

          <!-- Lesson Stats -->
          <div class="flex items-center justify-between mb-4">
            <div class="text-xs text-slate-500">
              <span class="font-medium text-slate-700">{{ lesson.enrolledStudents.length }}</span> / {{ lesson.maxStudents }} enrolled
            </div>
            <div class="text-right">
              <div class="text-xs text-slate-500">Starting at</div>
              <div class="text-lg font-bold text-purple-600">
                Rs {{ lesson.price }}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2">
            <button
              @click="handleViewDetails(lesson._id)"
              class="w-full py-2.5 bg-white border-2 border-purple-600 text-purple-600 text-sm font-semibold rounded-lg hover:bg-purple-50 transition-all"
            >
              View Details
            </button>
            <button
              @click="handleBookLesson(lesson._id)"
              :disabled="bookingInProgress === lesson._id"
              class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {{ bookingInProgress === lesson._id ? 'Booking...' : 'Book Lesson' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lesson Details Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="closeDetailModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <h3 class="text-2xl font-bold text-black dark:text-white">Lesson Details</h3>
            <button
              @click="closeDetailModal"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loadingDetail" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p class="mt-4 text-slate-600 dark:text-slate-400">Loading lesson details...</p>
          </div>

          <!-- Lesson Details Content -->
          <div v-else-if="selectedLesson" class="p-6">
            <div class="mb-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h4 class="text-2xl font-bold text-black dark:text-white mb-2">{{ selectedLesson.title }}</h4>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                      {{ selectedLesson.instrument }}
                    </span>
                    <span :class="[
                      'px-3 py-1 text-xs font-semibold rounded-full',
                      getLevelColor(selectedLesson.level)
                    ]">
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

              <!-- Tutor Info -->
              <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                <h5 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Your Instructor</h5>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                    {{ selectedLesson.tutor.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-black dark:text-white">{{ selectedLesson.tutor.name }}</p>
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                      {{ selectedLesson.tutor.specialization || 'Music Instructor' }}
                      <span v-if="selectedLesson.tutor.experience">
                        • {{ selectedLesson.tutor.experience }}+ years
                      </span>
                    </p>
                  </div>
                </div>
              </div>

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

              <button
                @click="handleBookLesson(selectedLesson._id)"
                :disabled="bookingInProgress === selectedLesson._id"
                class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {{ bookingInProgress === selectedLesson._id ? 'Booking...' : 'Book This Lesson Now' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
