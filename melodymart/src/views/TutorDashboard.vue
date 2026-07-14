<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import CreateLesson from '../components/CreateLesson.vue'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('overview')
const myLessons = ref<any[]>([])
const loadingLessons = ref(false)
const editingLesson = ref<any>(null)
const editForm = ref({
  title: '',
  description: '',
  instrument: '',
  level: 'beginner',
  duration: 60,
  price: 0,
  maxStudents: 1,
  availableDays: [] as string[],
  availableTimeSlots: [] as string[],
  isOnline: true,
  location: '',
  isActive: true
})
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
]

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

const fetchMyLessons = async () => {
  loadingLessons.value = true
  try {
    const token = authStore.token || localStorage.getItem('token')
    if (!token) {
      console.error('No authentication token found')
      return
    }
    
    const response = await fetch('http://localhost:5000/api/lessons/tutor/my-lessons', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      myLessons.value = data.lessons
    } else {
      const errorData = await response.json()
      console.error('Failed to fetch lessons:', errorData)
    }
  } catch (error) {
    console.error('Error fetching lessons:', error)
  } finally {
    loadingLessons.value = false
  }
}

const deleteLesson = async (lessonId: string) => {
  if (!confirm('Are you sure you want to delete this lesson?')) return
  
  try {
    const token = authStore.token || localStorage.getItem('token')
    if (!token) {
      alert('Authentication required. Please log in again.')
      return
    }
    
    const response = await fetch(`http://localhost:5000/api/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.ok) {
      myLessons.value = myLessons.value.filter(lesson => lesson._id !== lessonId)
      alert('Lesson deleted successfully')
    } else {
      const errorData = await response.json()
      console.error('Delete failed:', errorData)
      alert(`Failed to delete lesson: ${errorData.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Error deleting lesson:', error)
    alert('Error deleting lesson')
  }
}

const startEditLesson = (lesson: any) => {
  editingLesson.value = lesson._id
  editForm.value = {
    title: lesson.title,
    description: lesson.description,
    instrument: lesson.instrument,
    level: lesson.level,
    duration: lesson.duration,
    price: lesson.price,
    maxStudents: lesson.maxStudents,
    availableDays: [...lesson.availableDays],
    availableTimeSlots: [...lesson.availableTimeSlots],
    isOnline: lesson.isOnline,
    location: lesson.location || '',
    isActive: lesson.isActive
  }
}

const cancelEdit = () => {
  editingLesson.value = null
}

const toggleDay = (day: string) => {
  const index = editForm.value.availableDays.indexOf(day)
  if (index > -1) {
    editForm.value.availableDays.splice(index, 1)
  } else {
    editForm.value.availableDays.push(day)
  }
}

const toggleTimeSlot = (slot: string) => {
  const index = editForm.value.availableTimeSlots.indexOf(slot)
  if (index > -1) {
    editForm.value.availableTimeSlots.splice(index, 1)
  } else {
    editForm.value.availableTimeSlots.push(slot)
  }
}

const saveEdit = async () => {
  if (!editingLesson.value) return
  
  try {
    const token = authStore.token || localStorage.getItem('token')
    if (!token) {
      alert('Authentication required. Please log in again.')
      return
    }
    
    const response = await fetch(`http://localhost:5000/api/lessons/${editingLesson.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editForm.value)
    })
    
    if (response.ok) {
      const data = await response.json()
      const index = myLessons.value.findIndex(l => l._id === editingLesson.value)
      if (index > -1) {
        myLessons.value[index] = data.lesson
      }
      editingLesson.value = null
      alert('Lesson updated successfully')
    } else {
      const errorData = await response.json()
      console.error('Update failed:', errorData)
      alert(`Failed to update lesson: ${errorData.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Error updating lesson:', error)
    alert('Error updating lesson')
  }
}

const onLessonCreated = () => {
  // Switch to My Lessons tab and refresh
  activeTab.value = 'my-lessons'
  fetchMyLessons()
}

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'tutor') {
    router.push('/')
    return
  }
  
  // Refresh user data to get latest verification status
  await authStore.refreshUser()
  
  // Fetch lessons
  await fetchMyLessons()
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
              <div class="text-sm text-slate-500 font-semibold">Specialization</div>
              <div class="text-lg text-white font-medium">{{ authStore.user?.specialization || 'Not set' }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500 font-semibold">Experience</div>
              <div class="text-lg text-white font-medium">{{ authStore.user?.experience || '0' }} years</div>
            </div>
            <div>
              <div class="text-sm text-slate-500 font-semibold">Hourly Rate</div>
              <div class="text-lg text-white font-medium">Rs {{ authStore.user?.hourlyRate || '0' }}/hour</div>
            </div>
            <div>
              <div class="text-sm text-slate-500 font-semibold">Status</div>
              <div :class="[verificationStatusColor, 'text-lg font-medium']">
                {{ verificationStatusText }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Lesson Tab -->
      <div v-if="activeTab === 'create-lesson'">
        <CreateLesson @lesson-created="onLessonCreated" />
      </div>

      <!-- My Lessons Tab -->
      <div v-if="activeTab === 'my-lessons'">
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 class="mb-6 text-2xl font-bold text-white">My Lessons</h2>
          
          <div v-if="loadingLessons" class="text-center py-8">
            <div class="text-slate-400">Loading lessons...</div>
          </div>

          <div v-else-if="myLessons.length === 0" class="text-center py-8">
            <div class="text-4xl mb-4">📚</div>
            <p class="text-slate-400 mb-4">You haven't created any lessons yet.</p>
            <button 
              @click="activeTab = 'create-lesson'"
              class="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-500"
            >
              Create Your First Lesson
            </button>
          </div>

          <div v-else class="grid gap-4">
            <div 
              v-for="lesson in myLessons" 
              :key="lesson._id"
              class="rounded-lg border border-slate-700 bg-slate-800 p-6 hover:border-purple-600 transition-colors"
            >
              <!-- View Mode -->
              <div v-if="editingLesson !== lesson._id" class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-white mb-2">{{ lesson.title }}</h3>
                  <p class="text-slate-400 mb-3">{{ lesson.description }}</p>
                  
                  <div class="flex flex-wrap gap-4 text-sm">
                    <div class="flex items-center gap-2">
                      <span class="text-slate-500">Instrument:</span>
                      <span class="text-white">{{ lesson.instrument }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-500">Level:</span>
                      <span class="text-white capitalize">{{ lesson.level }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-500">Duration:</span>
                      <span class="text-white">{{ lesson.duration }} mins</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-500">Price:</span>
                      <span class="text-white font-semibold">Rs {{ lesson.price }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-500">Max Students:</span>
                      <span class="text-white">{{ lesson.maxStudents }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-500">Type:</span>
                      <span class="text-white">{{ lesson.isOnline ? 'Online' : 'In-person' }}</span>
                    </div>
                  </div>

                  <div v-if="lesson.availableDays && lesson.availableDays.length > 0" class="mt-3">
                    <span class="text-slate-500 text-sm">Available Days: </span>
                    <span class="text-white text-sm">{{ lesson.availableDays.join(', ') }}</span>
                  </div>

                  <div v-if="lesson.enrolledStudents && lesson.enrolledStudents.length > 0" class="mt-3">
                    <span class="text-slate-500 text-sm">Enrolled Students: </span>
                    <span class="text-white text-sm">{{ lesson.enrolledStudents.length }}</span>
                  </div>
                </div>

                <div class="flex gap-2 ml-4">
                  <button 
                    @click="startEditLesson(lesson)"
                    class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    @click="deleteLesson(lesson._id)"
                    class="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500 transition-colors text-sm"
                  >
                    Delete
                  </button>
                  <button 
                    :class="[
                      'rounded-lg px-4 py-2 text-white transition-colors text-sm',
                      lesson.isActive 
                        ? 'bg-green-600 hover:bg-green-500' 
                        : 'bg-slate-600 hover:bg-slate-500'
                    ]"
                  >
                    {{ lesson.isActive ? 'Active' : 'Inactive' }}
                  </button>
                </div>
              </div>

              <!-- Edit Mode -->
              <div v-else class="space-y-4">
                <h3 class="text-xl font-semibold text-white mb-4">Edit Lesson</h3>
                
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-slate-400 mb-2">Title</label>
                    <input
                      v-model="editForm.title"
                      type="text"
                      class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm text-slate-400 mb-2">Instrument</label>
                    <input
                      v-model="editForm.instrument"
                      type="text"
                      class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-slate-400 mb-2">Description</label>
                  <textarea
                    v-model="editForm.description"
                    rows="3"
                    class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  ></textarea>
                </div>

                <div class="grid md:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm text-slate-400 mb-2">Level</label>
                    <select
                      v-model="editForm.level"
                      class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm text-slate-400 mb-2">Duration (mins)</label>
                    <input
                      v-model.number="editForm.duration"
                      type="number"
                      class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-sm text-slate-400 mb-2">Price (Rs)</label>
                    <input
                      v-model.number="editForm.price"
                      type="number"
                      class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-sm text-slate-400 mb-2">Max Students</label>
                    <input
                      v-model.number="editForm.maxStudents"
                      type="number"
                      class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-slate-400 mb-2">Available Days</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="day in days"
                      :key="day"
                      @click="toggleDay(day)"
                      :class="[
                        'px-4 py-2 rounded-lg text-sm transition-colors',
                        editForm.availableDays.includes(day)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-700 hover:border-purple-500'
                      ]"
                    >
                      {{ day }}
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-slate-400 mb-2">Available Time Slots</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="slot in timeSlots"
                      :key="slot"
                      @click="toggleTimeSlot(slot)"
                      :class="[
                        'px-3 py-2 rounded-lg text-sm transition-colors',
                        editForm.availableTimeSlots.includes(slot)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-700 hover:border-purple-500'
                      ]"
                    >
                      {{ slot }}
                    </button>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 text-slate-400">
                    <input
                      v-model="editForm.isOnline"
                      type="checkbox"
                      class="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Online Lesson</span>
                  </label>

                  <label class="flex items-center gap-2 text-slate-400">
                    <input
                      v-model="editForm.isActive"
                      type="checkbox"
                      class="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div v-if="!editForm.isOnline">
                  <label class="block text-sm text-slate-400 mb-2">Location</label>
                  <input
                    v-model="editForm.location"
                    type="text"
                    class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div class="flex gap-2 justify-end">
                  <button
                    @click="cancelEdit"
                    class="rounded-lg bg-slate-700 px-6 py-2 text-white hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveEdit"
                    class="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
