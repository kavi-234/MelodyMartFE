<template>
  <div class="services-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Requested Services</h1>
        <p class="page-subtitle">Track and manage your repair service requests.</p>
      </div>
      <button class="browse-btn" @click="router.push('/#repairs')">+ Request Service</button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar" v-if="requests.length > 0 || selectedStatus">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Search by specialist or service type..." class="search-input" />
        <span class="search-icon">🔍</span>
      </div>
      <select v-model="selectedStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Loading -->
    <div class="loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>Loading your service requests...</p>
    </div>

    <!-- Error -->
    <div class="error-state" v-else-if="error">
      <span class="error-icon">⚠️</span>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchRequests">Try Again</button>
    </div>

    <!-- Empty -->
    <div class="empty-state" v-else-if="filteredRequests.length === 0">
      <div class="empty-icon">🔧</div>
      <h3>{{ requests.length === 0 ? 'No service requests yet' : 'No results found' }}</h3>
      <p>{{ requests.length === 0 ? 'Request a repair service from our verified specialists.' : 'Try adjusting your search or filter.' }}</p>
      <button v-if="requests.length === 0" class="browse-btn-large" @click="router.push('/#repairs')">Browse Specialists</button>
    </div>

    <!-- Content -->
    <div v-else class="content">
      <!-- Desktop Table -->
      <div class="desktop-view">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Specialist</th>
                <th>Service Type</th>
                <th>Request Date</th>
                <th>Preferred Date</th>
                <th>Status</th>
                <th>Service Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in filteredRequests" :key="req._id" class="table-row">
                <td>
                  <div class="specialist-cell">
                    <div class="specialist-avatar" :style="{ background: 'linear-gradient(135deg,#9754CB,#DEACF5)' }">
                      <img v-if="req.specialist?.avatar" :src="req.specialist.avatar" :alt="req.specialist.name" class="avatar-img" @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
                      <span v-else>{{ getInitials(req.specialist?.name || '?') }}</span>
                    </div>
                    <div>
                      <div class="specialist-name">{{ req.specialist?.name || 'Unknown' }}</div>
                      <div class="specialist-spec">{{ req.specialist?.specialization || 'Repair' }}</div>
                    </div>
                  </div>
                </td>
                <td class="service-type">{{ req.serviceType }}</td>
                <td class="date-cell">{{ formatDate(req.createdAt) }}</td>
                <td class="date-cell">{{ req.preferredDate ? formatDate(req.preferredDate) : '—' }}</td>
                <td><span class="status-badge" :class="statusClass(req.status)">{{ req.status }}</span></td>
                <td class="fee-cell">{{ req.serviceFee ? `Rs ${req.serviceFee}` : '—' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-details" @click="openDetail(req)" title="View Details">👁️</button>
                    <button v-if="canCancel(req.status)" class="btn-cancel" @click="confirmCancel(req)" title="Cancel">✕</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="mobile-view">
        <div v-for="req in filteredRequests" :key="req._id" class="service-card">
          <div class="card-header-row">
            <div class="specialist-cell">
              <div class="specialist-avatar">
                <img v-if="req.specialist?.avatar" :src="req.specialist.avatar" :alt="req.specialist.name" class="avatar-img" @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
                <span v-else>{{ getInitials(req.specialist?.name || '?') }}</span>
              </div>
              <div>
                <div class="specialist-name">{{ req.specialist?.name || 'Unknown' }}</div>
                <div class="specialist-spec">{{ req.specialist?.specialization || 'Repair' }}</div>
              </div>
            </div>
            <span class="status-badge" :class="statusClass(req.status)">{{ req.status }}</span>
          </div>

          <div class="card-details">
            <div class="card-detail-item">
              <span class="detail-label">🔧 Service</span>
              <span class="detail-value">{{ req.serviceType }}</span>
            </div>
            <div class="card-detail-item">
              <span class="detail-label">📅 Requested</span>
              <span class="detail-value">{{ formatDate(req.createdAt) }}</span>
            </div>
            <div class="card-detail-item" v-if="req.preferredDate">
              <span class="detail-label">🗓️ Preferred</span>
              <span class="detail-value">{{ formatDate(req.preferredDate) }}</span>
            </div>
            <div class="card-detail-item" v-if="req.serviceFee">
              <span class="detail-label">💰 Fee</span>
              <span class="detail-value fee">Rs {{ req.serviceFee }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="card-btn-details" @click="openDetail(req)">👁️ View Details</button>
            <button v-if="canCancel(req.status)" class="card-btn-cancel" @click="confirmCancel(req)">✕ Cancel</button>
          </div>
        </div>
      </div>

      <div class="results-footer">Showing {{ filteredRequests.length }} of {{ requests.length }} request(s)</div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetail && selectedRequest" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Service Request Details</h2>
            <button @click="closeDetail" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-specialist">
              <div class="specialist-avatar lg">
                <img v-if="selectedRequest.specialist?.avatar" :src="selectedRequest.specialist.avatar" class="avatar-img" @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
                <span v-else>{{ getInitials(selectedRequest.specialist?.name || '?') }}</span>
              </div>
              <div>
                <div class="text-lg font-bold text-slate-900">{{ selectedRequest.specialist?.name }}</div>
                <div class="text-sm text-purple-600 font-medium">{{ selectedRequest.specialist?.specialization || 'Instrument Repair' }}</div>
                <div v-if="selectedRequest.specialist?.hourlyRate" class="text-xs text-slate-500 mt-0.5">Rs {{ selectedRequest.specialist.hourlyRate }}/hr</div>
              </div>
              <span class="status-badge ml-auto" :class="statusClass(selectedRequest.status)">{{ selectedRequest.status }}</span>
            </div>

            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-key">Service Type</span>
                <span class="detail-val">{{ selectedRequest.serviceType }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-key">Request Date</span>
                <span class="detail-val">{{ formatDate(selectedRequest.createdAt) }}</span>
              </div>
              <div class="detail-row" v-if="selectedRequest.preferredDate">
                <span class="detail-key">Preferred Date</span>
                <span class="detail-val">{{ formatDate(selectedRequest.preferredDate) }}</span>
              </div>
              <div class="detail-row" v-if="selectedRequest.serviceFee">
                <span class="detail-key">Service Fee</span>
                <span class="detail-val fee">Rs {{ selectedRequest.serviceFee }}</span>
              </div>
              <div class="detail-row" v-if="selectedRequest.specialist?.phone">
                <span class="detail-key">Specialist Phone</span>
                <span class="detail-val">{{ selectedRequest.specialist.phone }}</span>
              </div>
              <div class="detail-row" v-if="selectedRequest.specialist?.email">
                <span class="detail-key">Specialist Email</span>
                <span class="detail-val">{{ selectedRequest.specialist.email }}</span>
              </div>
            </div>

            <div v-if="selectedRequest.description" class="detail-description">
              <div class="detail-key mb-1">Description</div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ selectedRequest.description }}</p>
            </div>

            <div v-if="selectedRequest.notes" class="detail-notes">
              <div class="detail-key mb-1">Specialist Notes</div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ selectedRequest.notes }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="canCancel(selectedRequest.status)" class="btn-modal-cancel" @click="confirmCancel(selectedRequest); closeDetail()">Cancel Request</button>
            <button class="btn-modal-close" @click="closeDetail">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Specialist {
  _id: string
  name: string
  email?: string
  phone?: string
  specialization?: string
  hourlyRate?: number
  avatar?: string
}

interface ServiceRequest {
  _id: string
  specialist: Specialist
  serviceType: string
  description?: string
  preferredDate?: string
  status: string
  serviceFee?: number
  notes?: string
  createdAt: string
}

const router = useRouter()
const requests = ref<ServiceRequest[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedStatus = ref('')
const showDetail = ref(false)
const selectedRequest = ref<ServiceRequest | null>(null)

const fetchRequests = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/service-requests/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to fetch service requests')
    const data = await response.json()
    requests.value = data.requests || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load service requests'
  } finally {
    loading.value = false
  }
}

