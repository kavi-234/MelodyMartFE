<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Lessons</h1>
        <p class="page-subtitle">Manage your lessons — edit, deactivate, or delete.</p>
      </div>
      <RouterLink to="/dashboard/tutor/create-lesson" class="create-btn">+ Create Lesson</RouterLink>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading lessons...</p></div>
    <div v-else-if="error" class="state-box"><span class="state-icon">⚠</span><p>{{ error }}</p><button @click="fetchLessons" class="retry-btn">Try Again</button></div>

    <div v-else-if="lessons.length === 0" class="state-box">
      <div style="font-size:3rem">📚</div>
      <h3 class="empty-title">No lessons yet</h3>
      <p class="empty-sub">Create your first lesson and start teaching students.</p>
      <RouterLink to="/dashboard/tutor/create-lesson" class="create-btn">Create Your First Lesson</RouterLink>
    </div>

    <div v-else class="lessons-list">
      <div v-for="lesson in lessons" :key="lesson._id" class="lesson-card">
        <template v-if="editingId !== lesson._id">
          <div class="lesson-header">
            <div class="lesson-meta">
              <h3 class="lesson-title">{{ lesson.title }}</h3>
              <p class="lesson-desc">{{ lesson.description }}</p>
              <div class="lesson-tags">
                <span class="tag tag-instrument">♪ {{ lesson.instrument }}</span>
                <span class="tag" :class="levelClass(lesson.level)">{{ lesson.level }}</span>
                <span class="tag tag-neutral">{{ lesson.isOnline ? '🌐 Online' : '📍 In-Person' }}</span>
                <span class="tag" :class="lesson.isActive ? 'tag-green' : 'tag-grey'">{{ lesson.isActive ? '✓ Active' : '✕ Inactive' }}</span>
              </div>
            </div>
            <div class="lesson-actions">
              <button @click="startEdit(lesson)" class="btn-edit">Edit</button>
              <button @click="deleteLesson(lesson._id)" class="btn-delete">Delete</button>
            </div>
          </div>
          <div class="lesson-stats">
            <div class="stat"><span class="stat-label">Duration</span><span class="stat-val">{{ lesson.duration }} min</span></div>
            <div class="stat"><span class="stat-label">Price</span><span class="stat-val price">Rs {{ lesson.price }}</span></div>
            <div class="stat"><span class="stat-label">Max Students</span><span class="stat-val">{{ lesson.maxStudents }}</span></div>
            <div class="stat"><span class="stat-label">Enrolled</span><span class="stat-val">{{ lesson.enrolledStudents?.length || 0 }}</span></div>
          </div>
          <div v-if="lesson.availableDays?.length" class="lesson-days">
            <span class="days-label">Days:</span>
            <span v-for="d in lesson.availableDays" :key="d" class="day-chip">{{ d }}</span>
          </div>
        </template>

        <template v-else>
          <h3 class="edit-title">Editing: {{ lesson.title }}</h3>
          <div class="edit-form">
            <div class="edit-grid-2">
              <div class="field"><label class="label">Title</label><input v-model="editForm.title" class="input" /></div>
              <div class="field"><label class="label">Instrument</label><input v-model="editForm.instrument" class="input" /></div>
            </div>
            <div class="field"><label class="label">Description</label><textarea v-model="editForm.description" rows="3" class="input textarea"></textarea></div>
            <div class="edit-grid-4">
              <div class="field">
                <label class="label">Level</label>
                <select v-model="editForm.level" class="input">
                  <option value="beginner" style="color:#111827;background:#fff;">Beginner</option>
                  <option value="intermediate" style="color:#111827;background:#fff;">Intermediate</option>
                  <option value="advanced" style="color:#111827;background:#fff;">Advanced</option>
                </select>
              </div>
              <div class="field"><label class="label">Duration (min)</label><input v-model.number="editForm.duration" type="number" class="input" /></div>
              <div class="field"><label class="label">Price (Rs)</label><input v-model.number="editForm.price" type="number" class="input" /></div>
              <div class="field"><label class="label">Max Students</label><input v-model.number="editForm.maxStudents" type="number" class="input" /></div>
            </div>
            <div class="field">
              <label class="label">Available Days</label>
              <div class="chip-group">
                <button v-for="d in DAYS" :key="d" type="button" @click="toggleDay(d)" :class="['chip', editForm.availableDays.includes(d) ? 'chip-active' : '']">{{ d }}</button>
              </div>
            </div>
            <div class="field">
              <label class="label">Time Slots</label>
              <div class="chip-group">
                <button v-for="s in TIME_SLOTS" :key="s" type="button" @click="toggleSlot(s)" :class="['chip', editForm.availableTimeSlots.includes(s) ? 'chip-active' : '']">{{ s }}</button>
              </div>
            </div>
            <div class="toggle-row">
              <label class="toggle-label"><input type="checkbox" v-model="editForm.isOnline" class="toggle-cb" /> Online Lesson</label>
              <label class="toggle-label"><input type="checkbox" v-model="editForm.isActive" class="toggle-cb" /> Active</label>
            </div>
            <div v-if="!editForm.isOnline" class="field"><label class="label">Location</label><input v-model="editForm.location" class="input" /></div>
            <div class="edit-actions">
              <button @click="cancelEdit" class="btn-cancel">Cancel</button>
              <button @click="saveEdit" :disabled="saving" class="btn-save">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM']

