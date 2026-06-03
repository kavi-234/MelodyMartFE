<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Orders & Payments</h1>
        <p class="page-subtitle">Manage transactions and payment disputes</p>
      </div>
      <div class="header-controls">
        <input v-model="searchQuery" type="text" class="search-input" placeholder="Search order ID..." />
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading orders...</p></div>
    <div v-else-if="error" class="error-state"><span>⚠️</span><p>{{ error }}</p><button @click="fetchOrders" class="retry-btn">Retry</button></div>

    <div v-else>
      <div class="stats-bar">
        <div class="stat">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">Rs {{ stats.totalRevenue.toLocaleString() }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Completed Orders</div>
          <div class="stat-value">{{ stats.completedCount }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Pending Orders</div>
          <div class="stat-value">{{ stats.pendingCount }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Failed/Refunded</div>
          <div class="stat-value">{{ stats.failedCount }}</div>
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
                <td>
                  <span class="badge" :class="`badge-${getStatusClass(order.status)}`">
                    {{ formatStatus(order.status) }}
                  </span>
                </td>
                <td class="date-cell">{{ formatDate(order.createdAt) }}</td>
                <td class="actions-cell">
                  <button class="action-btn view" @click="viewOrder(order._id)" title="View">👁</button>
                  <button v-if="order.status === 'completed'" class="action-btn refund" @click="refundOrder(order._id)" title="Refund">⤴</button>
                  <button v-if="order.status === 'pending'" class="action-btn complete" @click="completeOrder(order._id)" title="Complete">✓</button>
                </td>
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
const stats = ref({
  totalRevenue: 0,
  completedCount: 0,
  pendingCount: 0,
  failedCount: 0,
})

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    const matchSearch = !searchQuery.value || o._id.includes(searchQuery.value)
    const matchStatus = !filterStatus.value || o.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const fetchOrders = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load orders')
    const data = await res.json()
    orders.value = data.orders || []
    stats.value = data.stats || stats.value
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const viewOrder = (orderId: string) => {
  alert(`View order ${orderId} - detailed view coming soon`)
}

const refundOrder = async (orderId: string) => {
  if (!confirm('Are you sure you want to refund this order?')) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/refund`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to refund')
    fetchOrders()
  } catch (e: any) { error.value = e.message }
}

const completeOrder = async (orderId: string) => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to complete')
    fetchOrders()
  } catch (e: any) { error.value = e.message }
}

const getStatusClass = (status: string) => {
  if (status === 'completed') return 'completed'
  if (status === 'pending') return 'pending'
  return 'failed'
}

const formatStatus = (status: string) => {
  const map: any = {
    completed: '✓ Completed',
    pending: '⏳ Pending',
    failed: '✗ Failed',
    refunded: '↩ Refunded'
  }
  return map[status] || status
}

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

onMounted(fetchOrders)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 30px; font-weight: 800; color: #ffffff; margin: 0 0 4px; }
.page-subtitle { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; }

.header-controls { display: flex; gap: 12px; flex: 1; max-width: 400px; }
.search-input, .filter-select {
  flex: 1; padding: 9px 12px; border: 2px solid #DEACF5; border-radius: 8px;
  background: white; color: #1b1030; font-size: 13px;
}
.search-input::placeholder { color: rgba(40,16,60,0.4); }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.spinner { width: 44px; height: 44px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.error-state p { color: rgba(255,255,255,0.8); font-size: 14px; }
.retry-btn { padding: 9px 20px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat { background: linear-gradient(135deg, rgba(151,84,203,0.1), rgba(222,172,245,0.08)); border: 2px solid #DEACF5; border-radius: 12px; padding: 16px; }
.stat-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; }
.stat-value { font-size: 24px; font-weight: 800; color: #ffffff; margin-top: 6px; }

.card { background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 0; box-shadow: 0 4px 12px rgba(151,84,203,0.07); overflow: hidden; }
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table thead { background: linear-gradient(90deg,#9754CB,#DEACF5); }
.table th { padding: 12px 14px; color: white; font-weight: 700; text-align: left; font-size: 11px; text-transform: uppercase; white-space: nowrap; }
.table-row { border-bottom: 1px solid #E5D9F0; }
.table-row:hover { background: #F8F4FF; }
.table td { padding: 12px 14px; color: #28104E; }

.id-cell { font-family: monospace; font-weight: 700; color: #9754CB; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#9754CB,#DEACF5); color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name { font-weight: 700; font-size: 13px; color: #1b1030; }
.user-email { font-size: 11px; color: rgba(40,16,60,0.55); }
.type-cell { font-weight: 600; }
.amount-cell { font-weight: 800; color: #9754CB; }
.date-cell { font-size: 12px; color: rgba(40,16,60,0.65); white-space: nowrap; }

.badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.badge-completed { background: #d1fae5; color: #065f46; }
.badge-pending { background: #fef3c7; color: #b45309; }
.badge-failed { background: #fee2e2; color: #7f1d1d; }

.actions-cell { display: flex; gap: 6px; }
.action-btn { border: none; background: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; transition: all 0.2s; }
.action-btn.view:hover { background: #dbeafe; }
.action-btn.refund:hover { background: #fee2e2; }
.action-btn.complete:hover { background: #d1fae5; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: start; }
  .header-controls { width: 100%; max-width: none; }
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
  .table { font-size: 12px; }
  .table th, .table td { padding: 8px 10px; }
}
</style>
