<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Lessons</h1>
        <p class="page-subtitle">View and manage your lesson bookings.</p>
      </div>
      <button class="browse-btn" @click="navigateToBrowse" v-if="lessons.length > 0">+ Browse More Lessons</button>
    </div>

    <div class="filter-bar" v-if="lessons.length > 0">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Search by lesson name or instructor..." class="search-input" />
      </div>
      <div class="filter-controls">
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="Pending Payment">Pending Payment</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="upcoming">Upcoming First</option>
          <option value="recent">Recent First</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading your lessons...</p></div>

    <div v-else-if="error" class="state-box">
      <div class="error-icon-wrap">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3 class="state-heading">Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchLessons">Try Again</button>
    </div>

    <div v-else-if="filteredLessons.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
      <h3>No lessons booked yet</h3>
      <p>Explore our lesson catalog and book your first music lesson with an expert tutor.</p>
      <button class="browse-btn" @click="navigateToBrowse">Browse Lessons</button>
    </div>

    <div v-else class="lessons-display">
      <div class="desktop-only">
        <LessonTable :lessons="filteredLessons" @view-details="handleViewDetails" @reschedule="handleReschedule" @cancel="handleCancel" @pay-now="handlePayNow" />
      </div>
      <div class="mobile-only">
        <LessonCard v-for="lesson in filteredLessons" :key="lesson._id" :lesson="lesson" @view-details="handleViewDetails(lesson)" @reschedule="handleReschedule(lesson)" @cancel="handleCancel(lesson)" @pay-now="handlePayNow(lesson)" />
      </div>
      <div class="results-footer">Showing {{ filteredLessons.length }} of {{ lessons.length }} lesson(s)</div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">Lesson Details</h2>
            <button class="modal-close" @click="closeDetailModal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body" v-if="selectedLessonDetail">
            <div class="detail-top">
              <h3 class="detail-heading">{{ selectedLessonDetail.title }}</h3>
              <p class="detail-desc">{{ selectedLessonDetail.description }}</p>
            </div>
            <div class="detail-grid">
              <div class="detail-item"><span class="dk">Instructor</span><span class="dv">{{ selectedLessonDetail.tutor?.name }}</span></div>
              <div class="detail-item"><span class="dk">Category</span><span class="dv">{{ selectedLessonDetail.instrument }}</span></div>
              <div class="detail-item"><span class="dk">Duration</span><span class="dv">{{ selectedLessonDetail.duration }} min</span></div>
              <div class="detail-item"><span class="dk">Price</span><span class="dv gold">Rs {{ selectedLessonDetail.price }}</span></div>
              <div class="detail-item"><span class="dk">Level</span><span class="dv">{{ selectedLessonDetail.level }}</span></div>
              <div class="detail-item"><span class="dk">Format</span><span class="dv">{{ selectedLessonDetail.isOnline ? 'Online' : 'In-Person' }}</span></div>
            </div>
            <div v-if="selectedLessonDetail.availableDays?.length" class="avail-section">
              <h4 class="avail-title">Available Days</h4>
              <div class="tags"><span v-for="day in selectedLessonDetail.availableDays" :key="day" class="tag">{{ day }}</span></div>
            </div>
            <div v-if="selectedLessonDetail.availableTimeSlots?.length" class="avail-section">
              <h4 class="avail-title">Available Time Slots</h4>
              <div class="tags"><span v-for="slot in selectedLessonDetail.availableTimeSlots" :key="slot" class="tag">{{ slot }}</span></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-close" @click="closeDetailModal">Close</button>
            <button class="btn-download" @click="downloadReceipt">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reschedule Modal -->
    <Teleport to="body">
      <div v-if="showRescheduleModal" class="modal-overlay" @click.self="closeRescheduleModal">
        <div class="modal-box modal-sm">
          <div class="modal-header">
            <h2 class="modal-title">Request Reschedule</h2>
            <button class="modal-close" @click="closeRescheduleModal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-desc">Request to reschedule your lesson with <strong>{{ selectedLesson?.tutor?.name }}</strong>.</p>
            <div class="form-field">
              <label class="form-label">Preferred Date</label>
              <input type="date" v-model="rescheduleDate" class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label">Preferred Time</label>
              <select v-model="rescheduleTime" class="form-input">
                <option value="">Select a time slot</option>
                <option v-for="slot in selectedLesson?.availableTimeSlots" :key="slot" :value="slot">{{ slot }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-close" @click="closeRescheduleModal" :disabled="rescheduleLoading">Cancel</button>
            <button class="btn-primary" @click="submitReschedule" :disabled="rescheduleLoading">
              {{ rescheduleLoading ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LessonTable from '../components/LessonTable.vue'
import LessonCard from '../components/LessonCard.vue'
import lessonService from '../services/lessonService'

const router = useRouter()
const lessons = ref([])
const loading = ref(false); const error = ref(null)
const searchQuery = ref(''); const selectedStatus = ref(''); const sortBy = ref('upcoming')
const showDetailModal = ref(false); const showRescheduleModal = ref(false)
const selectedLesson = ref(null); const selectedLessonDetail = ref(null)
const rescheduleDate = ref(''); const rescheduleTime = ref(''); const rescheduleLoading = ref(false)

const filteredLessons = computed(() => {
  let list = lessons.value
  if (searchQuery.value) { const q = searchQuery.value.toLowerCase(); list = list.filter(l => l.title?.toLowerCase().includes(q) || l.tutor?.name?.toLowerCase().includes(q)) }
  if (selectedStatus.value) list = list.filter(l => l.bookingStatus === selectedStatus.value)
  if (sortBy.value === 'upcoming') list = [...list].sort((a, b) => new Date(a.availableDays?.[0] || 0) - new Date(b.availableDays?.[0] || 0))
  else list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  return list
})

const fetchLessons = async () => {
  loading.value = true; error.value = null
  try { lessons.value = await lessonService.getMyLessons() }
  catch (e) { error.value = e.message || 'Failed to load lessons' }
  finally { loading.value = false }
}

const handleViewDetails = async (lesson) => {
  selectedLesson.value = lesson
  try { selectedLessonDetail.value = await lessonService.getLessonDetails(lesson._id) }
  catch { selectedLessonDetail.value = lesson }
  showDetailModal.value = true
}
const closeDetailModal = () => { showDetailModal.value = false; selectedLessonDetail.value = null }
const handleReschedule = (lesson) => { selectedLesson.value = lesson; rescheduleDate.value = ''; rescheduleTime.value = ''; showRescheduleModal.value = true }
const closeRescheduleModal = () => { showRescheduleModal.value = false; selectedLesson.value = null; rescheduleDate.value = ''; rescheduleTime.value = '' }
const submitReschedule = async () => {
  if (!rescheduleDate.value || !rescheduleTime.value) { alert('Please select both date and time'); return }
  rescheduleLoading.value = true
  try { await lessonService.requestReschedule(selectedLesson.value._id, rescheduleDate.value, rescheduleTime.value); alert('Reschedule request submitted'); closeRescheduleModal(); await fetchLessons() }
  catch (e) { alert('Failed: ' + e.message) }
  finally { rescheduleLoading.value = false }
}
const handleCancel = async (lesson) => {
  if (!confirm('Cancel this lesson?')) return
  try { await lessonService.cancelLesson(lesson._id); alert('Lesson cancelled'); await fetchLessons() }
  catch (e) { alert('Failed to cancel: ' + e.message) }
}
const handlePayNow = (lesson) => router.push({ path: `/dashboard/customer/lesson-payment/${lesson._id}`, state: { booking: lesson } })
const downloadReceipt = () => alert('Receipt download coming soon')
const navigateToBrowse = () => router.push('/lessons')
onMounted(fetchLessons)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }
.browse-btn { display: inline-flex; align-items: center; padding: 0.625rem 1.25rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 12px rgba(42,157,159,0.25); }
.browse-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(42,157,159,0.35); }

.filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-wrap { flex: 1; min-width: 200px; position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--mm-stone); pointer-events: none; }
.search-input { width: 100%; padding: 0.5625rem 0.875rem 0.5625rem 2.25rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.search-input::placeholder { color: var(--mm-stone); }
.search-input:focus { border-color: var(--mm-teal); }
.filter-controls { display: flex; gap: 0.75rem; }
.filter-select { padding: 0.5625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; min-width: 130px; transition: border-color 0.2s; }
.filter-select:focus { border-color: var(--mm-teal); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.875rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-teal); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.error-icon-wrap { width: 64px; height: 64px; border-radius: 50%; background: rgba(224,112,96,0.1); color: var(--mm-coral); display: flex; align-items: center; justify-content: center; }
.state-heading { font-size: 1.125rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.875rem; text-align: center; }
.empty-icon-wrap { width: 72px; height: 72px; border-radius: 50%; background: rgba(42,157,159,0.1); color: var(--mm-teal); display: flex; align-items: center; justify-content: center; }
.empty-state h3 { font-size: 1.25rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.empty-state p { font-size: 0.875rem; color: var(--mm-sand); max-width: 400px; margin: 0; }

.lessons-display { display: flex; flex-direction: column; gap: 1.25rem; }
.results-footer { text-align: center; color: var(--mm-stone); font-size: 0.8125rem; padding: 0.75rem; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.25rem; backdrop-filter: blur(4px); }
.modal-box { background: var(--mm-carbon); border: 1px solid var(--mm-warm-line); border-radius: 1rem; max-width: 580px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
.modal-sm { max-width: 440px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--mm-warm-line); position: sticky; top: 0; background: var(--mm-carbon); border-radius: 1rem 1rem 0 0; }
.modal-title { font-family: 'DM Serif Display', serif; font-size: 1.25rem; color: var(--mm-ivory); margin: 0; }
.modal-close { background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; color: var(--mm-sand); cursor: pointer; padding: 0.375rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.modal-close:hover { background: var(--mm-onyx); color: var(--mm-ivory); }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }
.detail-top { padding-bottom: 1rem; border-bottom: 1px solid var(--mm-warm-line); }
.detail-heading { font-family: 'DM Serif Display', serif; font-size: 1.25rem; color: var(--mm-ivory); margin: 0 0 0.5rem; }
.detail-desc { font-size: 0.875rem; color: var(--mm-sand); line-height: 1.6; margin: 0; }
.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.detail-item { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.75rem; background: rgba(42,157,159,0.04); border: 1px solid rgba(42,157,159,0.08); border-radius: 0.5rem; }
.dk { font-size: 0.6875rem; font-weight: 700; color: var(--mm-teal); text-transform: uppercase; letter-spacing: 0.04em; }
.dv { font-size: 0.875rem; font-weight: 700; color: var(--mm-ivory); }
.dv.gold { color: var(--mm-gold); }
.avail-section { border-top: 1px solid var(--mm-warm-line); padding-top: 1rem; }
.avail-title { font-size: 0.8125rem; font-weight: 700; color: var(--mm-cream); margin: 0 0 0.625rem; }
.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag { display: inline-flex; align-items: center; padding: 0.3125rem 0.75rem; background: rgba(42,157,159,0.1); color: var(--mm-teal); border: 1px solid rgba(42,157,159,0.2); border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; }
.modal-footer { display: flex; gap: 0.625rem; padding: 1rem 1.5rem; border-top: 1px solid var(--mm-warm-line); justify-content: flex-end; }
.btn-close { padding: 0.5625rem 1.25rem; background: rgba(42,157,159,0.08); color: var(--mm-teal); border: 1px solid rgba(42,157,159,0.2); border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
.btn-download { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
.btn-primary { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
.btn-primary:disabled, .btn-close:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-desc { font-size: 0.875rem; color: var(--mm-sand); margin: 0 0 1rem; }
.modal-desc strong { color: var(--mm-ivory); }
.form-field { display: flex; flex-direction: column; gap: 0.3125rem; margin-bottom: 0.875rem; }
.form-label { font-size: 0.8125rem; font-weight: 600; color: var(--mm-sand); }
.form-input { padding: 0.625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.form-input:focus { border-color: var(--mm-teal); }

.desktop-only { display: block; }
.mobile-only { display: none; }
@media (max-width: 768px) { .desktop-only { display: none; } .mobile-only { display: block; } .filter-bar { flex-direction: column; } .filter-controls { flex-direction: column; } .filter-select, .search-input { width: 100%; } .page-header { flex-direction: column; align-items: flex-start; } .browse-btn { width: 100%; justify-content: center; } .detail-grid { grid-template-columns: 1fr; } .modal-footer { flex-direction: column; } .btn-close, .btn-download, .btn-primary { width: 100%; justify-content: center; } }
</style>
