<template>
  <div class="my-lessons-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">My Lessons</h1>
        <p class="page-subtitle">View and manage your lesson bookings.</p>
      </div>
      <button class="browse-btn" @click="navigateToBrowse" v-if="lessons.length > 0">
        + Browse More Lessons
      </button>
    </div>

    <!-- Search and Filter Bar -->
    <div class="search-filter-bar" v-if="lessons.length > 0">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by lesson name or instructor..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="filter-controls">
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Status</option>
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

    <!-- Loading State -->
    <div class="loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>Loading your lessons...</p>
    </div>

    <!-- Error State -->
    <div class="error-state" v-else-if="error">
      <span class="error-icon">⚠️</span>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchLessons">Try Again</button>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else-if="filteredLessons.length === 0">
      <div class="empty-icon">📚</div>
      <h3>No lessons booked yet</h3>
      <p>Explore our lesson catalog and book your first music lesson with an expert tutor.</p>
      <button class="browse-btn-large" @click="navigateToBrowse">Browse Lessons</button>
    </div>

    <!-- Lessons Display -->
    <div v-else class="lessons-display">
      <!-- Desktop Table View -->
      <div class="desktop-view">
        <LessonTable
          :lessons="filteredLessons"
          @view-details="handleViewDetails"
          @reschedule="handleReschedule"
          @cancel="handleCancel"
        />
      </div>

      <!-- Mobile Card View -->
      <div class="mobile-view">
        <LessonCard
          v-for="lesson in filteredLessons"
          :key="lesson._id"
          :lesson="lesson"
          @view-details="handleViewDetails"
          @reschedule="handleReschedule"
          @cancel="handleCancel"
        />
      </div>

      <!-- Results Count -->
      <div class="results-footer">
        <p>Showing {{ filteredLessons.length }} of {{ lessons.length }} lesson(s)</p>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal"
        class="modal-overlay"
        @click.self="closeDetailModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Lesson Details</h2>
            <button class="close-btn" @click="closeDetailModal">✕</button>
          </div>

          <div class="modal-body" v-if="selectedLessonDetail">
            <div class="detail-section">
              <h3 class="detail-heading">{{ selectedLessonDetail.title }}</h3>
              <p class="detail-description">{{ selectedLessonDetail.description }}</p>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Instructor</span>
                <span class="detail-value">{{ selectedLessonDetail.tutor?.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value">{{ selectedLessonDetail.instrument }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value">{{ selectedLessonDetail.duration }} minutes</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Price</span>
                <span class="detail-value">Rs {{ selectedLessonDetail.price }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Level</span>
                <span class="detail-value">{{ selectedLessonDetail.level }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Format</span>
                <span class="detail-value">{{ selectedLessonDetail.isOnline ? 'Online' : 'In-Person' }}</span>
              </div>
            </div>

            <div v-if="selectedLessonDetail.availableDays" class="availability-section">
              <h4>Available Days</h4>
              <div class="tags">
                <span v-for="day in selectedLessonDetail.availableDays" :key="day" class="tag">{{ day }}</span>
              </div>
            </div>

            <div v-if="selectedLessonDetail.availableTimeSlots" class="availability-section">
              <h4>Available Time Slots</h4>
              <div class="tags">
                <span v-for="slot in selectedLessonDetail.availableTimeSlots" :key="slot" class="tag">{{ slot }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDetailModal">Close</button>
            <button class="btn btn-primary" @click="downloadReceipt">📥 Download Receipt</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reschedule Modal -->
    <Teleport to="body">
      <div
        v-if="showRescheduleModal"
        class="modal-overlay"
        @click.self="closeRescheduleModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Request Reschedule</h2>
            <button class="close-btn" @click="closeRescheduleModal">✕</button>
          </div>

          <div class="modal-body">
            <p class="modal-text">Request to reschedule your lesson with {{ selectedLesson?.tutor?.name }}.</p>
            <div class="form-group">
              <label>Preferred Date</label>
              <input type="date" v-model="rescheduleDate" class="form-input" />
            </div>
            <div class="form-group">
              <label>Preferred Time</label>
              <select v-model="rescheduleTime" class="form-input">
                <option value="">Select a time slot</option>
                <option v-for="slot in selectedLesson?.availableTimeSlots" :key="slot" :value="slot">
                  {{ slot }}
                </option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeRescheduleModal" :disabled="rescheduleLoading">Cancel</button>
            <button class="btn btn-primary" @click="submitReschedule" :disabled="rescheduleLoading">
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

// State
const lessons = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const selectedStatus = ref('')
const sortBy = ref('upcoming')
const showDetailModal = ref(false)
const showRescheduleModal = ref(false)
const selectedLesson = ref(null)
const selectedLessonDetail = ref(null)
const rescheduleDate = ref('')
const rescheduleTime = ref('')
const rescheduleLoading = ref(false)

// Computed
const filteredLessons = computed(() => {
  let filtered = lessons.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (lesson) =>
        (lesson.title && lesson.title.toLowerCase().includes(query)) ||
        (lesson.tutor?.name && lesson.tutor.name.toLowerCase().includes(query))
    )
  }

  // Filter by status
  if (selectedStatus.value) {
    filtered = filtered.filter((lesson) => lesson.bookingStatus === selectedStatus.value)
  }

  // Sort
  if (sortBy.value === 'upcoming') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.availableDays?.[0] || 0)
      const dateB = new Date(b.availableDays?.[0] || 0)
      return dateA - dateB
    })
  } else if (sortBy.value === 'recent') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA
    })
  }

  return filtered
})

