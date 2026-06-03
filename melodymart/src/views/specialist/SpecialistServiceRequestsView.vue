<template>
  <div class="page">
    <div class="page-header">
      <div><h1 class="page-title">Service Requests</h1><p class="page-subtitle">Manage customer service requests and set pricing.</p></div>
    </div>

    <div class="filter-bar" v-if="requests.length > 0 || searchQuery || selectedStatus">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Search by customer or service type..." class="search-input" />
        <span class="search-icon">🔍</span>
      </div>
      <select v-model="selectedStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="Pending" style="color:#111827;background:#fff;">Pending</option>
        <option value="Accepted" style="color:#111827;background:#fff;">Accepted</option>
        <option value="In Progress" style="color:#111827;background:#fff;">In Progress</option>
        <option value="Completed" style="color:#111827;background:#fff;">Completed</option>
        <option value="Cancelled" style="color:#111827;background:#fff;">Cancelled</option>
      </select>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading requests...</p></div>
    <div v-else-if="error" class="error-state"><span>⚠️</span><p>{{ error }}</p><button @click="fetchRequests" class="retry-btn">Retry</button></div>

    <div v-else-if="filteredRequests.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>{{ requests.length === 0 ? 'No requests yet' : 'No results found' }}</h3>
      <p>{{ requests.length === 0 ? 'Customers will submit service requests here.' : 'Try adjusting your search or filters.' }}</p>
    </div>

    <div v-else class="requests-list">
      <div v-for="r in filteredRequests" :key="r._id" class="request-card">
        <div class="card-header">
          <div class="customer-info">
            <div class="avatar">{{ getInitials(r.customer?.name) }}</div>
            <div><div class="customer-name">{{ r.customer?.name || 'Unknown' }}</div><div class="customer-email">{{ r.customer?.email || '' }}</div></div>
          </div>
          <span class="status-badge" :class="statusBadge(r.status)">{{ r.status }}</span>
        </div>

        <div class="card-body">
          <div class="info-row"><span class="label">Service Type</span><span class="value">{{ r.serviceType || '—' }}</span></div>
          <div class="info-row"><span class="label">Description</span><span class="value desc">{{ r.description || '—' }}</span></div>
          <div class="info-row"><span class="label">Preferred Date</span><span class="value">{{ formatDate(r.preferredDate) }}</span></div>
          <div class="info-row"><span class="label">Requested On</span><span class="value">{{ formatDate(r.createdAt) }}</span></div>
        </div>

        <div class="card-actions">
          <div class="fee-section">
            <label class="fee-label">Service Fee (Rs)</label>
            <div class="fee-input-wrap">
              <input v-model.number="r._tempFee" type="number" min="0" step="50" class="fee-input" :placeholder="r.serviceFee || '0'" />
              <button @click="saveFee(r)" :disabled="savingFeeId === r._id" class="btn-save-fee">{{ savingFeeId === r._id ? '...' : '✓' }}</button>
            </div>
          </div>
          <select v-model="r._tempStatus" class="status-select">
            <option value="Pending" style="color:#111827;background:#fff;">Pending</option>
            <option value="Accepted" style="color:#111827;background:#fff;">Accepted</option>
            <option value="In Progress" style="color:#111827;background:#fff;">In Progress</option>
            <option value="Completed" style="color:#111827;background:#fff;">Completed</option>
            <option value="Cancelled" style="color:#111827;background:#fff;">Cancelled</option>
          </select>
          <button @click="updateStatus(r)" :disabled="updatingId === r._id" class="btn-update">{{ updatingId === r._id ? 'Updating...' : 'Update Status' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const requests = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedStatus = ref('')
const updatingId = ref<string | null>(null)
const savingFeeId = ref<string | null>(null)

const fetchRequests = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/specialists/dashboard/requests', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to load requests')
    const data = await res.json()
    requests.value = (data.requests || []).map(r => ({ ...r, _tempStatus: r.status, _tempFee: r.serviceFee || '' }))
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const filteredRequests = computed(() => {
  let list = requests.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r => r.customer?.name?.toLowerCase().includes(q) || r.serviceType?.toLowerCase().includes(q))
  }
  if (selectedStatus.value) list = list.filter(r => r.status === selectedStatus.value)
  return list
})

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const statusBadge = (s: string) => ({
  'badge-green': s === 'Completed',
  'badge-blue': s === 'Accepted' || s === 'In Progress',
  'badge-amber': s === 'Pending',
  'badge-red': s === 'Cancelled',
})

