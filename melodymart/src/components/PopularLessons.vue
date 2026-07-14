<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Lesson {
  _id: string; title: string; description: string; instrument: string; level: string
  price: number; duration: number
  tutor: { _id: string; name: string; avatar?: string; specialization?: string; experience?: number }
  enrolledStudents: string[]; maxStudents: number; availableDays: string[]
  availableTimeSlots: string[]; isOnline: boolean; location?: string; isActive: boolean; createdAt: string
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
      lessons.value = data.lessons.slice(0, 4)
    }
  } catch (error) {
    console.error('Failed to fetch lessons:', error)
  } finally {
    loading.value = false
  }
}

const getLevelClass = (level: string) => {
  const map: Record<string, string> = {
    beginner:     'tag-emerald',
    intermediate: 'tag-amber',
    advanced:     'tag-coral',
  }
  return map[level] || 'tag-mist'
}

import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import lessonService from '../services/lessonService'

const router = useRouter()
const authStore = useAuthStore()
const bookingInProgress = ref<string | null>(null)

const handleBookLesson = async (lessonId: string) => {
  const token = localStorage.getItem('token')
  if (!token) { alert('Please login to book a lesson'); router.push('/auth'); return }
  bookingInProgress.value = lessonId
  try {
    await lessonService.bookLesson(lessonId)
    authStore.incrementMyLessonsCount()
    const lessonObj = lessons.value.find((l) => l._id === lessonId) || selectedLesson.value
    const syntheticBooking = { _id: lessonId, bookingStatus: 'Pending Payment', paymentStatus: 'Pending', lesson: lessonObj }
    router.push({ path: `/dashboard/customer/lesson-payment/${lessonId}`, state: { booking: syntheticBooking } })
  } catch (err: any) {
    alert(err.message || 'Failed to book lesson. Please try again.')
  } finally {
    bookingInProgress.value = null
  }
}

const handleViewDetails = async (lessonId: string) => {
  loadingDetail.value = true; showDetailModal.value = true
  try {
    const response = await fetch(`http://localhost:5000/api/lessons/${lessonId}`)
    if (response.ok) { const data = await response.json(); selectedLesson.value = data.lesson }
  } catch (error) {
    console.error('Failed to fetch lesson details:', error)
  } finally {
    loadingDetail.value = false }
}

const closeDetailModal = () => { showDetailModal.value = false; selectedLesson.value = null }

onMounted(() => { fetchLessons() })
</script>

