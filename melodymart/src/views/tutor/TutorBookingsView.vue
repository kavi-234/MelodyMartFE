<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Lesson Bookings</h1>
        <p class="page-subtitle">Students who have enrolled in your lessons.</p>
      </div>
    </div>

    <div class="filter-bar" v-if="bookings.length > 0 || searchQuery || selectedStatus">
      <div class="search-box">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Search by student or lesson..." class="search-input" />
      </div>
      <select v-model="selectedStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="Pending Payment" style="color:#111827;background:#fff;">Pending Payment</option>
        <option value="Confirmed" style="color:#111827;background:#fff;">Confirmed</option>
        <option value="Completed" style="color:#111827;background:#fff;">Completed</option>
        <option value="Cancelled" style="color:#111827;background:#fff;">Cancelled</option>
      </select>
      <select v-model="selectedPayment" class="filter-select">
        <option value="">All Payments</option>
        <option value="Pending" style="color:#111827;background:#fff;">Pending</option>
        <option value="Paid" style="color:#111827;background:#fff;">Paid</option>
      </select>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading bookings...</p></div>
    <div v-else-if="error" class="state-box"><span>⚠</span><p>{{ error }}</p><button @click="fetchBookings" class="retry-btn">Retry</button></div>

    <div v-else-if="filteredBookings.length === 0" class="state-box">
      <div style="font-size:2.5rem">📋</div>
      <h3 class="empty-title">{{ bookings.length === 0 ? 'No bookings yet' : 'No results found' }}</h3>
      <p class="empty-sub">{{ bookings.length === 0 ? "When students book your lessons, they'll appear here." : 'Try adjusting your search or filters.' }}</p>
    </div>

    <div v-else>
      <div class="desktop-view">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Student</th><th>Lesson</th><th>Booking Date</th>
                <th>Available Days</th><th>Payment</th><th>Status</th><th>Fee</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in filteredBookings" :key="b._id" class="table-row">
                <td>
                  <div class="student-cell">
                    <div class="avatar">{{ getInitials(b.student?.name) }}</div>
                    <div><div class="student-name">{{ b.student?.name || 'Unknown' }}</div><div class="student-email">{{ b.student?.email || '' }}</div></div>
                  </div>
                </td>
                <td class="lesson-cell">{{ b.lesson?.title || '—' }}</td>
                <td class="date-cell">{{ formatDate(b.createdAt) }}</td>
                <td class="days-cell">{{ (b.lesson?.availableDays || []).join(', ') || '—' }}</td>
                <td><span class="badge" :class="payBadge(b.paymentStatus)">{{ b.paymentStatus }}</span></td>
                <td><span class="badge" :class="statusBadge(b.bookingStatus)">{{ b.bookingStatus }}</span></td>
                <td class="fee-cell">{{ b.lesson?.price ? 'Rs ' + b.lesson.price : '—' }}</td>
                <td>
                  <button @click="openDetail(b)" class="btn-details" title="View Details">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mobile-view">
        <div v-for="b in filteredBookings" :key="b._id" class="booking-card">
          <div class="card-top">
            <div class="student-cell">
              <div class="avatar">{{ getInitials(b.student?.name) }}</div>
              <div><div class="student-name">{{ b.student?.name || 'Unknown' }}</div><div class="student-email">{{ b.student?.email || '' }}</div></div>
            </div>
            <span class="badge" :class="payBadge(b.paymentStatus)">{{ b.paymentStatus }}</span>
          </div>
          <div class="card-details">
            <div class="cd-item"><span class="cd-label">Lesson</span><span class="cd-value">{{ b.lesson?.title || '—' }}</span></div>
            <div class="cd-item"><span class="cd-label">Booked</span><span class="cd-value">{{ formatDate(b.createdAt) }}</span></div>
            <div class="cd-item"><span class="cd-label">Days</span><span class="cd-value">{{ (b.lesson?.availableDays || []).join(', ') || '—' }}</span></div>
            <div class="cd-item"><span class="cd-label">Fee</span><span class="cd-value fee">{{ b.lesson?.price ? 'Rs ' + b.lesson.price : '—' }}</span></div>
          </div>
          <div class="card-bottom">
            <span class="badge" :class="statusBadge(b.bookingStatus)">{{ b.bookingStatus }}</span>
            <button @click="openDetail(b)" class="btn-view">View Details</button>
          </div>
        </div>
      </div>

      <div class="results-footer">Showing {{ filteredBookings.length }} of {{ bookings.length }} booking(s)</div>
    </div>

    <Teleport to="body">
      <div v-if="showDetail && selectedBooking" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Booking Details</h2>
            <button @click="closeDetail" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-student">
              <div class="avatar lg">{{ getInitials(selectedBooking.student?.name) }}</div>
              <div>
                <div class="student-name lg">{{ selectedBooking.student?.name }}</div>
                <div class="student-email">{{ selectedBooking.student?.email }}</div>
              </div>
            </div>
            <div class="detail-grid">
              <div class="detail-row"><span class="dk">Lesson</span><span class="dv">{{ selectedBooking.lesson?.title }}</span></div>
              <div class="detail-row"><span class="dk">Booking Date</span><span class="dv">{{ formatDate(selectedBooking.createdAt) }}</span></div>
              <div class="detail-row"><span class="dk">Available Days</span><span class="dv">{{ (selectedBooking.lesson?.availableDays || []).join(', ') || '—' }}</span></div>
              <div class="detail-row"><span class="dk">Time Slots</span><span class="dv">{{ (selectedBooking.lesson?.availableTimeSlots || []).join(', ') || '—' }}</span></div>
              <div class="detail-row"><span class="dk">Payment Status</span><span class="badge" :class="payBadge(selectedBooking.paymentStatus)">{{ selectedBooking.paymentStatus }}</span></div>
              <div class="detail-row"><span class="dk">Booking Status</span><span class="badge" :class="statusBadge(selectedBooking.bookingStatus)">{{ selectedBooking.bookingStatus }}</span></div>
              <div class="detail-row"><span class="dk">Lesson Fee</span><span class="dv fee">{{ selectedBooking.lesson?.price ? 'Rs ' + selectedBooking.lesson.price : '—' }}</span></div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDetail" class="btn-close">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const bookings = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedPayment = ref('')
