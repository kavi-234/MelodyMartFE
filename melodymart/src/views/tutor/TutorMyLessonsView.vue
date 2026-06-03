<template>
  <div class="page">
    <div class="page-header">
      <div><h1 class="page-title">My Lessons</h1><p class="page-subtitle">Manage your lessons — edit, deactivate, or delete.</p></div>
      <RouterLink to="/dashboard/tutor/create-lesson" class="create-btn">+ Create Lesson</RouterLink>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading lessons...</p></div>
    <div v-else-if="error" class="error-state"><span>⚠️</span><p>{{ error }}</p><button @click="fetchLessons" class="retry-btn">Try Again</button></div>

    <div v-else-if="lessons.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No lessons yet</h3>
      <p>Create your first lesson and start teaching students.</p>
      <RouterLink to="/dashboard/tutor/create-lesson" class="create-btn">Create Your First Lesson</RouterLink>
    </div>

    <div v-else class="lessons-list">
      <div v-for="lesson in lessons" :key="lesson._id" class="lesson-card">
        <!-- View Mode -->
        <template v-if="editingId !== lesson._id">
          <div class="lesson-header">
            <div class="lesson-meta">
              <h3 class="lesson-title">{{ lesson.title }}</h3>
              <p class="lesson-desc">{{ lesson.description }}</p>
              <div class="lesson-tags">
                <span class="tag tag-instrument">🎵 {{ lesson.instrument }}</span>
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

        <!-- Edit Mode -->
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
    const data = await res.json()
    lessons.value = data.lessons || []
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
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
.page { max-width: 1100px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 30px; font-weight: 800; color: #1b1030; margin: 0 0 4px; letter-spacing: -0.5px; }
.page-subtitle { font-size: 15px; color: rgba(40,16,60,0.6); margin: 0; }
.create-btn { padding: 10px 20px; background: linear-gradient(90deg,#9754CB,#DEACF5); color: white; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; white-space: nowrap; }

.loading-state,.error-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.spinner { width: 44px; height: 44px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p,.error-state p { color: rgba(40,16,60,0.65); font-size: 14px; }
.retry-btn { padding: 9px 20px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 12px; text-align: center; }
.empty-icon { font-size: 52px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: #1b1030; margin: 0; }
.empty-state p { color: rgba(40,16,60,0.6); margin: 0; font-size: 14px; }

.lessons-list { display: flex; flex-direction: column; gap: 16px; }
.lesson-card { background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 22px; box-shadow: 0 4px 12px rgba(151,84,203,0.07); transition: border-color 0.2s; }
.lesson-card:hover { border-color: #9754CB; }

.lesson-header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.lesson-title { font-size: 18px; font-weight: 700; color: #1b1030; margin: 0 0 6px; }
.lesson-desc { font-size: 13px; color: rgba(40,16,60,0.6); margin: 0 0 10px; line-height: 1.5; }
.lesson-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.tag-instrument { background: rgba(151,84,203,0.08); color: #6237A0; border: 1px solid rgba(151,84,203,0.2); }
.tag-neutral { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.tag-green { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
.tag-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.tag-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.tag-grey { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.lesson-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-edit { padding: 8px 18px; background: rgba(151,84,203,0.1); color: #6237A0; border: 1.5px solid rgba(151,84,203,0.25); border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.btn-edit:hover { background: rgba(151,84,203,0.18); }
.btn-delete { padding: 8px 18px; background: #fee2e2; color: #dc2626; border: 1.5px solid #fca5a5; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.btn-delete:hover { background: #fecaca; }

.lesson-stats { display: flex; gap: 24px; flex-wrap: wrap; padding: 14px 0; border-top: 1px solid rgba(151,84,203,0.08); border-bottom: 1px solid rgba(151,84,203,0.08); }
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-label { font-size: 10px; font-weight: 700; color: #9754CB; text-transform: uppercase; }
.stat-val { font-size: 15px; font-weight: 700; color: #1b1030; }
.stat-val.price { color: #9754CB; }

.lesson-days { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 12px; }
.days-label { font-size: 11px; font-weight: 700; color: rgba(40,16,60,0.5); text-transform: uppercase; }
.day-chip { padding: 3px 10px; background: rgba(151,84,203,0.08); color: #6237A0; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid rgba(151,84,203,0.2); }

/* Edit form */
.edit-title { font-size: 16px; font-weight: 700; color: #6237A0; margin: 0 0 16px; }
.edit-form { display: flex; flex-direction: column; gap: 14px; }
.edit-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.edit-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.label { font-size: 12px; font-weight: 600; color: #1b1030; }
.input { padding: 9px 12px; border: 1.5px solid rgba(151,84,203,0.2); border-radius: 8px; font-size: 13px; color: #1b1030; background: white; outline: none; width: 100%; }
.input:focus { border-color: #9754CB; }
.textarea { resize: vertical; min-height: 80px; }
.chip-group { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid rgba(151,84,203,0.2); background: white; color: #6237A0; }
.chip:hover { border-color: #9754CB; }
.chip-active { background: #9754CB; color: white; border-color: #9754CB; }
.toggle-row { display: flex; gap: 24px; flex-wrap: wrap; }
.toggle-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #1b1030; cursor: pointer; }
.toggle-cb { accent-color: #9754CB; width: 15px; height: 15px; }
.edit-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
.btn-cancel { padding: 9px 20px; background: rgba(151,84,203,0.08); color: #6237A0; border: 1.5px solid rgba(151,84,203,0.2); border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; }
.btn-save { padding: 9px 24px; background: linear-gradient(90deg,#9754CB,#6237A0); color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
  .lesson-header { flex-direction: column; }
  .edit-grid-2,.edit-grid-4 { grid-template-columns: 1fr; }
}
</style>
