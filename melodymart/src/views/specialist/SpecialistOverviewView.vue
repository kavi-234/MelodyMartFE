<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ authStore.user?.name }}!</p>
      </div>
      <RouterLink to="/dashboard/specialist/requests" class="view-btn">View Requests</RouterLink>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading dashboard...</p></div>

    <div v-else>
      <!-- Stat cards -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon-wrap copper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Requests</div>
            <div class="stat-value">{{ stats.totalRequests }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Active Jobs</div>
            <div class="stat-value">{{ stats.activeJobs }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Completed Jobs</div>
            <div class="stat-value">{{ stats.completedJobs }}</div>
          </div>
        </div>
        <div class="stat-card earnings-card">
          <div class="stat-icon-wrap gold">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Earnings</div>
            <div class="stat-value gold">Rs {{ stats.totalEarnings.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <div class="two-col">
        <!-- Profile Summary -->
        <div class="card">
          <h2 class="card-title">Profile Summary</h2>
          <div class="profile-grid">
            <div class="profile-item">
              <span class="profile-label">Specialization</span>
              <span class="profile-value">{{ authStore.user?.specialization || 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Experience</span>
              <span class="profile-value">{{ authStore.user?.experience ? authStore.user.experience + ' years' : 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Hourly Rate</span>
              <span class="profile-value">{{ authStore.user?.hourlyRate ? 'Rs ' + authStore.user.hourlyRate + '/hr' : 'Not set' }}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Status</span>
              <span class="status-chip" :class="statusChipClass">{{ statusLabel }}</span>
            </div>
          </div>
          <RouterLink to="/dashboard/specialist/profile" class="card-link">Edit Profile →</RouterLink>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h2 class="card-title">Quick Actions</h2>
          <div class="quick-actions">
            <RouterLink to="/dashboard/specialist/requests" class="quick-btn">
              <div class="quick-icon-wrap copper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <span>View Requests</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow"><polyline points="9 18 15 12 9 6"/></svg>
            </RouterLink>
            <RouterLink to="/dashboard/specialist/earnings" class="quick-btn">
              <div class="quick-icon-wrap gold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <span>View Earnings</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow"><polyline points="9 18 15 12 9 6"/></svg>
            </RouterLink>
            <RouterLink to="/dashboard/specialist/profile" class="quick-btn">
              <div class="quick-icon-wrap teal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span>Edit Profile</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow"><polyline points="9 18 15 12 9 6"/></svg>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Recent Requests table -->
      <div class="card mt">
        <h2 class="card-title">Recent Requests</h2>
        <div v-if="recentRequests.length === 0" class="empty-inner">
          <p>No requests yet. Customers will submit service requests here.</p>
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead><tr>
              <th>Customer</th><th>Service Type</th><th>Request Date</th><th>Preferred Date</th><th>Status</th><th>Fee</th>
            </tr></thead>
            <tbody>
              <tr v-for="r in recentRequests" :key="r._id" class="table-row">
                <td>
                  <div class="customer-cell">
                    <div class="avatar">{{ getInitials(r.customer?.name) }}</div>
                    <span>{{ r.customer?.name || 'Unknown' }}</span>
                  </div>
                </td>
                <td class="type-cell">{{ r.serviceType || '—' }}</td>
                <td class="date-cell">{{ formatDate(r.createdAt) }}</td>
                <td class="date-cell">{{ formatDate(r.preferredDate) }}</td>
                <td><span class="badge" :class="statusBadge(r.status)">{{ r.status }}</span></td>
                <td class="fee-cell">{{ r.serviceFee ? 'Rs ' + r.serviceFee : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <RouterLink v-if="recentRequests.length > 0" to="/dashboard/specialist/requests" class="card-link mt-block">View all requests →</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref({ totalRequests: 0, activeJobs: 0, completedJobs: 0, totalEarnings: 0 })
const recentRequests = ref<any[]>([])

const statusLabel = computed(() => { const s = authStore.user?.verificationStatus; if (s === 'APPROVED') return 'Verified'; if (s === 'REJECTED') return 'Rejected'; return 'Pending' })
const statusChipClass = computed(() => { const s = authStore.user?.verificationStatus; if (s === 'APPROVED') return 'chip-emerald'; if (s === 'REJECTED') return 'chip-coral'; return 'chip-gold' })

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/specialists/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) { const data = await res.json(); stats.value = data.stats; recentRequests.value = data.recentRequests || [] }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const getInitials = (name: string) => (name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const statusBadge = (s: string) => ({ 'badge-emerald': s === 'Completed', 'badge-teal': s === 'Accepted' || s === 'In Progress', 'badge-gold': s === 'Pending', 'badge-coral': s === 'Cancelled' })
onMounted(fetchStats)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }
.view-btn { display: inline-flex; align-items: center; padding: 0.625rem 1.25rem; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 12px rgba(192,123,80,0.25); }
.view-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(192,123,80,0.35); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3.75rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-copper); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }

/* Stat grid */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
.stat-card { display: flex; align-items: flex-start; gap: 1rem; background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 1rem; padding: 1.25rem; transition: all 0.2s; }
.stat-card:hover { border-color: rgba(192,123,80,0.3); }
.stat-icon-wrap { width: 44px; height: 44px; border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon-wrap.copper  { background: rgba(192,123,80,0.12); color: var(--mm-copper); }
.stat-icon-wrap.teal    { background: rgba(42,157,159,0.12); color: var(--mm-teal); }
.stat-icon-wrap.emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); }
.stat-icon-wrap.gold    { background: rgba(212,168,83,0.12);  color: var(--mm-gold); }
.stat-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.25rem; }
.stat-value { font-family: 'DM Serif Display', serif; font-size: 1.75rem; font-weight: 400; color: var(--mm-ivory); line-height: 1.1; }
.stat-value.gold { color: var(--mm-gold); }

/* Two col */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.5rem; }
.mt { margin-top: 0; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1rem; }
.card-link { color: var(--mm-copper); font-size: 0.8125rem; font-weight: 600; text-decoration: none; display: inline-block; margin-top: 1rem; transition: opacity 0.2s; }
.card-link:hover { opacity: 0.75; }
.mt-block { display: block; }

/* Profile */
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
.profile-item { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.75rem; background: rgba(192,123,80,0.04); border: 1px solid rgba(192,123,80,0.06); border-radius: 0.5rem; }
.profile-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-copper); text-transform: uppercase; letter-spacing: 0.04em; }
.profile-value { font-size: 0.9375rem; font-weight: 600; color: var(--mm-ivory); }

.status-chip { display: inline-flex; align-items: center; padding: 0.2rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; align-self: flex-start; }
.chip-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.chip-gold    { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.chip-coral   { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

/* Quick actions */
.quick-actions { display: flex; flex-direction: column; gap: 0.625rem; }
.quick-btn { display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem 1rem; background: rgba(192,123,80,0.04); border: 1px solid rgba(192,123,80,0.1); border-radius: 0.625rem; text-decoration: none; color: var(--mm-ivory); font-size: 0.9375rem; font-weight: 600; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.quick-btn:hover { background: rgba(192,123,80,0.1); border-color: rgba(192,123,80,0.25); transform: translateX(4px); }
.quick-icon-wrap { width: 32px; height: 32px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.quick-icon-wrap.copper { background: rgba(192,123,80,0.12); color: var(--mm-copper); }
.quick-icon-wrap.gold   { background: rgba(212,168,83,0.12); color: var(--mm-gold); }
.quick-icon-wrap.teal   { background: rgba(42,157,159,0.12); color: var(--mm-teal); }
.arrow { margin-left: auto; color: var(--mm-stone); }

/* Table */
.empty-inner { padding: 2.5rem 1rem; text-align: center; color: var(--mm-stone); font-size: 0.875rem; }
.table-wrap { overflow-x: auto; border-radius: 0.625rem; border: 1px solid var(--mm-warm-line); }
.table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.table thead { background: rgba(192,123,80,0.06); border-bottom: 1px solid var(--mm-warm-line); }
.table th { padding: 0.75rem 1rem; color: var(--mm-copper); font-weight: 700; text-align: left; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.table-row { border-bottom: 1px solid var(--mm-warm-line); }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(192,123,80,0.03); }
.table td { padding: 0.75rem 1rem; color: var(--mm-ivory); vertical-align: middle; }
.customer-cell { display: flex; align-items: center; gap: 0.625rem; }
.avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); font-size: 0.6875rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.type-cell { font-weight: 600; color: var(--mm-cream); }
.date-cell { font-size: 0.75rem; color: var(--mm-sand); white-space: nowrap; }
.fee-cell { font-weight: 700; color: var(--mm-gold); }

.badge { display: inline-flex; align-items: center; padding: 0.2rem 0.5625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.badge-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.badge-teal    { background: rgba(42,157,159,0.12); color: var(--mm-teal);    border: 1px solid rgba(42,157,159,0.25); }
.badge-gold    { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.badge-coral   { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

@media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } .two-col { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr; } }
</style>