const lessons = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const editingId = ref<string | null>(null)
const editForm = reactive({ title: '', description: '', instrument: '', level: 'beginner', duration: 60, price: 0, maxStudents: 1, availableDays: [] as string[], availableTimeSlots: [] as string[], isOnline: true, isActive: true, location: '' })

const fetchLessons = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/lessons/tutor/my-lessons', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to load lessons')
    const data = await res.json(); lessons.value = data.lessons || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const deleteLesson = async (id: string) => {
  if (!confirm('Delete this lesson? This cannot be undone.')) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/lessons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) lessons.value = lessons.value.filter(l => l._id !== id)
    else alert('Failed to delete lesson')
  } catch { alert('Error deleting lesson') }
}

const startEdit = (lesson: any) => {
  editingId.value = lesson._id
  Object.assign(editForm, { ...lesson, availableDays: [...lesson.availableDays], availableTimeSlots: [...lesson.availableTimeSlots], location: lesson.location || '' })
}
const cancelEdit = () => { editingId.value = null }
const toggleDay = (d: string) => { const i = editForm.availableDays.indexOf(d); i > -1 ? editForm.availableDays.splice(i, 1) : editForm.availableDays.push(d) }
const toggleSlot = (s: string) => { const i = editForm.availableTimeSlots.indexOf(s); i > -1 ? editForm.availableTimeSlots.splice(i, 1) : editForm.availableTimeSlots.push(s) }

const saveEdit = async () => {
  saving.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/lessons/${editingId.value}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...editForm }),
    })
    if (!res.ok) { const d = await res.json(); throw new Error(d.message) }
    const data = await res.json()
    const idx = lessons.value.findIndex(l => l._id === editingId.value)
    if (idx > -1) lessons.value[idx] = data.lesson
    editingId.value = null
  } catch (e: any) { alert(e.message || 'Failed to save') }
  finally { saving.value = false }
}

const levelClass = (l: string) => ({ 'tag-green': l === 'beginner', 'tag-amber': l === 'intermediate', 'tag-red': l === 'advanced' })
onMounted(fetchLessons)
</script>

<style scoped>
.page { max-width: 1100px; padding: 1.75rem 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }
.create-btn { padding: 0.625rem 1.25rem; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); border-radius: 0.5rem; font-weight: 700; font-size: 0.875rem; text-decoration: none; white-space: nowrap; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(212,168,83,0.2); display: inline-block; }
.create-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(212,168,83,0.3); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-gold); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.state-icon { font-size: 1.5rem; }
.empty-title { font-size: 1.25rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.empty-sub { color: var(--mm-sand); margin: 0; font-size: 0.875rem; }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }

