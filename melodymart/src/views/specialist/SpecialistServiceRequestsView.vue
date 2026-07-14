<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Service Requests</h1>
        <p class="page-subtitle">Manage customer service requests and set pricing.</p>
      </div>
    </div>

    <div class="filter-bar" v-if="requests.length > 0 || searchQuery || selectedStatus">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Search by customer or service type..." class="search-input" />
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

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading requests...</p></div>
    <div v-else-if="error" class="state-box"><p class="err">{{ error }}</p><button @click="fetchRequests" class="retry-btn">Retry</button></div>

    <div v-else-if="filteredRequests.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      </div>
      <h3>{{ requests.length === 0 ? 'No requests yet' : 'No results found' }}</h3>
      <p>{{ requests.length === 0 ? 'Customers will submit service requests here.' : 'Try adjusting your search or filters.' }}</p>
    </div>

    <div v-else class="requests-list">
      <div v-for="r in filteredRequests" :key="r._id" class="request-card">
        <div class="card-head">
          <div class="customer-info">
            <div class="avatar">{{ getInitials(r.customer?.name) }}</div>
            <div>
              <div class="customer-name">{{ r.customer?.name || 'Unknown' }}</div>
              <div class="customer-email">{{ r.customer?.email || '' }}</div>
            </div>
          </div>
          <span class="badge" :class="statusBadge(r.status)">{{ r.status }}</span>
        </div>

        <div class="card-body">
          <div class="info-row"><span class="ilabel">Service Type</span><span class="ivalue">{{ r.serviceType || '—' }}</span></div>
          <div class="info-row"><span class="ilabel">Description</span><span class="ivalue desc">{{ r.description || '—' }}</span></div>
          <div class="info-row"><span class="ilabel">Preferred Date</span><span class="ivalue">{{ formatDate(r.preferredDate) }}</span></div>
          <div class="info-row"><span class="ilabel">Requested On</span><span class="ivalue">{{ formatDate(r.createdAt) }}</span></div>
        </div>

        <div class="card-footer">
          <div class="fee-section">
            <label class="fee-label">Service Fee (Rs)</label>
            <div class="fee-row">
              <input v-model.number="r._tempFee" type="number" min="0" step="50" class="fee-input" :placeholder="r.serviceFee || '0'" />
              <button @click="saveFee(r)" :disabled="savingFeeId === r._id" class="btn-save">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
          </div>
          <div class="status-section">
            <label class="fee-label">Update Status</label>
            <select v-model="r._tempStatus" class="status-select">
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button @click="updateStatus(r)" :disabled="updatingId === r._id" class="btn-update">
            {{ updatingId === r._id ? 'Updating...' : 'Update Status' }}
          </button>
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
  if (searchQuery.value) { const q = searchQuery.value.toLowerCase(); list = list.filter(r => r.customer?.name?.toLowerCase().includes(q) || r.serviceType?.toLowerCase().includes(q)) }
  if (selectedStatus.value) list = list.filter(r => r.status === selectedStatus.value)
  return list
})

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const statusBadge = (s: string) => ({ 'badge-emerald': s === 'Completed', 'badge-teal': s === 'Accepted' || s === 'In Progress', 'badge-gold': s === 'Pending', 'badge-coral': s === 'Cancelled' })

const saveFee = async (r: any) => {
  if (!r._tempFee || r._tempFee <= 0) return
  savingFeeId.value = r._id
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/specialists/dashboard/requests/${r._id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: r._tempStatus, serviceFee: r._tempFee }) })
    if (res.ok) { r.serviceFee = r._tempFee; r._tempFee = '' }
    else alert('Failed to save fee')
  } catch (e: any) { alert(e.message) }
  finally { savingFeeId.value = null }
}

const updateStatus = async (r: any) => {
  updatingId.value = r._id
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/specialists/dashboard/requests/${r._id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: r._tempStatus, serviceFee: r.serviceFee }) })
    if (res.ok) { r.status = r._tempStatus }
    else alert('Failed to update status')
  } catch (e: any) { alert(e.message) }
  finally { updatingId.value = null }
}

onMounted(fetchRequests)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-wrap { flex: 1; min-width: 200px; position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--mm-stone); pointer-events: none; }
.search-input { width: 100%; padding: 0.5625rem 0.875rem 0.5625rem 2.25rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.search-input::placeholder { color: var(--mm-stone); }
.search-input:focus { border-color: var(--mm-copper); }
.filter-select { padding: 0.5625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; min-width: 130px; transition: border-color 0.2s; }
.filter-select:focus { border-color: var(--mm-copper); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3.75rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-copper); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.err { color: var(--mm-coral); }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.75rem; text-align: center; }
.empty-icon { color: var(--mm-stone); }
.empty-state h3 { font-size: 1.25rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.empty-state p { font-size: 0.875rem; color: var(--mm-sand); margin: 0; }

.requests-list { display: flex; flex-direction: column; gap: 1rem; }
.request-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; overflow: hidden; transition: border-color 0.2s; }
.request-card:hover { border-color: rgba(192,123,80,0.3); }

.card-head { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: rgba(192,123,80,0.04); border-bottom: 1px solid var(--mm-warm-line); gap: 1rem; }
.customer-info { display: flex; align-items: center; gap: 0.75rem; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.customer-name  { font-weight: 700; color: var(--mm-ivory); font-size: 0.9375rem; }
.customer-email { font-size: 0.75rem; color: var(--mm-stone); margin-top: 1px; }

.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
.badge-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.badge-teal    { background: rgba(42,157,159,0.12); color: var(--mm-teal);    border: 1px solid rgba(42,157,159,0.25); }
.badge-gold    { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.badge-coral   { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

.card-body { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.625rem; }
.info-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.ilabel { font-size: 0.75rem; font-weight: 700; color: var(--mm-copper); text-transform: uppercase; letter-spacing: 0.04em; min-width: 100px; }
.ivalue { font-size: 0.875rem; color: var(--mm-ivory); flex: 1; text-align: right; }
.ivalue.desc { text-align: left; color: var(--mm-sand); }

.card-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--mm-warm-line); display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; background: rgba(192,123,80,0.02); }
.fee-section, .status-section { display: flex; flex-direction: column; gap: 0.375rem; min-width: 140px; }
.fee-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; }
.fee-row { display: flex; gap: 0.5rem; }
.fee-input { flex: 1; padding: 0.5rem 0.625rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.fee-input:focus { border-color: var(--mm-copper); }
.btn-save { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
.btn-save:hover { background: rgba(56,168,130,0.2); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.status-select { padding: 0.5rem 0.625rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-update { padding: 0.5rem 1.125rem; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; white-space: nowrap; align-self: flex-end; }
.btn-update:hover:not(:disabled) { transform: translateY(-1px); }
.btn-update:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) { .filter-bar { flex-direction: column; } .card-footer { flex-direction: column; } .btn-update, .status-select { width: 100%; } }
</style>
