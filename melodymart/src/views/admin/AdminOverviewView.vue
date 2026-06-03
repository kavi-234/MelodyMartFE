<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-subtitle">Platform health & key metrics</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading dashboard...</p></div>
    <div v-else-if="error" class="error-state"><span>⚠️</span><p>{{ error }}</p><button @click="fetchStats" class="retry-btn">Retry</button></div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-label">Total Users</div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-sub">{{ stats.pendingApprovals }} pending approval</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div class="stat-info">
            <div class="stat-label">Total Earnings</div>
            <div class="stat-value">Rs {{ stats.totalEarnings.toLocaleString() }}</div>
            <div class="stat-sub">From all orders</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">{{ stats.totalOrders }}</div>
            <div class="stat-sub">{{ stats.pendingOrders }} pending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎸</div>
          <div class="stat-info">
            <div class="stat-label">Instruments</div>
            <div class="stat-value">{{ stats.totalInstruments }}</div>
            <div class="stat-sub">Available for rent & sale</div>
          </div>
        </div>
      </div>

      <div class="two-col">
        <div class="card">
          <h2 class="card-title">Pending Approvals</h2>
          <div v-if="pendingApprovals.length === 0" class="empty-state">
            <p>No pending approvals</p>
          </div>
          <div v-else class="approval-list">
            <div v-for="user in pendingApprovals" :key="user._id" class="approval-item">
              <div class="user-info">
                <div class="user-avatar">{{ getInitials(user.name) }}</div>
                <div>
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-role">{{ user.role }}</div>
                </div>
              </div>
              <div class="approval-actions">
                <button class="btn btn-approve" @click="approveUser(user._id)">Approve</button>
                <button class="btn btn-reject" @click="rejectUser(user._id)">Reject</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Recent Orders</h2>
          <div v-if="recentOrders.length === 0" class="empty-state">
            <p>No recent orders</p>
          </div>
          <div v-else class="order-list">
            <div v-for="order in recentOrders" :key="order._id" class="order-item">
              <div class="order-info">
                <div class="order-id">{{ order._id.slice(-6) }}</div>
                <div>
                  <div class="order-customer">{{ order.customer?.name || 'Unknown' }}</div>
                  <div class="order-date">{{ formatDate(order.createdAt) }}</div>
                </div>
              </div>
              <div class="order-amount">Rs {{ order.totalAmount.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-6">
        <h2 class="card-title">Platform Activity</h2>
        <div class="activity-grid">
          <div class="activity-item">
            <div class="activity-label">Users Registered Today</div>
            <div class="activity-value">{{ stats.usersToday }}</div>
          </div>
          <div class="activity-item">
            <div class="activity-label">Orders This Week</div>
            <div class="activity-value">{{ stats.ordersThisWeek }}</div>
          </div>
          <div class="activity-item">
            <div class="activity-label">Avg Order Value</div>
            <div class="activity-value">Rs {{ stats.avgOrderValue.toLocaleString() }}</div>
          </div>
          <div class="activity-item">
            <div class="activity-label">System Health</div>
            <div class="activity-value">✓ Healthy</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const error = ref('')
const stats = ref({
  totalUsers: 0,
  totalEarnings: 0,
  totalOrders: 0,
  totalInstruments: 0,
  pendingApprovals: 0,
  pendingOrders: 0,
  usersToday: 0,
  ordersThisWeek: 0,
  avgOrderValue: 0,
})
const pendingApprovals = ref<any[]>([])
const recentOrders = ref<any[]>([])

const fetchStats = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load stats')
    const data = await res.json()
    stats.value = data.stats || stats.value
    pendingApprovals.value = data.pendingApprovals || []
    recentOrders.value = data.recentOrders || []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const approveUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('Failed to approve user')
    fetchStats()
  } catch (e: any) { error.value = e.message }
}

const rejectUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('Failed to reject user')
    fetchStats()
  } catch (e: any) { error.value = e.message }
}

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

onMounted(fetchStats)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 30px; font-weight: 800; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.5px; }
.page-subtitle { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.spinner { width: 44px; height: 44px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.error-state p { color: rgba(255,255,255,0.8); font-size: 14px; }
.retry-btn { padding: 9px 20px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card {
  display: flex; gap: 16px; align-items: start;
  background: linear-gradient(135deg, rgba(151,84,203,0.1), rgba(222,172,245,0.08));
  border: 2px solid #DEACF5; border-radius: 14px; padding: 20px;
  box-shadow: 0 4px 12px rgba(151,84,203,0.06);
}
.stat-icon { font-size: 36px; }
.stat-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 28px; font-weight: 800; color: #ffffff; margin: 4px 0; }
.stat-sub { font-size: 12px; color: rgba(255,255,255,0.6); }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card { background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(151,84,203,0.07); }
.mt-6 { margin-top: 20px; }
.card-title { font-size: 17px; font-weight: 700; color: #1b1030; margin: 0 0 18px; }

.empty-state { padding: 40px 20px; text-align: center; color: rgba(40,16,60,0.55); font-size: 13px; }

.approval-list { display: flex; flex-direction: column; gap: 12px; }
.approval-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; background: rgba(151,84,203,0.04); border-radius: 10px; border: 1px solid rgba(151,84,203,0.1); }
.user-info { display: flex; gap: 12px; align-items: center; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#9754CB,#DEACF5); color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.user-name { font-size: 13px; font-weight: 700; color: #1b1030; }
.user-role { font-size: 11px; color: rgba(40,16,60,0.55); }
.approval-actions { display: flex; gap: 8px; }
.btn { padding: 6px 12px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-approve { background: #d1fae5; color: #065f46; }
.btn-approve:hover { background: #a7f3d0; }
.btn-reject { background: #fee2e2; color: #7f1d1d; }
.btn-reject:hover { background: #fecaca; }

.order-list { display: flex; flex-direction: column; gap: 12px; }
.order-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; background: rgba(151,84,203,0.04); border-radius: 10px; border: 1px solid rgba(151,84,203,0.1); }
.order-info { display: flex; gap: 12px; align-items: center; }
.order-id { background: #9754CB; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.order-customer { font-size: 13px; font-weight: 700; color: #1b1030; }
.order-date { font-size: 11px; color: rgba(40,16,60,0.55); }
.order-amount { font-size: 14px; font-weight: 800; color: #9754CB; }

.activity-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.activity-item { padding: 16px; background: rgba(151,84,203,0.04); border-radius: 10px; border: 1px solid rgba(151,84,203,0.1); }
.activity-label { font-size: 12px; font-weight: 600; color: rgba(40,16,60,0.65); }
.activity-value { font-size: 22px; font-weight: 800; color: #9754CB; margin-top: 6px; }

@media (max-width: 768px) {
  .two-col { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
  .approval-item { flex-direction: column; align-items: start; gap: 12px; }
  .approval-actions { width: 100%; }
  .btn { flex: 1; }
}
</style>
