<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Create Lesson</h1>
      <p class="page-subtitle">Add a new lesson for students to discover and book.</p>
    </div>

    <div class="form-card">
      <div v-if="successMessage" class="alert alert-success">✓ {{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-error">⚠️ {{ errorMessage }}</div>

      <form @submit.prevent="handleSubmit" class="form">

        <!-- Basic Info -->
        <section class="form-section">
          <h2 class="section-title">Basic Information</h2>
          <div class="field">
            <label class="label">Lesson Title <span class="req">*</span></label>
            <input v-model="form.title" type="text" placeholder="e.g., Beginner Guitar Lessons" class="input" required />
          </div>
          <div class="field">
            <label class="label">Instrument <span class="req">*</span></label>
            <input v-model="form.instrument" type="text" placeholder="e.g., Guitar, Piano, Violin" class="input" required />
          </div>
          <div class="field">
            <label class="label">Description <span class="req">*</span></label>
            <textarea v-model="form.description" rows="4" placeholder="Describe what students will learn..." class="input textarea" required></textarea>
          </div>
          <div class="grid-4">
            <div class="field">
              <label class="label">Level</label>
              <select v-model="form.level" class="input">
                <option value="beginner" style="color:#111827;background:#fff;">Beginner</option>
                <option value="intermediate" style="color:#111827;background:#fff;">Intermediate</option>
                <option value="advanced" style="color:#111827;background:#fff;">Advanced</option>
              </select>
            </div>
            <div class="field">
              <label class="label">Duration (min)</label>
              <input v-model.number="form.duration" type="number" min="30" step="15" class="input" />
            </div>
            <div class="field">
              <label class="label">Price (Rs)</label>
              <input v-model.number="form.price" type="number" min="0" step="50" class="input" />
            </div>
            <div class="field">
              <label class="label">Max Students</label>
              <input v-model.number="form.maxStudents" type="number" min="1" max="20" class="input" />
            </div>
          </div>
        </section>

        <!-- Availability -->
        <section class="form-section">
          <h2 class="section-title">Availability</h2>
          <div class="field">
            <label class="label">Available Days <span class="req">*</span></label>
            <div class="chip-group">
              <button v-for="day in DAYS" :key="day" type="button" @click="toggleDay(day)"
                :class="['chip', form.availableDays.includes(day) ? 'chip-active' : '']">
                {{ day }}
              </button>
            </div>
          </div>
          <div class="field">
            <label class="label">Time Slots <span class="req">*</span></label>
            <div class="chip-group chip-group-lg">
              <button v-for="slot in TIME_SLOTS" :key="slot" type="button" @click="toggleSlot(slot)"
                :class="['chip', form.availableTimeSlots.includes(slot) ? 'chip-active' : '']">
                {{ slot }}
              </button>
            </div>
          </div>
        </section>

        <!-- Location -->
        <section class="form-section">
          <h2 class="section-title">Format</h2>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="form.isOnline" :value="true" class="radio" /> Online
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.isOnline" :value="false" class="radio" /> In-Person
            </label>
          </div>
          <div v-if="!form.isOnline" class="field mt-3">
            <label class="label">Location Address</label>
            <input v-model="form.location" type="text" placeholder="Enter your studio/teaching location" class="input" />
          </div>
        </section>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Creating...' : 'Create Lesson' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM']

const form = reactive({
  title: '', description: '', instrument: '',
  level: 'beginner', duration: 60, price: 0, maxStudents: 1,
  availableDays: [] as string[], availableTimeSlots: [] as string[],
  isOnline: true, location: '',
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const toggleDay = (d: string) => {
  const i = form.availableDays.indexOf(d)
  i > -1 ? form.availableDays.splice(i, 1) : form.availableDays.push(d)
}
const toggleSlot = (s: string) => {
  const i = form.availableTimeSlots.indexOf(s)
  i > -1 ? form.availableTimeSlots.splice(i, 1) : form.availableTimeSlots.push(s)
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!form.title || !form.description || !form.instrument) { errorMessage.value = 'Please fill in all required fields.'; return }
  if (!form.availableDays.length) { errorMessage.value = 'Select at least one available day.'; return }
  if (!form.availableTimeSlots.length) { errorMessage.value = 'Select at least one time slot.'; return }

  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form }),
    })
    if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to create lesson') }
    successMessage.value = 'Lesson created successfully!'
    Object.assign(form, { title: '', description: '', instrument: '', level: 'beginner', duration: 60, price: 0, maxStudents: 1, availableDays: [], availableTimeSlots: [], isOnline: true, location: '' })
    setTimeout(() => router.push('/dashboard/tutor/lessons'), 1500)
  } catch (e: any) {
    errorMessage.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page { max-width: 860px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 30px; font-weight: 800; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.5px; }
.page-subtitle { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; }

.form-card { background: white; border: 2px solid #DEACF5; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(151,84,203,0.08); }

.alert { padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
.alert-success { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
.alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

.form { display: flex; flex-direction: column; gap: 28px; }
.form-section { display: flex; flex-direction: column; gap: 16px; }
.section-title { font-size: 16px; font-weight: 700; color: #6237A0; margin: 0 0 4px; padding-bottom: 10px; border-bottom: 2px solid rgba(151,84,203,0.12); }

.field { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 13px; font-weight: 600; color: #ffffff; }
.req { color: #e53e3e; }
.input {
  padding: 10px 14px; border: 1.5px solid rgba(151,84,203,0.2); border-radius: 8px;
  font-size: 14px; color: #1b1030; background: white; width: 100%;
  transition: border-color 0.2s; outline: none;
}
.input:focus { border-color: #9754CB; box-shadow: 0 0 0 3px rgba(151,84,203,0.1); }
.textarea { resize: vertical; min-height: 100px; }
select.input { color: #ffffff; }

.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.mt-3 { margin-top: 8px; }

.chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
.chip-group-lg .chip { min-width: 90px; }
.chip {
  padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
  border: 1.5px solid rgba(151,84,203,0.25); background: white; color: #6237A0;
  transition: all 0.15s;
}
.chip:hover { border-color: #9754CB; background: rgba(151,84,203,0.05); }
.chip-active { background: #9754CB; color: white; border-color: #9754CB; }

.radio-group { display: flex; gap: 24px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #ffffff; cursor: pointer; }
.radio { accent-color: #9754CB; width: 16px; height: 16px; }

.submit-btn {
  padding: 14px; background: linear-gradient(90deg,#9754CB,#6237A0); color: white;
  border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 4px 14px rgba(151,84,203,0.3);
}
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(151,84,203,0.35); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

@media (max-width: 700px) { .grid-4 { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .grid-4 { grid-template-columns: 1fr; } .form-card { padding: 20px; } }
</style>