const filteredRequests = computed(() => {
  let list = requests.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r =>
      r.specialist?.name?.toLowerCase().includes(q) ||
      r.serviceType.toLowerCase().includes(q)
    )
  }
  if (selectedStatus.value) {
    list = list.filter(r => r.status === selectedStatus.value)
  }
  return list
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return dateStr }
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const statusClass = (status: string) => ({
  'status-pending': status === 'Pending',
  'status-accepted': status === 'Accepted',
  'status-inprogress': status === 'In Progress',
  'status-completed': status === 'Completed',
  'status-cancelled': status === 'Cancelled',
})

const canCancel = (status: string) => !['Completed', 'Cancelled'].includes(status)

const openDetail = (req: ServiceRequest) => {
  selectedRequest.value = req
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  selectedRequest.value = null
}

const confirmCancel = async (req: ServiceRequest) => {
  if (!confirm('Are you sure you want to cancel this service request?')) return
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/service-requests/${req._id}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to cancel')
    await fetchRequests()
  } catch (err: any) {
    alert(err.message || 'Failed to cancel service request')
  }
}

onMounted(fetchRequests)
</script>

<style scoped>
:root {
  --p-900: #28104E; --p-700: #6237A0; --p-500: #9754CB; --p-300: #DEACF5; --p-50: #FBF7FF;
}