<template>
  <div class="pl-section">
    <div class="pl-header">
      <h3 class="pl-title">Popular Lessons</h3>
      <p class="pl-sub">Explore our most popular lessons and start learning from expert tutors today.</p>
    </div>

    <div v-if="loading" class="pl-state">
      <div class="pl-spinner" />
      <p>Loading lessons...</p>
    </div>

    <div v-else-if="lessons.length === 0" class="pl-empty">
      <p>No lessons available at the moment.</p>
    </div>

    <div v-else class="pl-grid">
      <div v-for="lesson in lessons" :key="lesson._id" class="pl-card">
        <div class="pl-card-top">
          <div class="pl-card-info">
            <h4 class="pl-lesson-title">{{ lesson.title }}</h4>
            <p class="pl-instrument">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              {{ lesson.instrument }}
            </p>
          </div>
          <span class="pl-level-tag" :class="getLevelClass(lesson.level)">{{ lesson.level }}</span>
        </div>

        <div class="pl-tutor-row">
          <div class="pl-tutor-avatar">{{ lesson.tutor.name.charAt(0) }}</div>
          <div class="pl-tutor-info">
            <p class="pl-tutor-name">{{ lesson.tutor.name }}</p>
            <p class="pl-tutor-meta">{{ lesson.duration }} min session</p>
          </div>
        </div>

        <div class="pl-stats">
          <div class="pl-enrolled">
            <span class="pl-enrolled-num">{{ lesson.enrolledStudents.length }}</span>
            <span class="pl-enrolled-denom">/ {{ lesson.maxStudents }} enrolled</span>
          </div>
          <div class="pl-price-block">
            <div class="pl-price-lbl">Starting at</div>
            <div class="pl-price-val">Rs {{ lesson.price }}</div>
          </div>
        </div>

        <div class="pl-card-btns">
          <button @click="handleViewDetails(lesson._id)" class="pl-btn-outline">View Details</button>
          <button
            @click="handleBookLesson(lesson._id)"
            :disabled="bookingInProgress === lesson._id"
            class="pl-btn-primary"
          >
            {{ bookingInProgress === lesson._id ? 'Booking...' : 'Book Lesson' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="pl-overlay" @click.self="closeDetailModal">
        <div class="pl-modal">
          <div class="pl-modal-hdr">
            <h3 class="pl-modal-title">Lesson Details</h3>
            <button @click="closeDetailModal" class="pl-modal-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div v-if="loadingDetail" class="pl-modal-loading"><div class="pl-spinner" /></div>

          <div v-else-if="selectedLesson" class="pl-modal-body">
            <div class="pl-modal-top">
              <div class="pl-modal-lesson-info">
                <h4 class="pl-modal-lesson-title">{{ selectedLesson.title }}</h4>
                <div class="pl-modal-tags">
                  <span class="pl-modal-tag pl-tag-teal">{{ selectedLesson.instrument }}</span>
                  <span class="pl-level-tag" :class="getLevelClass(selectedLesson.level)">{{ selectedLesson.level }}</span>
                  <span class="pl-modal-tag pl-tag-mist">{{ selectedLesson.isOnline ? 'Online' : 'In-Person' }}</span>
                </div>
              </div>
              <div class="pl-modal-price-block">
                <p class="pl-modal-price">Rs {{ selectedLesson.price }}</p>
                <p class="pl-modal-price-lbl">per lesson</p>
              </div>
            </div>

            <p class="pl-modal-desc">{{ selectedLesson.description }}</p>

            <div class="pl-modal-tutor-box">
              <h5 class="pl-modal-section-title">Your Instructor</h5>
              <div class="pl-modal-tutor-row">
                <div class="pl-modal-tutor-avatar">{{ selectedLesson.tutor.name.charAt(0) }}</div>
                <div>
                  <p class="pl-modal-tutor-name">{{ selectedLesson.tutor.name }}</p>
                  <p class="pl-modal-tutor-spec">
                    {{ selectedLesson.tutor.specialization || 'Music Instructor' }}
                    <span v-if="selectedLesson.tutor.experience"> · {{ selectedLesson.tutor.experience }}+ years</span>
                  </p>
                </div>
              </div>
            </div>

            <div class="pl-modal-info-grid">
              <div class="pl-modal-info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--mm-teal);flex-shrink:0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div>
                  <p class="pl-info-lbl">Duration</p>
                  <p class="pl-info-val">{{ selectedLesson.duration }} minutes</p>
                </div>
              </div>
              <div class="pl-modal-info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--mm-teal);flex-shrink:0;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                <div>
                  <p class="pl-info-lbl">Availability</p>
                  <p class="pl-info-val">{{ selectedLesson.enrolledStudents.length }} / {{ selectedLesson.maxStudents }}</p>
                </div>
              </div>
              <div v-if="!selectedLesson.isOnline && selectedLesson.location" class="pl-modal-info-box pl-info-full">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--mm-teal);flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div>
                  <p class="pl-info-lbl">Location</p>
                  <p class="pl-info-val">{{ selectedLesson.location }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedLesson.availableDays?.length" class="pl-modal-chips-section">
              <h5 class="pl-modal-section-title">Available Days</h5>
              <div class="pl-chips">
                <span v-for="day in selectedLesson.availableDays" :key="day" class="pl-chip">{{ day }}</span>
              </div>
            </div>

            <div v-if="selectedLesson.availableTimeSlots?.length" class="pl-modal-chips-section">
              <h5 class="pl-modal-section-title">Available Time Slots</h5>
              <div class="pl-chips">
                <span v-for="slot in selectedLesson.availableTimeSlots" :key="slot" class="pl-chip">{{ slot }}</span>
              </div>
            </div>

            <button
              @click="handleBookLesson(selectedLesson._id)"
              :disabled="bookingInProgress === selectedLesson._id"
              class="pl-btn-primary pl-btn-full"
            >
              {{ bookingInProgress === selectedLesson._id ? 'Booking...' : 'Book This Lesson Now' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pl-section { padding: 3rem 0; }
.pl-header { margin-bottom: 2rem; }
.pl-title { font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.625rem; letter-spacing: -0.02em; }
.pl-sub { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; max-width: 40rem; line-height: 1.6; font-family: 'DM Sans', sans-serif; }

.pl-state { display: flex; flex-direction: column; align-items: center; padding: 3rem 1rem; gap: 0.75rem; }
.pl-state p { color: var(--mm-sand); font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
.pl-spinner { width: 36px; height: 36px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-gold); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.pl-empty { padding: 3rem; text-align: center; background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; }
.pl-empty p { color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }

.pl-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }

.pl-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0; transition: all 0.2s; }
.pl-card:hover { border-color: rgba(212,168,83,0.3); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }

.pl-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.875rem; }
.pl-card-info { flex: 1; min-width: 0; }
.pl-lesson-title { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.375rem; line-height: 1.3; }
.pl-instrument { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--mm-teal); font-weight: 600; margin: 0; font-family: 'DM Sans', sans-serif; }
.pl-level-tag { display: inline-flex; align-items: center; padding: 0.2rem 0.5rem; border-radius: 0.375rem; font-size: 0.6875rem; font-weight: 700; flex-shrink: 0; font-family: 'DM Sans', sans-serif; border: 1px solid; }
.tag-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border-color: rgba(56,168,130,0.25); }
.tag-amber   { background: rgba(245,158,11,0.12);  color: #F59E0B; border-color: rgba(245,158,11,0.25); }
.tag-coral   { background: rgba(224,112,96,0.12);  color: var(--mm-coral); border-color: rgba(224,112,96,0.25); }
.tag-mist    { background: var(--mm-mist); color: var(--mm-stone); border-color: var(--mm-warm-line); }

.pl-tutor-row { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem 0; border-top: 1px solid var(--mm-warm-line); border-bottom: 1px solid var(--mm-warm-line); margin-bottom: 0.75rem; }
.pl-tutor-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); font-size: 0.8125rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pl-tutor-name { font-size: 0.8125rem; font-weight: 600; color: var(--mm-ivory); margin: 0; font-family: 'DM Sans', sans-serif; }
.pl-tutor-meta { font-size: 0.6875rem; color: var(--mm-stone); margin: 0; font-family: 'DM Sans', sans-serif; }

