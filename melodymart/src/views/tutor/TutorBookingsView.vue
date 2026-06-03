<template>
  <div class="page">
    <div class="page-header">
      <div><h1 class="page-title">Lesson Bookings</h1><p class="page-subtitle">Students who have enrolled in your lessons.</p></div>
    </div>

    <!-- Filters -->
    <div class="filter-bar" v-if="bookings.length > 0 || searchQuery || selectedStatus">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Search by student or lesson..." class="search-input" />
        <span class="search-icon">🔍</span>
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

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading bookings...</p></div>
    <div v-else-if="error" class="error-state"><span>⚠️</span><p>{{ error }}</p><button @click="fetchBookings" class="retry-btn">Retry</button></div>

    <div v-else-if="filteredBookings.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>{{ bookings.length === 0 ? 'No bookings yet' : 'No results found' }}</h3>
      <p>{{ bookings.length === 0 ? 'When students book your lessons, they\'ll appear here.' : 'Try adjusting your search or filters.' }}</p>
    </div>

    <div v-else>
      <!-- Desktop Table -->
      <div class="desktop-view">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Lesson</th>
                <th>Booking Date</th>
                <th>Available Days</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Fee</th>
                <th>Actions</th>
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
                  <button @click="openDetail(b)" class="btn-details" title="View Details">👁️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
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
            <div class="cd-item"><span class="cd-label">📖 Lesson</span><span class="cd-value">{{ b.lesson?.title || '—' }}</span></div>
            <div class="cd-item"><span class="cd-label">📅 Booked</span><span class="cd-value">{{ formatDate(b.createdAt) }}</span></div>
            <div class="cd-item"><span class="cd-label">🗓️ Days</span><span class="cd-value">{{ (b.lesson?.availableDays || []).join(', ') || '—' }}</span></div>
            <div class="cd-item"><span class="cd-label">💰 Fee</span><span class="cd-value fee">{{ b.lesson?.price ? 'Rs ' + b.lesson.price : '—' }}</span></div>
          </div>
          <div class="card-bottom">
            <span class="badge" :class="statusBadge(b.bookingStatus)">{{ b.bookingStatus }}</span>
            <button @click="openDetail(b)" class="btn-view">👁️ View Details</button>
          </div>
        </div>
      </div>

      <div class="results-footer">Showing {{ filteredBookings.length }} of {{ bookings.length }} booking(s)</div>
    </div>

    <!-- Detail Modal -->
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
    const data = await res.json()
    bookings.value = data.bookings || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const filteredBookings = computed(() => {
  let list = bookings.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(b => b.student?.name?.toLowerCase().includes(q) || b.lesson?.title?.toLowerCase().includes(q))
  }
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
.page { max-width: 1300px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 30px; font-weight: 800; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.5px; }
.page-subtitle { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; }

.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 200px; position: relative; }
.search-input { width: 100%; padding: 10px 14px 10px 38px; border: 1.5px solid rgba(151,84,203,0.2); border-radius: 8px; font-size: 13px; color: #1b1030; background: white; outline: none; }
.search-input:focus { border-color: #9754CB; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; }
.filter-select { padding: 10px 12px; border: 1.5px solid rgba(151,84,203,0.2); border-radius: 8px; font-size: 13px; color: #1b1030; background: white; cursor: pointer; min-width: 130px; outline: none; }
.filter-select:focus { border-color: #9754CB; }

.loading-state,.error-state,.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.spinner { width: 44px; height: 44px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p,.error-state p,.empty-state p { color: rgba(255,255,255,0.65); font-size: 14px; margin: 0; }
.empty-icon { font-size: 48px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0; }
.retry-btn { padding: 9px 20px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.table-wrap { overflow-x: auto; border-radius: 12px; border: 2px solid #9754CB; background: white; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table thead { background: linear-gradient(90deg,#9754CB,#DEACF5); }
.table th { padding: 13px 14px; color: white; font-weight: 700; text-align: left; font-size: 11px; text-transform: uppercase; white-space: nowrap; }
.table-row { border-bottom: 1px solid #E5D9F0; }
.table-row:hover { background: #F8F4FF; }
.table td { padding: 13px 14px; color: #28104E; vertical-align: middle; }

.student-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg,#9754CB,#DEACF5); color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar.lg { width: 48px; height: 48px; font-size: 16px; }
.student-name { font-weight: 700; color: #ffffff; font-size: 13px; }
.student-name.lg { font-size: 16px; }
.student-email { font-size: 11px; color: rgba(255,255,255,0.55); }
.lesson-cell { font-weight: 600; }
.date-cell,.days-cell { font-size: 12px; color: rgba(255,255,255,0.65); white-space: nowrap; }
.fee-cell { font-weight: 700; color: #9754CB; }

.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.badge-green { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
.badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

.btn-details { width: 32px; height: 32px; background: linear-gradient(90deg,#9754CB,#DEACF5); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.btn-details:hover { transform: translateY(-1px); }

/* Mobile cards */
.booking-card { background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 16px; margin-bottom: 14px; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; gap: 8px; }
.card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.cd-item { display: flex; flex-direction: column; gap: 3px; }
.cd-label { font-size: 10px; font-weight: 700; color: #9754CB; text-transform: uppercase; }
.cd-value { font-size: 12px; font-weight: 600; color: #ffffff; }
.cd-value.fee { color: #9754CB; }
.card-bottom { display: flex; justify-content: space-between; align-items: center; }
.btn-view { padding: 7px 14px; background: linear-gradient(90deg,#9754CB,#DEACF5); color: white; border: none; border-radius: 7px; font-size: 12px; font-weight: 700; cursor: pointer; }

.results-footer { text-align: center; color: rgba(255,255,255,0.7); font-size: 13px; padding: 16px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-box { background: white; border-radius: 16px; max-width: 520px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(151,84,203,0.1); }
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; }
.modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: rgba(255,255,255,0.5); padding: 4px 8px; border-radius: 6px; }
.modal-close:hover { background: rgba(151,84,203,0.08); }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.detail-student { display: flex; align-items: center; gap: 14px; padding-bottom: 16px; border-bottom: 1px solid rgba(151,84,203,0.1); }
.detail-grid { display: flex; flex-direction: column; gap: 8px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; background: rgba(151,84,203,0.03); border-radius: 8px; }
.dk { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55); }
.dv { font-size: 13px; font-weight: 700; color: #ffffff; }
.dv.fee { color: #9754CB; }
.modal-footer { padding: 16px 24px; border-top: 1px solid rgba(151,84,203,0.1); display: flex; justify-content: flex-end; }
.btn-close { padding: 9px 20px; background: rgba(151,84,203,0.08); color: #6237A0; border: 1px solid rgba(151,84,203,0.2); border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }

.desktop-view { display: block; }
.mobile-view { display: none; }
@media (max-width: 768px) { .desktop-view { display: none; } .mobile-view { display: block; } .page-title { font-size: 22px; } .filter-bar { flex-direction: column; } .filter-select { width: 100%; } }
</style>