// Methods
const fetchLessons = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await lessonService.getMyLessons()
    lessons.value = data
  } catch (err) {
    error.value = err.message || 'Failed to load lessons'
    console.error('Error fetching lessons:', err)
  } finally {
    loading.value = false
  }
}

const handleViewDetails = async (lesson) => {
  selectedLesson.value = lesson
  try {
    selectedLessonDetail.value = await lessonService.getLessonDetails(lesson._id)
  } catch (err) {
    selectedLessonDetail.value = lesson
  }
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedLessonDetail.value = null
}

const handleReschedule = (lesson) => {
  selectedLesson.value = lesson
  rescheduleDate.value = ''
  rescheduleTime.value = ''
  showRescheduleModal.value = true
}

const closeRescheduleModal = () => {
  showRescheduleModal.value = false
  selectedLesson.value = null
  rescheduleDate.value = ''
  rescheduleTime.value = ''
}

const submitReschedule = async () => {
  if (!rescheduleDate.value || !rescheduleTime.value) {
    alert('Please select both date and time')
    return
  }

  rescheduleLoading.value = true
  try {
    await lessonService.requestReschedule(selectedLesson.value._id, rescheduleDate.value, rescheduleTime.value)
    alert('Reschedule request submitted successfully')
    closeRescheduleModal()
    await fetchLessons()
  } catch (err) {
    alert('Failed to submit reschedule request: ' + err.message)
  } finally {
    rescheduleLoading.value = false
  }
}

const handleCancel = async (lesson) => {
  if (!confirm('Are you sure you want to cancel this lesson?')) {
    return
  }

  try {
    await lessonService.cancelLesson(lesson._id)
    alert('Lesson cancelled successfully')
    await fetchLessons()
  } catch (err) {
    alert('Failed to cancel lesson: ' + err.message)
  }
}

const downloadReceipt = () => {
  alert('Receipt download feature coming soon')
}

const navigateToBrowse = () => {
  router.push('/lessons')
}

// Lifecycle
onMounted(() => {
  fetchLessons()
})
</script>

<style scoped>
:root {
  --p-900: #28104E;
  --p-700: #6237A0;
  --p-500: #9754CB;
  --p-300: #DEACF5;
  --p-50: #FBF7FF;
  --text-dark: #1b1030;
}

.my-lessons-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 96px);
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(40,16,60,0.7);
  margin: 0;
}

.browse-btn {
  padding: 10px 16px;
  background: linear-gradient(90deg, var(--p-500), var(--p-300));
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(151,84,203,0.15);
}

/* Search and Filter */
.search-filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid rgba(151,84,203,0.2);
  border-radius: 8px;
  font-size: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,241,252,0.95));
  color: var(--text-dark);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgba(151,84,203,0.4);
  background: white;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 12px;
  border: 1px solid rgba(151,84,203,0.2);
  border-radius: 8px;
  font-size: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,241,252,0.95));
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: rgba(151,84,203,0.4);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(151,84,203,0.1);
  border-top-color: var(--p-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: 16px;
  color: rgba(40,16,60,0.7);
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
}

.error-state h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.error-state p {
  font-size: 14px;
  color: rgba(40,16,60,0.7);
  max-width: 400px;
  margin: 0;
}

.retry-btn {
  padding: 10px 24px;
  background: var(--p-500);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
}

.retry-btn:hover {
  background: var(--p-700);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  gap: 16px;
}

.empty-icon {
  font-size: 64px;
  line-height: 1;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.empty-state p {
  font-size: 16px;
  color: rgba(40,16,60,0.7);
  max-width: 400px;
  margin: 0;
}

.browse-btn-large {
  padding: 12px 32px;
  background: linear-gradient(90deg, var(--p-500), var(--p-300));
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
}

.browse-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(151,84,203,0.15);
}

/* Lessons Display */
.lessons-display {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

.results-footer {
  padding: 16px;
  text-align: center;
  color: rgba(40,16,60,0.7);
  font-size: 14px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(151,84,203,0.1);
  position: sticky;
  top: 0;
  background: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(40,16,60,0.5);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(151,84,203,0.1);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  border-bottom: 1px solid rgba(151,84,203,0.1);
  padding-bottom: 16px;
}

.detail-heading {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
}

.detail-description {
  margin: 0;
  font-size: 14px;
  color: rgba(40,16,60,0.7);
  line-height: 1.6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: rgba(40,16,60,0.6);
  font-weight: 600;
  text-transform: uppercase;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.availability-section {
  border-top: 1px solid rgba(151,84,203,0.1);
  padding-top: 16px;
}

.availability-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dark);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: rgba(151,84,203,0.1);
  color: var(--p-700);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(151,84,203,0.2);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(151,84,203,0.1);
  justify-content: flex-end;
  background: rgba(151,84,203,0.02);
  border-radius: 0 0 16px 16px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(90deg, var(--p-500), var(--p-300));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(151,84,203,0.1);
  color: var(--p-700);
  border: 1px solid rgba(151,84,203,0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(151,84,203,0.15);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.form-input {
  padding: 10px 12px;
  border: 1px solid rgba(151,84,203,0.2);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-dark);
}

.form-input:focus {
  outline: none;
  border-color: rgba(151,84,203,0.4);
  background: white;
}

.modal-text {
  font-size: 14px;
  color: rgba(40,16,60,0.7);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .my-lessons-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .browse-btn {
    width: 100%;
    text-align: center;
  }

  .search-filter-bar {
    flex-direction: column;
  }

  .search-box {
    min-width: auto;
  }

  .filter-controls {
    width: 100%;
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .modal-content {
    max-width: calc(100% - 40px);
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 16px;
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }

  .my-lessons-page {
    padding: 12px;
    min-height: calc(100vh - 80px);
  }
}
</style>

