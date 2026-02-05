<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const formData = ref({
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
  location: ''
})

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
]

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const toggleDay = (day: string) => {
  const index = formData.value.availableDays.indexOf(day)
  if (index > -1) {
    formData.value.availableDays.splice(index, 1)
  } else {
    formData.value.availableDays.push(day)
  }
}

const toggleTimeSlot = (slot: string) => {
  const index = formData.value.availableTimeSlots.indexOf(slot)
  if (index > -1) {
    formData.value.availableTimeSlots.splice(index, 1)
  } else {
    formData.value.availableTimeSlots.push(slot)
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (!formData.value.title || !formData.value.description || !formData.value.instrument) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  if (formData.value.availableDays.length === 0) {
    errorMessage.value = 'Please select at least one available day'
    return
  }

  if (formData.value.availableTimeSlots.length === 0) {
    errorMessage.value = 'Please select at least one time slot'
    return
  }

  loading.value = true

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to create lesson')
    }

    successMessage.value = 'Lesson created successfully!'
    
    // Reset form
    formData.value = {
      title: '',
      description: '',
      instrument: '',
      level: 'beginner',
      duration: 60,
      price: 0,
      maxStudents: 1,
      availableDays: [],
      availableTimeSlots: [],
      isOnline: true,
      location: ''
    }
  } catch (err: any) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
    <h2 class="mb-6 text-2xl font-bold text-white">Create New Lesson</h2>

    <div v-if="successMessage" class="mb-4 rounded-lg bg-green-900/20 border border-green-800 p-4 text-green-400">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-900/20 border border-red-800 p-4 text-red-400">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-white">Basic Information</h3>
        
        <div>
          <label class="block text-sm text-slate-400 mb-2">Lesson Title *</label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="e.g., Beginner Guitar Lessons"
            class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-sm text-slate-400 mb-2">Instrument *</label>
          <input
            v-model="formData.instrument"
            type="text"
            placeholder="e.g., Guitar, Piano, Violin"
            class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-sm text-slate-400 mb-2">Description *</label>
          <textarea
            v-model="formData.description"
            rows="4"
            placeholder="Describe what students will learn..."
            class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            required
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-slate-400 mb-2">Level</label>
            <select
              v-model="formData.level"
              class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-2">Duration (minutes)</label>
            <input
              v-model.number="formData.duration"
              type="number"
              min="30"
              step="15"
              class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-slate-400 mb-2">Price per Session (Rs)</label>
            <input
              v-model.number="formData.price"
              type="number"
              min="0"
              step="5"
              class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-2">Max Students</label>
            <input
              v-model.number="formData.maxStudents"
              type="number"
              min="1"
              max="20"
              class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Availability -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-white">Availability</h3>
        
        <div>
          <label class="block text-sm text-slate-400 mb-2">Available Days *</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in days"
              :key="day"
              type="button"
              @click="toggleDay(day)"
              :class="[
                'px-4 py-2 rounded-lg border transition-colors',
                formData.availableDays.includes(day)
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-purple-600'
              ]"
            >
              {{ day }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm text-slate-400 mb-2">Available Time Slots *</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="slot in timeSlots"
              :key="slot"
              type="button"
              @click="toggleTimeSlot(slot)"
              :class="[
                'px-3 py-2 rounded-lg border text-sm transition-colors',
                formData.availableTimeSlots.includes(slot)
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-purple-600'
              ]"
            >
              {{ slot }}
            </button>
          </div>
        </div>
      </div>

      <!-- Location -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-white">Location</h3>
        
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="formData.isOnline"
              type="radio"
              :value="true"
              class="text-purple-600"
            />
            <span class="text-white">Online</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="formData.isOnline"
              type="radio"
              :value="false"
              class="text-purple-600"
            />
            <span class="text-white">In-Person</span>
          </label>
        </div>

        <div v-if="!formData.isOnline">
          <label class="block text-sm text-slate-400 mb-2">Location Address</label>
          <input
            v-model="formData.location"
            type="text"
            placeholder="Enter your studio/teaching location"
            class="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
      >
        {{ loading ? 'Creating...' : 'Create Lesson' }}
      </button>
    </form>
  </div>
</template>