.pl-stats { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }
.pl-enrolled-num { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); }
.pl-enrolled-denom { font-size: 0.75rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }
.pl-price-block { text-align: right; }
.pl-price-lbl { font-size: 0.6875rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }
.pl-price-val { font-family: 'DM Serif Display', serif; font-size: 1.25rem; font-weight: 400; color: var(--mm-gold); }

.pl-card-btns { display: flex; flex-direction: column; gap: 0.5rem; }
.pl-btn-outline { width: 100%; padding: 0.5625rem; background: transparent; border: 1px solid rgba(42,157,159,0.35); color: var(--mm-teal); border-radius: 0.625rem; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.pl-btn-outline:hover { background: rgba(42,157,159,0.08); }
.pl-btn-primary { width: 100%; padding: 0.5625rem; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.8125rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.pl-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(212,168,83,0.3); }
.pl-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.pl-btn-full { width: 100%; padding: 0.875rem; border-radius: 0.75rem; font-size: 0.9375rem; margin-top: 0.25rem; }

/* Modal */
.pl-overlay { position: fixed; inset: 0; background: rgba(9,8,12,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.25rem; backdrop-filter: blur(4px); }
.pl-modal { background: var(--mm-carbon); border: 1px solid var(--mm-warm-line); border-radius: 1.25rem; max-width: 760px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.7); }
.pl-modal-hdr { position: sticky; top: 0; background: var(--mm-carbon); border-bottom: 1px solid var(--mm-warm-line); padding: 1.125rem 1.5rem; display: flex; align-items: center; justify-content: space-between; z-index: 1; }
.pl-modal-title { font-size: 1.125rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.pl-modal-close { background: none; border: none; color: var(--mm-stone); cursor: pointer; padding: 0.25rem; border-radius: 0.375rem; display: flex; align-items: center; transition: all 0.2s; }
.pl-modal-close:hover { background: var(--mm-mist); color: var(--mm-ivory); }
.pl-modal-loading { display: flex; justify-content: center; padding: 3rem; }
.pl-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

.pl-modal-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.pl-modal-lesson-title { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.625rem; letter-spacing: -0.01em; }
.pl-modal-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.pl-modal-tag { display: inline-flex; align-items: center; padding: 0.2rem 0.625rem; border-radius: 2rem; font-size: 0.6875rem; font-weight: 700; border: 1px solid; font-family: 'DM Sans', sans-serif; }
.pl-tag-teal { background: rgba(42,157,159,0.12); color: var(--mm-teal); border-color: rgba(42,157,159,0.25); }
.pl-tag-mist { background: var(--mm-mist); color: var(--mm-sand); border-color: var(--mm-warm-line); }
.pl-modal-price-block { text-align: right; flex-shrink: 0; }
.pl-modal-price { font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; color: var(--mm-gold); margin: 0; }
.pl-modal-price-lbl { font-size: 0.75rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; margin: 0; }
.pl-modal-desc { font-size: 0.875rem; color: var(--mm-sand); line-height: 1.65; margin: 0; font-family: 'DM Sans', sans-serif; }

.pl-modal-tutor-box { background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.75rem; padding: 1rem; }
.pl-modal-section-title { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 0.75rem; font-family: 'DM Sans', sans-serif; }
.pl-modal-tutor-row { display: flex; align-items: center; gap: 0.75rem; }
.pl-modal-tutor-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); font-size: 1.125rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pl-modal-tutor-name { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.pl-modal-tutor-spec { font-size: 0.8125rem; color: var(--mm-sand); margin: 0; font-family: 'DM Sans', sans-serif; }

.pl-modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.pl-modal-info-box { display: flex; align-items: center; gap: 0.75rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.75rem; padding: 0.875rem; }
.pl-info-full { grid-column: 1 / -1; }
.pl-info-lbl { font-size: 0.6875rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; margin: 0; }
.pl-info-val { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0; font-family: 'DM Sans', sans-serif; }

.pl-modal-chips-section { display: flex; flex-direction: column; gap: 0.5rem; }
.pl-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.pl-chip { padding: 0.25rem 0.75rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); color: var(--mm-sand); border-radius: 0.375rem; font-size: 0.8125rem; font-weight: 600; font-family: 'DM Sans', sans-serif; }

@media (max-width: 1024px) { .pl-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .pl-grid { grid-template-columns: 1fr; } .pl-modal-top { flex-direction: column; } .pl-modal-info-grid { grid-template-columns: 1fr; } }
</style>