const showDetail = ref(false)
const selectedBooking = ref<any>(null)

const fetchBookings = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/tutors/dashboard/bookings', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to load bookings')
    const data = await res.json(); bookings.value = data.bookings || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const filteredBookings = computed(() => {
  let list = bookings.value
  if (searchQuery.value) { const q = searchQuery.value.toLowerCase(); list = list.filter(b => b.student?.name?.toLowerCase().includes(q) || b.lesson?.title?.toLowerCase().includes(q)) }
  if (selectedStatus.value) list = list.filter(b => b.bookingStatus === selectedStatus.value)
  if (selectedPayment.value) list = list.filter(b => b.paymentStatus === selectedPayment.value)
  return list
})

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const payBadge = (s: string) => ({ 'badge-green': s === 'Paid', 'badge-amber': s === 'Pending', 'badge-red': s === 'Failed' })
const statusBadge = (s: string) => ({ 'badge-green': s === 'Confirmed' || s === 'Completed', 'badge-amber': s === 'Pending Payment', 'badge-red': s === 'Cancelled' })
const openDetail = (b: any) => { selectedBooking.value = b; showDetail.value = true }
const closeDetail = () => { showDetail.value = false; selectedBooking.value = null }
onMounted(fetchBookings)
</script>

<style scoped>
.page { max-width: 1300px; padding: 1.75rem 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 200px; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 0.75rem; color: var(--mm-stone); pointer-events: none; }
.search-input { width: 100%; padding: 0.625rem 0.875rem 0.625rem 2.25rem; background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; font-size: 0.8125rem; color: var(--mm-ivory); outline: none; font-family: 'DM Sans', sans-serif; }
.search-input::placeholder { color: var(--mm-stone); }
.search-input:focus { border-color: var(--mm-gold); }
.filter-select { padding: 0.625rem 0.75rem; background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; font-size: 0.8125rem; color: var(--mm-ivory); cursor: pointer; min-width: 130px; outline: none; font-family: 'DM Sans', sans-serif; }
.filter-select:focus { border-color: var(--mm-gold); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3.75rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-gold); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.empty-title { font-size: 1.25rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.empty-sub { color: var(--mm-sand); margin: 0; font-size: 0.875rem; }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }

.table-wrap { overflow-x: auto; border-radius: 0.75rem; border: 1px solid var(--mm-warm-line); background: var(--mm-onyx); }
.table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.table thead { background: rgba(212,168,83,0.06); border-bottom: 1px solid var(--mm-warm-line); }
.table th { padding: 0.8125rem 0.875rem; color: var(--mm-gold); font-weight: 700; text-align: left; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.table-row { border-bottom: 1px solid var(--mm-warm-line); }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(212,168,83,0.03); }
.table td { padding: 0.8125rem 0.875rem; color: var(--mm-ivory); vertical-align: middle; }

.student-cell { display: flex; align-items: center; gap: 0.625rem; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); font-size: 0.6875rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar.lg { width: 46px; height: 46px; font-size: 0.9375rem; }
.student-name { font-weight: 700; color: var(--mm-ivory); font-size: 0.8125rem; }
.student-name.lg { font-size: 1rem; }
.student-email { font-size: 0.6875rem; color: var(--mm-stone); }
.lesson-cell { font-weight: 600; color: var(--mm-cream); }
.date-cell, .days-cell { font-size: 0.75rem; color: var(--mm-sand); white-space: nowrap; }
.fee-cell { font-weight: 700; color: var(--mm-gold); }

.badge { display: inline-flex; align-items: center; padding: 0.1875rem 0.5625rem; border-radius: 20px; font-size: 0.6875rem; font-weight: 700; white-space: nowrap; }
.badge-green { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.badge-amber { background: rgba(212,168,83,0.12); color: var(--mm-gold); border: 1px solid rgba(212,168,83,0.25); }
.badge-red   { background: rgba(224,112,96,0.12); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.25); }

.btn-details { width: 30px; height: 30px; background: rgba(212,168,83,0.08); color: var(--mm-gold); border: 1px solid rgba(212,168,83,0.15); border-radius: 0.375rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-details:hover { background: rgba(212,168,83,0.15); transform: translateY(-1px); }

.booking-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1rem; margin-bottom: 0.875rem; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.875rem; gap: 0.5rem; }
.card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; margin-bottom: 0.875rem; }
.cd-item { display: flex; flex-direction: column; gap: 0.1875rem; }
.cd-label { font-size: 0.625rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; }
.cd-value { font-size: 0.75rem; font-weight: 600; color: var(--mm-ivory); }
.cd-value.fee { color: var(--mm-gold); }
.card-bottom { display: flex; justify-content: space-between; align-items: center; }
.btn-view { padding: 0.4375rem 0.875rem; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); border: none; border-radius: 0.4375rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.results-footer { text-align: center; color: var(--mm-sand); font-size: 0.8125rem; padding: 1rem; }

.modal-overlay { position: fixed; inset: 0; background: rgba(9,8,12,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.25rem; backdrop-filter: blur(4px); }
.modal-box { background: var(--mm-carbon); border: 1px solid var(--mm-warm-line); border-radius: 1rem; max-width: 520px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.6); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--mm-warm-line); }
.modal-header h2 { margin: 0; font-size: 1.0625rem; font-weight: 700; color: var(--mm-ivory); }
.modal-close { background: none; border: none; font-size: 0.9375rem; cursor: pointer; color: var(--mm-stone); padding: 0.25rem 0.5rem; border-radius: 0.375rem; transition: all 0.2s; }
.modal-close:hover { background: var(--mm-mist); color: var(--mm-ivory); }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }
.detail-student { display: flex; align-items: center; gap: 0.875rem; padding-bottom: 1rem; border-bottom: 1px solid var(--mm-warm-line); }
.detail-grid { display: flex; flex-direction: column; gap: 0.5rem; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5625rem 0.75rem; background: rgba(212,168,83,0.04); border-radius: 0.5rem; }
.dk { font-size: 0.75rem; font-weight: 600; color: var(--mm-stone); }
.dv { font-size: 0.8125rem; font-weight: 700; color: var(--mm-ivory); }
.dv.fee { color: var(--mm-gold); }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--mm-warm-line); display: flex; justify-content: flex-end; }
.btn-close { padding: 0.5625rem 1.25rem; background: var(--mm-mist); color: var(--mm-sand); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; font-weight: 600; font-size: 0.8125rem; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.btn-close:hover { color: var(--mm-ivory); border-color: var(--mm-stone); }

.desktop-view { display: block; }
.mobile-view { display: none; }
@media (max-width: 768px) { .desktop-view { display: none; } .mobile-view { display: block; } .page { padding: 1.25rem; } .filter-bar { flex-direction: column; } .filter-select { width: 100%; } }
</style>
