<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Orders &amp; Payments</h1>
        <p class="page-subtitle">Manage transactions and payment disputes</p>
      </div>
      <div class="header-controls">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="Search order ID..." />
        </div>
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading orders...</p></div>
    <div v-else-if="error" class="state-box"><p class="err">{{ error }}</p><button @click="fetchOrders" class="retry-btn">Retry</button></div>

    <div v-else>
      <div class="stats-bar">
        <div class="stat">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value gold">Rs {{ stats.totalRevenue.toLocaleString() }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Completed</div>
          <div class="stat-value emerald">{{ stats.completedCount }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Pending</div>
          <div class="stat-value amber">{{ stats.pendingCount }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Failed / Refunded</div>
          <div class="stat-value coral">{{ stats.failedCount }}</div>
        </div>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order._id" class="table-row">
                <td class="id-cell">{{ order._id.slice(-8) }}</td>
                <td>
                  <div class="user-cell">
                    <div class="avatar">{{ getInitials(order.customer?.name) }}</div>
                    <div>
                      <div class="user-name">{{ order.customer?.name || 'Unknown' }}</div>
                      <div class="user-email">{{ order.customer?.email || '' }}</div>
                    </div>
                  </div>
                </td>
                <td class="type-cell">{{ order.type || '—' }}</td>
                <td class="amount-cell">Rs {{ order.totalAmount?.toLocaleString() || '0' }}</td>
                <td><span class="badge" :class="`status-${getStatusClass(order.status)}`">{{ formatStatus(order.status) }}</span></td>
                <td class="date-cell">{{ formatDate(order.createdAt) }}</td>
                <td>
                  <div class="actions-cell">
                    <button class="action-btn view" @click="viewOrder(order._id)" title="View">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button v-if="order.status === 'completed'" class="action-btn refund" @click="refundOrder(order._id)" title="Refund">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                    </button>
                    <button v-if="order.status === 'pending'" class="action-btn complete" @click="completeOrder(order._id)" title="Complete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="7" class="empty-row">No orders found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const loading = ref(false)
const error = ref('')
const orders = ref<any[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const stats = ref({ totalRevenue: 0, completedCount: 0, pendingCount: 0, failedCount: 0 })

const filteredOrders = computed(() => orders.value.filter(o => {
  const matchSearch = !searchQuery.value || o._id.includes(searchQuery.value)
  const matchStatus = !filterStatus.value || o.status === filterStatus.value
  return matchSearch && matchStatus
}))

const fetchOrders = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to load orders')
    const data = await res.json()
    orders.value = data.orders || []
    stats.value = data.stats || stats.value
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const viewOrder    = (id: string) => alert(`View order ${id} — detailed view coming soon`)
const refundOrder  = async (orderId: string) => { if (!confirm('Refund this order?')) return; try { const token = localStorage.getItem('token'); await fetch(`http://localhost:5000/api/admin/orders/${orderId}/refund`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }); fetchOrders() } catch (e: any) { error.value = e.message } }
const completeOrder = async (orderId: string) => { try { const token = localStorage.getItem('token'); await fetch(`http://localhost:5000/api/admin/orders/${orderId}/complete`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }); fetchOrders() } catch (e: any) { error.value = e.message } }
const getStatusClass = (status: string) => status === 'completed' ? 'completed' : status === 'pending' ? 'pending' : 'failed'
const formatStatus = (status: string) => ({ completed: 'Completed', pending: 'Pending', failed: 'Failed', refunded: 'Refunded' }[status] || status)
const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate  = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
onMounted(fetchOrders)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.header-controls { display: flex; gap: 0.75rem; flex-shrink: 0; }
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--mm-stone); pointer-events: none; }
.search-input { padding: 0.5625rem 0.875rem 0.5625rem 2.25rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; width: 200px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.search-input::placeholder { color: var(--mm-stone); }
.search-input:focus { border-color: var(--mm-coral); }
.filter-select { padding: 0.5625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.filter-select:focus { border-color: var(--mm-coral); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3.75rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-coral); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.err { color: var(--mm-coral); }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-coral), #C04A3A); color: #fff; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
.stat { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.125rem 1.25rem; }
.stat-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.375rem; }
.stat-value { font-family: 'DM Serif Display', serif; font-size: 1.625rem; font-weight: 400; }
.stat-value.gold    { color: var(--mm-gold); }
.stat-value.emerald { color: var(--mm-emerald); }
.stat-value.amber   { color: #D4A853; }
.stat-value.coral   { color: var(--mm-coral); }

.card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; overflow: hidden; }
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.table thead { background: rgba(224,112,96,0.06); border-bottom: 1px solid var(--mm-warm-line); }
.table th { padding: 0.75rem 1rem; color: var(--mm-coral); font-weight: 700; text-align: left; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.table-row { border-bottom: 1px solid var(--mm-warm-line); transition: background 0.15s; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(224,112,96,0.03); }
.table td { padding: 0.75rem 1rem; color: var(--mm-ivory); vertical-align: middle; }

.id-cell { font-family: monospace; font-weight: 700; color: var(--mm-coral); font-size: 0.75rem; }
.user-cell { display: flex; align-items: center; gap: 0.625rem; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-coral), #C04A3A); color: #fff; font-size: 0.6875rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name  { font-weight: 700; font-size: 0.8125rem; color: var(--mm-ivory); }
.user-email { font-size: 0.6875rem; color: var(--mm-stone); }
.type-cell   { font-weight: 600; color: var(--mm-cream); font-size: 0.75rem; }
.amount-cell { font-weight: 800; color: var(--mm-gold); }
.date-cell   { font-size: 0.75rem; color: var(--mm-sand); white-space: nowrap; }
.empty-row { text-align: center; padding: 3rem; color: var(--mm-stone); font-size: 0.875rem; }

.badge { display: inline-flex; align-items: center; padding: 0.2rem 0.5625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.status-completed { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.status-pending   { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.status-failed    { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

.actions-cell { display: flex; gap: 0.375rem; }
.action-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; border-radius: 0.375rem; transition: all 0.2s; }
.action-btn.view     { color: var(--mm-teal); }
.action-btn.view:hover { background: rgba(42,157,159,0.12); }
.action-btn.refund   { color: var(--mm-coral); }
.action-btn.refund:hover { background: rgba(224,112,96,0.12); }
.action-btn.complete { color: var(--mm-emerald); }
.action-btn.complete:hover { background: rgba(56,168,130,0.12); }

@media (max-width: 1024px) { .stats-bar { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; } .header-controls { width: 100%; flex-wrap: wrap; } .search-input { width: 100%; } .stats-bar { grid-template-columns: repeat(2, 1fr); } }
</style>
