<template>
  <div class="overview-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ authStore.user?.name }}!</p>
      </div>
      <RouterLink to="/dashboard/specialist/requests" class="view-btn">View Requests</RouterLink>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading dashboard...</p></div>

    <div v-else>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon requests-icon">📋</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalRequests }}</div>
            <div class="stat-label">Total Requests</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">⚙️</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeJobs }}</div>
            <div class="stat-label">Active Jobs</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed-icon">✓</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completedJobs }}</div>
            <div class="stat-label">Completed Jobs</div>
          </div>
        </div>
        <div class="stat-card earnings-card">
          <div class="stat-icon earnings-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">Rs {{ stats.totalEarnings.toLocaleString() }}</div>
            <div class="stat-label">Total Earnings</div>
          </div>
        </div>
      </div>

      <!-- Profile Info + Quick Links -->
      <div class="two-col">
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

        <div class="card">
          <h2 class="card-title">Quick Actions</h2>
          <div class="quick-actions">
            <RouterLink to="/dashboard/specialist/requests" class="quick-btn">
              <span class="quick-icon">📋</span>
              <span>View Requests</span>
            </RouterLink>
            <RouterLink to="/dashboard/specialist/earnings" class="quick-btn">
              <span class="quick-icon">💵</span>
              <span>View Earnings</span>
            </RouterLink>
            <RouterLink to="/dashboard/specialist/profile" class="quick-btn">
              <span class="quick-icon">⚙️</span>
              <span>Edit Profile</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card mt-6">
        <h2 class="card-title">Recent Requests</h2>
        <div v-if="recentRequests.length === 0" class="empty-activity">
          <p>No requests yet. Customers will submit service requests here.</p>
        </div>
        <div v-else class="activity-table-wrap">
          <table class="activity-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service Type</th>
                <th>Request Date</th>
                <th>Preferred Date</th>
                <th>Status</th>
                <th>Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in recentRequests" :key="r._id" class="activity-row">
                <td>
                  <div class="customer-cell">
                    <div class="avatar">{{ getInitials(r.customer?.name) }}</div>
                    <span>{{ r.customer?.name || 'Unknown' }}</span>
                  </div>
                </td>
                <td class="service-type">{{ r.serviceType || '—' }}</td>
                <td class="date-cell">{{ formatDate(r.createdAt) }}</td>
                <td class="date-cell">{{ formatDate(r.preferredDate) }}</td>
                <td><span class="badge" :class="statusBadge(r.status)">{{ r.status }}</span></td>
                <td class="fee-cell">{{ r.serviceFee ? 'Rs ' + r.serviceFee : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <RouterLink v-if="recentRequests.length > 0" to="/dashboard/specialist/requests" class="card-link mt-4 block">View all requests →</RouterLink>
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

const statusLabel = computed(() => {
  const s = authStore.user?.verificationStatus
  if (s === 'APPROVED') return 'Verified'
  if (s === 'REJECTED') return 'Rejected'
  return 'Pending'
})
const statusChipClass = computed(() => {
  const s = authStore.user?.verificationStatus
  if (s === 'APPROVED') return 'chip-green'
  if (s === 'REJECTED') return 'chip-red'
  return 'chip-amber'
})

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/specialists/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      stats.value = data.stats
      recentRequests.value = data.recentRequests || []
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getInitials = (name: string) =>
  (name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const statusBadge = (s: string) => ({
  'badge-green': s === 'Completed',
  'badge-blue': s === 'Accepted' || s === 'In Progress',
  'badge-amber': s === 'Pending',
  'badge-red': s === 'Cancelled',
})

onMounted(fetchStats)
</script>

<style scoped>
.overview-page { padding: 0; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 30px; font-weight: 800; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.5px; }
.page-subtitle { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; }
.view-btn { padding: 10px 20px; background: linear-gradient(90deg,#9754CB,#DEACF5); color: white; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; white-space: nowrap; transition: all 0.2s; }
.view-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(151,84,203,0.25); }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 16px; }
.spinner { width: 48px; height: 48px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p { color: rgba(40,16,60,0.65); font-size: 15px; }

.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 4px 12px rgba(151,84,203,0.08); transition: all 0.2s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(151,84,203,0.14); }
.earnings-card { background: linear-gradient(135deg, #9754CB, #6237A0); border-color: #6237A0; }
.earnings-card .stat-value, .earnings-card .stat-label { color: white; }
.stat-icon { font-size: 32px; line-height: 1; }
.stat-value { font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1.1; }
.stat-label { font-size: 12px; font-weight: 600; color: rgba(40,16,60,0.55); text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card { background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(151,84,203,0.07); }
.mt-6 { margin-top: 20px; }
.card-title { font-size: 17px; font-weight: 700; color: #ffffff; margin: 0 0 18px; }
.card-link { color: #9754CB; font-size: 13px; font-weight: 600; text-decoration: none; margin-top: 16px; display: inline-block; }
.card-link:hover { color: #6237A0; }
.card-link.block { display: block; }

.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.profile-item { display: flex; flex-direction: column; gap: 3px; }
.profile-label { font-size: 11px; font-weight: 700; color: #9754CB; text-transform: uppercase; }
.profile-value { font-size: 14px; font-weight: 600; color: #ffffff; }

.status-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.chip-green { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
.chip-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.chip-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

.quick-actions { display: flex; flex-direction: column; gap: 10px; }
.quick-btn {
  display: flex; align-items: center; gap: 12px; padding: 12px 16px;
  background: rgba(151,84,203,0.05); border: 1.5px solid rgba(151,84,203,0.15);
  border-radius: 10px; text-decoration: none; color: #ffffff; font-size: 14px; font-weight: 600;
  transition: all 0.2s;
}
.quick-btn:hover { background: rgba(151,84,203,0.1); border-color: rgba(151,84,203,0.3); transform: translateX(4px); }
.quick-icon { font-size: 18px; }

.empty-activity { text-align: center; padding: 32px; color: rgba(40,16,60,0.55); font-size: 14px; }
.activity-table-wrap { overflow-x: auto; border-radius: 10px; border: 1.5px solid #DEACF5; }
.activity-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.activity-table thead { background: linear-gradient(90deg,#9754CB,#DEACF5); }
.activity-table th { padding: 12px 14px; color: white; font-weight: 700; text-align: left; font-size: 11px; text-transform: uppercase; }
.activity-row { border-bottom: 1px solid #E5D9F0; }
.activity-row:hover { background: #F8F4FF; }
.activity-table td { padding: 12px 14px; color: #28104E; vertical-align: middle; }
.customer-cell { display: flex; align-items: center; gap: 8px; }
.avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg,#9754CB,#DEACF5); color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.service-type { font-weight: 600; }
.date-cell { color: rgba(255,255,255,0.7); white-space: nowrap; font-size: 12px; }
.fee-cell { font-weight: 700; color: #9754CB; }

.badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.badge-green { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
.badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

@media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .stat-grid { grid-template-columns: 1fr 1fr; } .two-col { grid-template-columns: 1fr; } .page-title { font-size: 22px; } }
@media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr; } }
</style>