const saveFee = async (r: any) => {
  if (!r._tempFee || r._tempFee <= 0) return
  savingFeeId.value = r._id
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/specialists/dashboard/requests/${r._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: r._tempStatus, serviceFee: r._tempFee }),
    })
    if (res.ok) { const d = await res.json(); r.serviceFee = r._tempFee; r._tempFee = ''; alert('Fee saved!') }
    else alert('Failed to save fee')
  } catch (e: any) { alert(e.message) }
  finally { savingFeeId.value = null }
}

const updateStatus = async (r: any) => {
  updatingId.value = r._id
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/specialists/dashboard/requests/${r._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: r._tempStatus, serviceFee: r.serviceFee }),
    })
    if (res.ok) { const d = await res.json(); r.status = r._tempStatus; alert('Status updated!') }
    else alert('Failed to update status')
  } catch (e: any) { alert(e.message) }
  finally { updatingId.value = null }
}

onMounted(fetchRequests)
</script>

<style scoped>
.page { max-width: 1200px; }
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
.loading-state p,.error-state p,.empty-state p { color: rgba(40,16,60,0.65); font-size: 14px; margin: 0; }
.empty-icon { font-size: 48px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: #1b1030; margin: 0; }
.retry-btn { padding: 9px 20px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.requests-list { display: flex; flex-direction: column; gap: 16px; }
.request-card { background: white; border: 2px solid #DEACF5; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(151,84,203,0.07); }

.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(151,84,203,0.04); border-bottom: 1px solid #E5D9F0; }
.customer-info { display: flex; align-items: center; gap: 12px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#9754CB,#DEACF5); color: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.customer-name { font-weight: 700; color: #1b1030; font-size: 14px; }
.customer-email { font-size: 11px; color: rgba(40,16,60,0.55); }

.status-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.badge-green { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
.badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

.card-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.label { font-size: 12px; font-weight: 700; color: #9754CB; text-transform: uppercase; min-width: 100px; }
.value { font-size: 13px; font-weight: 600; color: #1b1030; flex: 1; text-align: right; }
.value.desc { text-align: left; }

.card-actions { padding: 16px; border-top: 1px solid #E5D9F0; display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.fee-section { display: flex; flex-direction: column; gap: 5px; min-width: 140px; }
.fee-label { font-size: 11px; font-weight: 700; color: #9754CB; text-transform: uppercase; }
.fee-input-wrap { display: flex; gap: 6px; }
.fee-input { flex: 1; padding: 8px 10px; border: 1.5px solid rgba(151,84,203,0.2); border-radius: 6px; font-size: 12px; color: #1b1030; background: white; outline: none; }
.fee-input:focus { border-color: #9754CB; }
.btn-save-fee { padding: 8px 12px; background: #9754CB; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.btn-save-fee:hover { background: #6237A0; }
.btn-save-fee:disabled { opacity: 0.6; cursor: not-allowed; }

.status-select { padding: 8px 10px; border: 1.5px solid rgba(151,84,203,0.2); border-radius: 6px; font-size: 12px; color: #1b1030; background: white; cursor: pointer; outline: none; flex: 1; min-width: 120px; }
.status-select:focus { border-color: #9754CB; }

.btn-update { padding: 8px 18px; background: linear-gradient(90deg,#9754CB,#6237A0); color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.btn-update:hover:not(:disabled) { transform: translateY(-1px); }
.btn-update:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) { .filter-bar { flex-direction: column; } .filter-select { width: 100%; } .card-actions { flex-direction: column; } .status-select, .btn-update { width: 100%; } }
</style>