.lessons-list { display: flex; flex-direction: column; gap: 1rem; }
.lesson-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.375rem; transition: border-color 0.2s; }
.lesson-card:hover { border-color: var(--mm-stone); }

.lesson-header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 0.875rem; }
.lesson-title { font-size: 1.0625rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.375rem; }
.lesson-desc { font-size: 0.8125rem; color: var(--mm-sand); margin: 0 0 0.625rem; line-height: 1.5; }
.lesson-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.tag { padding: 0.1875rem 0.625rem; border-radius: 20px; font-size: 0.6875rem; font-weight: 700; }
.tag-instrument { background: rgba(212,168,83,0.1); color: var(--mm-gold); border: 1px solid rgba(212,168,83,0.2); }
.tag-neutral { background: var(--mm-mist); color: var(--mm-sand); border: 1px solid var(--mm-warm-line); }
.tag-green { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.tag-amber { background: rgba(212,168,83,0.12);  color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.tag-red   { background: rgba(224,112,96,0.12);  color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }
.tag-grey  { background: var(--mm-mist); color: var(--mm-stone); border: 1px solid var(--mm-warm-line); }

.lesson-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
.btn-edit { padding: 0.5rem 1.125rem; background: rgba(212,168,83,0.08); color: var(--mm-gold); border: 1px solid rgba(212,168,83,0.2); border-radius: 0.5rem; font-weight: 700; font-size: 0.8125rem; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.btn-edit:hover { background: rgba(212,168,83,0.15); }
.btn-delete { padding: 0.5rem 1.125rem; background: rgba(224,112,96,0.08); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.2); border-radius: 0.5rem; font-weight: 700; font-size: 0.8125rem; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.btn-delete:hover { background: rgba(224,112,96,0.15); }

.lesson-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; padding: 0.875rem 0; border-top: 1px solid var(--mm-warm-line); border-bottom: 1px solid var(--mm-warm-line); }
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-label { font-size: 0.625rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; }
.stat-val { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); }
.stat-val.price { color: var(--mm-gold); }

.lesson-days { display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center; margin-top: 0.75rem; }
.days-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; }
.day-chip { padding: 0.1875rem 0.625rem; background: rgba(212,168,83,0.08); color: var(--mm-gold); border-radius: 20px; font-size: 0.6875rem; font-weight: 600; border: 1px solid rgba(212,168,83,0.15); }

.edit-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1rem; }
.edit-form { display: flex; flex-direction: column; gap: 0.875rem; }
.edit-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
.edit-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.875rem; }
.field { display: flex; flex-direction: column; gap: 0.3125rem; }
.label { font-size: 0.75rem; font-weight: 600; color: var(--mm-sand); }
.input { padding: 0.5625rem 0.75rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; font-size: 0.8125rem; color: var(--mm-ivory); outline: none; width: 100%; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.input::placeholder { color: var(--mm-stone); }
.input:focus { border-color: var(--mm-gold); box-shadow: 0 0 0 3px rgba(212,168,83,0.1); }
.textarea { resize: vertical; min-height: 80px; }
.chip-group { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.chip { padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: 1px solid var(--mm-warm-line); background: var(--mm-mist); color: var(--mm-sand); transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.chip:hover { border-color: var(--mm-gold); color: var(--mm-ivory); }
.chip-active { background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); border-color: transparent; }
.toggle-row { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.toggle-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--mm-ivory); cursor: pointer; }
.toggle-cb { accent-color: var(--mm-gold); width: 15px; height: 15px; }
.edit-actions { display: flex; gap: 0.625rem; justify-content: flex-end; padding-top: 0.25rem; }
.btn-cancel { padding: 0.5625rem 1.25rem; background: var(--mm-mist); color: var(--mm-sand); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; font-weight: 700; font-size: 0.8125rem; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-save { padding: 0.5625rem 1.5rem; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 700; font-size: 0.8125rem; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) { .lesson-header { flex-direction: column; } .edit-grid-2,.edit-grid-4 { grid-template-columns: 1fr; } .page { padding: 1.25rem; } }
</style>
