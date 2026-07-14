<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Requested Services</h1>
        <p class="page-subtitle">Track and manage your repair service requests.</p>
      </div>
      <button class="req-btn" @click="router.push('/#repairs')">+ Request Service</button>
    </div>

    <div class="filter-bar" v-if="requests.length > 0 || searchQuery || selectedStatus">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Search by specialist or service type..." class="search-input" />
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

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading your service requests...</p></div>

    <div v-else-if="error" class="state-box">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--mm-coral)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h3 style="color:var(--mm-ivory);font-size:1.125rem;font-weight:700;margin:0">Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchRequests">Try Again</button>
    </div>

    <div v-else-if="filteredRequests.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
      </div>
      <h3>{{ requests.length === 0 ? 'No service requests yet' : 'No results found' }}</h3>
      <p>{{ requests.length === 0 ? 'Request a repair service from our verified specialists.' : 'Try adjusting your search or filter.' }}</p>
      <button v-if="requests.length === 0" class="req-btn" @click="router.push('/#repairs')">Browse Specialists</button>
    </div>

    <div v-else>
      <!-- Desktop table -->
      <div class="table-wrap desktop-only">
        <table class="table">
          <thead><tr>
            <th>Specialist</th><th>Service Type</th><th>Request Date</th><th>Preferred Date</th><th>Status</th><th>Service Fee</th><th>Actions</th>
          </tr></thead>
          <tbody>
            <tr v-for="req in filteredRequests" :key="req._id" class="table-row">
              <td>
                <div class="spec-cell">
                  <div class="spec-avatar">
                    <img v-if="req.specialist?.avatar" :src="req.specialist.avatar" :alt="req.specialist.name" class="avatar-img" @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
                    <span v-else>{{ getInitials(req.specialist?.name || '?') }}</span>
                  </div>
                  <div>
                    <div class="spec-name">{{ req.specialist?.name || 'Unknown' }}</div>
                    <div class="spec-sub">{{ req.specialist?.specialization || 'Repair Specialist' }}</div>
                  </div>
                </div>
              </td>
              <td class="type-cell">{{ req.serviceType }}</td>
              <td class="date-cell">{{ formatDate(req.createdAt) }}</td>
              <td class="date-cell">{{ req.preferredDate ? formatDate(req.preferredDate) : '—' }}</td>
              <td><span class="badge" :class="statusBadge(req.status)">{{ req.status }}</span></td>
              <td class="fee-cell">{{ req.serviceFee ? `Rs ${req.serviceFee}` : '—' }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn-view" @click="openDetail(req)" title="View Details">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button v-if="canCancel(req.status)" class="btn-cancel" @click="confirmCancel(req)" title="Cancel">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="cards-wrap mobile-only">
        <div v-for="req in filteredRequests" :key="req._id" class="svc-card">
          <div class="card-head">
            <div class="spec-cell">
              <div class="spec-avatar">
                <img v-if="req.specialist?.avatar" :src="req.specialist.avatar" :alt="req.specialist.name" class="avatar-img" @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
                <span v-else>{{ getInitials(req.specialist?.name || '?') }}</span>
              </div>
              <div>
                <div class="spec-name">{{ req.specialist?.name || 'Unknown' }}</div>
                <div class="spec-sub">{{ req.specialist?.specialization || 'Repair' }}</div>
              </div>
            </div>
            <span class="badge" :class="statusBadge(req.status)">{{ req.status }}</span>
          </div>
          <div class="card-details">
            <div class="cd-item"><span class="cd-label">Service</span><span class="cd-val">{{ req.serviceType }}</span></div>
            <div class="cd-item"><span class="cd-label">Requested</span><span class="cd-val">{{ formatDate(req.createdAt) }}</span></div>
            <div v-if="req.preferredDate" class="cd-item"><span class="cd-label">Preferred</span><span class="cd-val">{{ formatDate(req.preferredDate) }}</span></div>
            <div v-if="req.serviceFee" class="cd-item"><span class="cd-label">Fee</span><span class="cd-val fee">Rs {{ req.serviceFee }}</span></div>
          </div>
          <div class="card-footer">
            <button class="card-btn-view" @click="openDetail(req)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View Details
            </button>
            <button v-if="canCancel(req.status)" class="card-btn-cancel" @click="confirmCancel(req)">Cancel</button>
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
            <h2 class="modal-title">Service Request Details</h2>
            <button @click="closeDetail" class="modal-close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="modal-spec-row">
              <div class="spec-avatar lg">
                <img v-if="selectedRequest.specialist?.avatar" :src="selectedRequest.specialist.avatar" class="avatar-img" @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
                <span v-else>{{ getInitials(selectedRequest.specialist?.name || '?') }}</span>
              </div>
              <div>
                <div class="modal-spec-name">{{ selectedRequest.specialist?.name }}</div>
                <div class="modal-spec-sub">{{ selectedRequest.specialist?.specialization || 'Instrument Repair' }}</div>
                <div v-if="selectedRequest.specialist?.hourlyRate" class="modal-spec-rate">Rs {{ selectedRequest.specialist.hourlyRate }}/hr</div>
              </div>
              <span class="badge ml-auto" :class="statusBadge(selectedRequest.status)">{{ selectedRequest.status }}</span>
            </div>

            <div class="detail-grid">
              <div class="detail-row"><span class="dk">Service Type</span><span class="dv">{{ selectedRequest.serviceType }}</span></div>
              <div class="detail-row"><span class="dk">Request Date</span><span class="dv">{{ formatDate(selectedRequest.createdAt) }}</span></div>
              <div v-if="selectedRequest.preferredDate" class="detail-row"><span class="dk">Preferred Date</span><span class="dv">{{ formatDate(selectedRequest.preferredDate) }}</span></div>
              <div v-if="selectedRequest.serviceFee" class="detail-row"><span class="dk">Service Fee</span><span class="dv fee">Rs {{ selectedRequest.serviceFee }}</span></div>
              <div v-if="selectedRequest.specialist?.phone" class="detail-row"><span class="dk">Phone</span><span class="dv">{{ selectedRequest.specialist.phone }}</span></div>
              <div v-if="selectedRequest.specialist?.email" class="detail-row"><span class="dk">Email</span><span class="dv">{{ selectedRequest.specialist.email }}</span></div>
            </div>

            <div v-if="selectedRequest.description" class="desc-box">
              <div class="dk mb-1">Description</div>
              <p class="desc-text">{{ selectedRequest.description }}</p>
            </div>
            <div v-if="selectedRequest.notes" class="desc-box notes-box">
              <div class="dk mb-1">Specialist Notes</div>
              <p class="desc-text">{{ selectedRequest.notes }}</p>
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

interface Specialist { _id: string; name: string; email?: string; phone?: string; specialization?: string; hourlyRate?: number; avatar?: string }
interface ServiceRequest { _id: string; specialist: Specialist; serviceType: string; description?: string; preferredDate?: string; status: string; serviceFee?: number; notes?: string; createdAt: string }

const router = useRouter()
const requests = ref<ServiceRequest[]>([])
const loading = ref(false); const error = ref('')
const searchQuery = ref(''); const selectedStatus = ref('')
const showDetail = ref(false); const selectedRequest = ref<ServiceRequest | null>(null)

const fetchRequests = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/service-requests/my', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to fetch service requests')
    requests.value = (await res.json()).requests || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const filteredRequests = computed(() => {
  let list = requests.value
  if (searchQuery.value) { const q = searchQuery.value.toLowerCase(); list = list.filter(r => r.specialist?.name?.toLowerCase().includes(q) || r.serviceType.toLowerCase().includes(q)) }
  if (selectedStatus.value) list = list.filter(r => r.status === selectedStatus.value)
  return list
})

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const getInitials = (n: string) => n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)
const statusBadge = (s: string) => ({ 'badge-emerald': s === 'Completed', 'badge-teal': s === 'Accepted' || s === 'In Progress', 'badge-gold': s === 'Pending', 'badge-coral': s === 'Cancelled' })
const canCancel = (s: string) => !['Completed', 'Cancelled'].includes(s)
const openDetail = (r: ServiceRequest) => { selectedRequest.value = r; showDetail.value = true }
const closeDetail = () => { showDetail.value = false; selectedRequest.value = null }
const confirmCancel = async (req: ServiceRequest) => {
  if (!confirm('Cancel this service request?')) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/service-requests/${req._id}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to cancel')
    await fetchRequests()
  } catch (e: any) { alert(e.message) }
}
onMounted(fetchRequests)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }
.req-btn { display: inline-flex; align-items: center; padding: 0.625rem 1.25rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 12px rgba(42,157,159,0.25); }
.req-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(42,157,159,0.35); }

.filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-wrap { flex: 1; min-width: 200px; position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--mm-stone); pointer-events: none; }
.search-input { width: 100%; padding: 0.5625rem 0.875rem 0.5625rem 2.25rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.search-input::placeholder { color: var(--mm-stone); }
.search-input:focus { border-color: var(--mm-teal); }
.filter-select { padding: 0.5625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; min-width: 130px; transition: border-color 0.2s; }
.filter-select:focus { border-color: var(--mm-teal); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.875rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-teal); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.75rem; text-align: center; }
.empty-icon-wrap { width: 72px; height: 72px; border-radius: 50%; background: rgba(42,157,159,0.1); color: var(--mm-teal); display: flex; align-items: center; justify-content: center; }
.empty-state h3 { font-size: 1.25rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.empty-state p { font-size: 0.875rem; color: var(--mm-sand); margin: 0; }

/* Table */
.table-wrap { overflow-x: auto; border-radius: 0.875rem; border: 1px solid var(--mm-warm-line); }
.table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.table thead { background: rgba(42,157,159,0.06); border-bottom: 1px solid var(--mm-warm-line); }
.table th { padding: 0.75rem 1rem; color: var(--mm-teal); font-weight: 700; text-align: left; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.table-row { border-bottom: 1px solid var(--mm-warm-line); }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(42,157,159,0.03); }
.table td { padding: 0.75rem 1rem; color: var(--mm-ivory); vertical-align: middle; }
.spec-cell { display: flex; align-items: center; gap: 0.625rem; }
.spec-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.spec-avatar.lg { width: 48px; height: 48px; font-size: 1rem; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.spec-name { font-weight: 700; color: var(--mm-ivory); font-size: 0.8125rem; }
.spec-sub { font-size: 0.6875rem; color: var(--mm-teal); font-weight: 600; margin-top: 1px; }
.type-cell { font-weight: 600; color: var(--mm-cream); }
.date-cell { font-size: 0.75rem; color: var(--mm-sand); white-space: nowrap; }
.fee-cell { font-weight: 700; color: var(--mm-gold); }
.action-btns { display: flex; gap: 0.375rem; }
.btn-view { width: 30px; height: 30px; background: rgba(42,157,159,0.12); color: var(--mm-teal); border: 1px solid rgba(42,157,159,0.25); border-radius: 0.375rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-view:hover { background: rgba(42,157,159,0.2); }
.btn-cancel { width: 30px; height: 30px; background: rgba(224,112,96,0.1); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.375rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-cancel:hover { background: rgba(224,112,96,0.2); }

/* Badge */
.badge { display: inline-flex; align-items: center; padding: 0.2rem 0.5625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.badge-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.badge-teal    { background: rgba(42,157,159,0.12); color: var(--mm-teal);    border: 1px solid rgba(42,157,159,0.25); }
.badge-gold    { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.badge-coral   { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }
.ml-auto { margin-left: auto; }

/* Mobile cards */
.svc-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; margin-bottom: 0.875rem; overflow: hidden; transition: border-color 0.2s; }
.svc-card:hover { border-color: rgba(42,157,159,0.3); }
.card-head { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1rem; background: rgba(42,157,159,0.04); border-bottom: 1px solid var(--mm-warm-line); gap: 0.75rem; }
.card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; padding: 0.875rem 1rem; }
.cd-item { display: flex; flex-direction: column; gap: 0.2rem; }
.cd-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-teal); text-transform: uppercase; letter-spacing: 0.04em; }
.cd-val { font-size: 0.875rem; font-weight: 600; color: var(--mm-ivory); }
.cd-val.fee { color: var(--mm-gold); }
.card-footer { display: flex; gap: 0.5rem; padding: 0.875rem 1rem; border-top: 1px solid var(--mm-warm-line); }
.card-btn-view { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.625rem; background: rgba(42,157,159,0.1); color: var(--mm-teal); border: 1px solid rgba(42,157,159,0.25); border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.card-btn-view:hover { background: rgba(42,157,159,0.18); }
.card-btn-cancel { flex: 1; padding: 0.625rem; background: rgba(224,112,96,0.1); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.card-btn-cancel:hover { background: rgba(224,112,96,0.18); }

.results-footer { text-align: center; color: var(--mm-stone); font-size: 0.8125rem; padding: 1rem; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.25rem; backdrop-filter: blur(4px); }
.modal-box { background: var(--mm-carbon); border: 1px solid var(--mm-warm-line); border-radius: 1rem; max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--mm-warm-line); position: sticky; top: 0; background: var(--mm-carbon); border-radius: 1rem 1rem 0 0; }
.modal-title { font-family: 'DM Serif Display', serif; font-size: 1.25rem; color: var(--mm-ivory); margin: 0; }
.modal-close { background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; color: var(--mm-sand); cursor: pointer; padding: 0.375rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.modal-close:hover { background: var(--mm-onyx); color: var(--mm-ivory); }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }
.modal-spec-row { display: flex; align-items: center; gap: 0.875rem; padding-bottom: 1rem; border-bottom: 1px solid var(--mm-warm-line); }
.modal-spec-name { font-weight: 700; color: var(--mm-ivory); font-size: 1rem; }
.modal-spec-sub { font-size: 0.8125rem; color: var(--mm-teal); font-weight: 600; margin-top: 2px; }
.modal-spec-rate { font-size: 0.75rem; color: var(--mm-stone); margin-top: 2px; }
.detail-grid { display: flex; flex-direction: column; gap: 0.5rem; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 0.625rem 0.875rem; background: rgba(42,157,159,0.04); border: 1px solid rgba(42,157,159,0.06); border-radius: 0.5rem; }
.dk { font-size: 0.8125rem; font-weight: 600; color: var(--mm-stone); }
.dv { font-size: 0.8125rem; font-weight: 700; color: var(--mm-ivory); }
.dv.fee { color: var(--mm-gold); }
.desc-box { padding: 0.875rem; background: rgba(42,157,159,0.04); border: 1px solid rgba(42,157,159,0.08); border-radius: 0.625rem; border-left: 3px solid var(--mm-teal); }
.notes-box { border-left-color: var(--mm-gold); }
.desc-text { font-size: 0.875rem; color: var(--mm-sand); line-height: 1.6; margin: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.modal-footer { display: flex; gap: 0.625rem; padding: 1rem 1.5rem; border-top: 1px solid var(--mm-warm-line); justify-content: flex-end; }
.btn-modal-close { padding: 0.5625rem 1.25rem; background: rgba(42,157,159,0.08); color: var(--mm-teal); border: 1px solid rgba(42,157,159,0.2); border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
.btn-modal-cancel { padding: 0.5625rem 1.25rem; background: rgba(224,112,96,0.1); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }

.desktop-only { display: block; }
.mobile-only { display: none; }
@media (max-width: 768px) { .desktop-only { display: none; } .mobile-only { display: block; } .filter-bar { flex-direction: column; } .filter-select { width: 100%; } .card-details { grid-template-columns: 1fr; } .page-header { flex-direction: column; align-items: flex-start; } .req-btn { width: 100%; justify-content: center; } }
</style>