.services-page { padding: 24px; max-width: 1400px; margin: 0 auto; min-height: calc(100vh - 96px); }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.header-content { flex: 1; }
.page-title { font-size: 32px; font-weight: 800; color: #1b1030; margin: 0 0 6px; letter-spacing: -0.5px; }
.page-subtitle { font-size: 15px; color: rgba(40,16,60,0.65); margin: 0; }

.browse-btn { padding: 10px 18px; background: linear-gradient(90deg,#9754CB,#DEACF5); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
.browse-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(151,84,203,0.2); }

.filter-bar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 200px; position: relative; }
.search-input { width: 100%; padding: 11px 16px 11px 40px; border: 1px solid rgba(151,84,203,0.2); border-radius: 8px; font-size: 14px; background: white; color: #1b1030; }
.search-input:focus { outline: none; border-color: rgba(151,84,203,0.4); }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 15px; }
.filter-select { padding: 11px 12px; border: 1px solid rgba(151,84,203,0.2); border-radius: 8px; font-size: 14px; background: white; color: #1b1030; cursor: pointer; min-width: 140px; }
.filter-select:focus { outline: none; border-color: rgba(151,84,203,0.4); }

.loading-state, .error-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 12px; text-align: center; }
.spinner { width: 48px; height: 48px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p, .error-state p { font-size: 15px; color: rgba(40,16,60,0.65); margin: 0; max-width: 400px; }
.error-icon, .empty-icon { font-size: 48px; line-height: 1; }
.error-state h3, .empty-state h3 { font-size: 20px; font-weight: 700; color: #1b1030; margin: 0; }
.retry-btn, .browse-btn-large { padding: 10px 24px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 4px; font-size: 14px; }
.browse-btn-large { font-size: 15px; padding: 12px 32px; margin-top: 8px; }

/* Table */
.table-wrap { overflow-x: auto; border-radius: 12px; border: 2px solid #9754CB; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table thead { background: linear-gradient(90deg,#9754CB,#DEACF5); }
.table th { padding: 14px 14px; text-align: left; color: white; font-weight: 700; font-size: 12px; text-transform: capitalize; letter-spacing: 0.3px; white-space: nowrap; }
.table-row { border-bottom: 1px solid #E5D9F0; transition: background 0.15s; }
.table-row:hover { background: #F8F4FF; }
.table td { padding: 14px; color: #28104E; vertical-align: middle; }

.specialist-cell { display: flex; align-items: center; gap: 10px; }
.specialist-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#9754CB,#DEACF5); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 700; flex-shrink: 0; overflow: hidden; }
.specialist-avatar.lg { width: 52px; height: 52px; font-size: 18px; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.specialist-name { font-weight: 700; color: #1b1030; font-size: 13px; }
.specialist-spec { font-size: 11px; color: #9754CB; font-weight: 600; }
.service-type { font-weight: 600; color: #1b1030; }
.date-cell { font-size: 13px; color: rgba(40,16,60,0.7); white-space: nowrap; }
.fee-cell { font-weight: 700; color: #9754CB; }

.status-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.status-pending { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.status-accepted { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.status-inprogress { background: #ffedd5; color: #9a3412; border: 1px solid #fdba74; }
.status-completed { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
.status-cancelled { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

.action-btns { display: flex; gap: 6px; }
.btn-details { width: 32px; height: 32px; background: linear-gradient(90deg,#9754CB,#DEACF5); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.btn-cancel { width: 32px; height: 32px; background: #fee2e2; color: #dc2626; border: 1.5px solid #fca5a5; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.btn-details:hover { transform: translateY(-1px); }
.btn-cancel:hover { background: #fecaca; }

/* Cards */
.service-card { background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 16px; margin-bottom: 14px; box-shadow: 0 4px 12px rgba(151,84,203,0.1); }
.card-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; gap: 8px; }
.card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.card-detail-item { display: flex; flex-direction: column; gap: 3px; }
.detail-label { font-size: 11px; font-weight: 700; color: #9754CB; text-transform: uppercase; }
.detail-value { font-size: 13px; font-weight: 600; color: #1b1030; }
.detail-value.fee { color: #9754CB; }
.card-actions { display: flex; gap: 8px; }
.card-btn-details { flex: 1; padding: 9px; background: linear-gradient(90deg,#9754CB,#DEACF5); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.card-btn-cancel { flex: 1; padding: 9px; background: #fee2e2; color: #dc2626; border: 1.5px solid #fca5a5; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }

/* Detail Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-box { background: white; border-radius: 16px; max-width: 580px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(151,84,203,0.1); position: sticky; top: 0; background: white; border-radius: 16px 16px 0 0; }
.modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #1b1030; }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: rgba(40,16,60,0.5); padding: 4px; border-radius: 6px; }
.modal-close:hover { background: rgba(151,84,203,0.08); }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.detail-specialist { display: flex; align-items: center; gap: 14px; padding-bottom: 16px; border-bottom: 1px solid rgba(151,84,203,0.1); }
.detail-grid { display: flex; flex-direction: column; gap: 10px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(151,84,203,0.03); border-radius: 8px; }
.detail-key { font-size: 13px; font-weight: 600; color: rgba(40,16,60,0.6); }
.detail-val { font-size: 13px; font-weight: 700; color: #1b1030; }
.detail-val.fee { color: #9754CB; }
.detail-description, .detail-notes { padding: 14px; background: rgba(151,84,203,0.03); border-radius: 8px; border-left: 3px solid #DEACF5; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid rgba(151,84,203,0.1); justify-content: flex-end; }
.btn-modal-close { padding: 9px 20px; background: rgba(151,84,203,0.08); color: #6237A0; border: 1px solid rgba(151,84,203,0.2); border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
.btn-modal-cancel { padding: 9px 20px; background: #fee2e2; color: #dc2626; border: 1.5px solid #fca5a5; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }

.results-footer { text-align: center; color: rgba(40,16,60,0.6); font-size: 14px; padding: 16px; }

.desktop-view { display: block; }
.mobile-view { display: none; }

@media (max-width: 768px) {
  .services-page { padding: 16px; }
  .page-title { font-size: 24px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .browse-btn { width: 100%; text-align: center; }
  .filter-bar { flex-direction: column; }
  .filter-select { width: 100%; }
  .desktop-view { display: none; }
  .mobile-view { display: block; }
  .card-details { grid-template-columns: 1fr; }
}
</style>
