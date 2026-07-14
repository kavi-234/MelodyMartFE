<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-subtitle">Platform health &amp; key metrics</p>
      </div>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading dashboard...</p></div>
    <div v-else-if="error" class="state-box"><p class="err">{{ error }}</p><button @click="fetchStats" class="retry-btn">Retry</button></div>

    <div v-else>
      <!-- Stat cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrap coral">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Users</div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-sub">{{ stats.pendingApprovals }} pending approval</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap gold">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Earnings</div>
            <div class="stat-value">Rs {{ stats.totalEarnings.toLocaleString() }}</div>
            <div class="stat-sub">From all orders</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">{{ stats.totalOrders }}</div>
            <div class="stat-sub">{{ stats.pendingOrders }} pending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap copper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Instruments</div>
            <div class="stat-value">{{ stats.totalInstruments }}</div>
            <div class="stat-sub">For rent &amp; sale</div>
          </div>
        </div>
      </div>

      <div class="two-col">
        <!-- Pending approvals -->
        <div class="card">
          <h2 class="card-title">Pending Approvals</h2>
          <div v-if="pendingApprovals.length === 0" class="empty-inner"><p>No pending approvals</p></div>
          <div v-else class="approval-list">
            <div v-for="user in pendingApprovals" :key="user._id" class="approval-item">
              <div class="user-info">
                <div class="user-avatar">{{ getInitials(user.name) }}</div>
                <div>
                  <div class="uname">{{ user.name }}</div>
                  <div class="urole">{{ user.role }}</div>
                </div>
              </div>
              <div class="approval-actions">
                <button class="btn-approve" @click="approveUser(user._id)">Approve</button>
                <button class="btn-reject"  @click="rejectUser(user._id)">Reject</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent orders -->
        <div class="card">
          <h2 class="card-title">Recent Orders</h2>
          <div v-if="recentOrders.length === 0" class="empty-inner"><p>No recent orders</p></div>
          <div v-else class="order-list">
            <div v-for="order in recentOrders" :key="order._id" class="order-item">
              <div class="order-info">
                <div class="order-id">{{ order._id.slice(-6) }}</div>
                <div>
                  <div class="order-customer">{{ order.customer?.name || 'Unknown' }}</div>
                  <div class="order-date">{{ formatDate(order.createdAt) }}</div>
                </div>
              </div>
              <div class="order-amount">Rs {{ (order.totalAmount || order.price || 0).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity -->
      <div class="card mt">
        <h2 class="card-title">Platform Activity</h2>
        <div class="activity-grid">
          <div class="activity-item">
            <div class="activity-label">Users Today</div>
            <div class="activity-value coral">{{ stats.usersToday }}</div>
          </div>
          <div class="activity-item">
            <div class="activity-label">Orders This Week</div>
            <div class="activity-value gold">{{ stats.ordersThisWeek }}</div>
          </div>
          <div class="activity-item">
            <div class="activity-label">Avg Order Value</div>
            <div class="activity-value teal">Rs {{ stats.avgOrderValue.toLocaleString() }}</div>
          </div>
          <div class="activity-item">
            <div class="activity-label">System Health</div>
            <div class="activity-value emerald">Healthy</div>
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
const stats = ref({ totalUsers: 0, totalEarnings: 0, totalOrders: 0, totalInstruments: 0, pendingApprovals: 0, pendingOrders: 0, usersToday: 0, ordersThisWeek: 0, avgOrderValue: 0 })
const pendingApprovals = ref<any[]>([])
const recentOrders = ref<any[]>([])

const fetchStats = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to load stats')
    const data = await res.json()
    stats.value = data.stats || stats.value
    pendingApprovals.value = data.pendingApprovals || []
    recentOrders.value = data.recentOrders || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const approveUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:5000/api/admin/verify-user/${userId}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'APPROVED' }) })
    fetchStats()
  } catch (e: any) { error.value = e.message }
}

const rejectUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:5000/api/admin/verify-user/${userId}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) })
    fetchStats()
  } catch (e: any) { error.value = e.message }
}

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
onMounted(fetchStats)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3.75rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-coral); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.err { color: var(--mm-coral); }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-coral), #C04A3A); color: #fff; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

/* Stat cards */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
.stat-card { display: flex; gap: 1rem; align-items: flex-start; background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 1rem; padding: 1.25rem; transition: border-color 0.2s; }
.stat-card:hover { border-color: rgba(224,112,96,0.3); }
.stat-icon-wrap { width: 44px; height: 44px; border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon-wrap.coral   { background: rgba(224,112,96,0.12); color: var(--mm-coral); }
.stat-icon-wrap.gold    { background: rgba(212,168,83,0.12);  color: var(--mm-gold); }
.stat-icon-wrap.teal    { background: rgba(42,157,159,0.12);  color: var(--mm-teal); }
.stat-icon-wrap.copper  { background: rgba(192,123,80,0.12);  color: var(--mm-copper); }
.stat-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.25rem; }
.stat-value { font-family: 'DM Serif Display', serif; font-size: 1.75rem; font-weight: 400; color: var(--mm-ivory); line-height: 1.1; margin-bottom: 0.25rem; }
.stat-sub { font-size: 0.75rem; color: var(--mm-sand); }

/* Two col + cards */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.5rem; }
.mt { margin-top: 0; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1rem; }
.empty-inner { padding: 2.5rem 1rem; text-align: center; color: var(--mm-stone); font-size: 0.8125rem; }

/* Approvals */
.approval-list { display: flex; flex-direction: column; gap: 0.625rem; }
.approval-item { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem; background: rgba(224,112,96,0.04); border: 1px solid rgba(224,112,96,0.08); border-radius: 0.625rem; gap: 0.75rem; flex-wrap: wrap; }
.user-info { display: flex; gap: 0.75rem; align-items: center; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-coral), #C04A3A); color: #fff; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.uname { font-size: 0.8125rem; font-weight: 700; color: var(--mm-ivory); }
.urole { font-size: 0.6875rem; color: var(--mm-stone); margin-top: 1px; }
.approval-actions { display: flex; gap: 0.5rem; }
.btn-approve { padding: 0.375rem 0.875rem; background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); border-radius: 0.375rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.btn-approve:hover { background: rgba(56,168,130,0.2); }
.btn-reject  { padding: 0.375rem 0.875rem; background: rgba(224,112,96,0.1); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.375rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.btn-reject:hover { background: rgba(224,112,96,0.2); }

/* Orders */
.order-list { display: flex; flex-direction: column; gap: 0.625rem; }
.order-item { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem; background: rgba(212,168,83,0.04); border: 1px solid rgba(212,168,83,0.06); border-radius: 0.625rem; }
.order-info { display: flex; gap: 0.75rem; align-items: center; }
.order-id { background: rgba(224,112,96,0.12); color: var(--mm-coral); padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.6875rem; font-weight: 700; border: 1px solid rgba(224,112,96,0.2); }
.order-customer { font-size: 0.8125rem; font-weight: 700; color: var(--mm-ivory); }
.order-date { font-size: 0.6875rem; color: var(--mm-stone); margin-top: 1px; }
.order-amount { font-size: 0.9375rem; font-weight: 800; color: var(--mm-gold); white-space: nowrap; }

/* Activity */
.activity-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.activity-item { padding: 1rem; background: rgba(224,112,96,0.04); border: 1px solid rgba(224,112,96,0.08); border-radius: 0.625rem; }
.activity-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.375rem; }
.activity-value { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; }
.activity-value.coral   { color: var(--mm-coral); }
.activity-value.gold    { color: var(--mm-gold); }
.activity-value.teal    { color: var(--mm-teal); }
.activity-value.emerald { color: var(--mm-emerald); }

@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .activity-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: 1fr; } .approval-item { flex-direction: column; align-items: flex-start; } .approval-actions { width: 100%; } .btn-approve, .btn-reject { flex: 1; } }
</style>
