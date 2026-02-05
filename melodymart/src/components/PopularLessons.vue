<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Lesson {
  _id: string
  title: string
  instrument: string
  level: string
  price: number
  duration: number
  tutor: {
    name: string
    avatar?: string
  }
  enrolledStudents: string[]
  maxStudents: number
}

const lessons = ref<Lesson[]>([])
const loading = ref(false)

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

const handleBookLesson = (lessonId: string) => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Please login to book a lesson')
    window.location.href = '/auth'
    return
  }
  // TODO: Navigate to lesson details or booking page
  console.log('Book lesson:', lessonId)
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

          <!-- Book Button -->
          <button
            @click="handleBookLesson(lesson._id)"
            class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Book Lesson
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
