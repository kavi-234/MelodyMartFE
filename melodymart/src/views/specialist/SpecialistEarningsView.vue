<template>
  <div class="page">
    <div class="page-header"><div><h1 class="page-title">Earnings</h1><p class="page-subtitle">Track income from completed service requests.</p></div></div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading earnings...</p></div>
    <div v-else-if="error" class="error-state"><span>⚠️</span><p>{{ error }}</p><button @click="fetchEarnings" class="retry-btn">Retry</button></div>

    <div v-else>
      <div class="earnings-hero">
        <div class="hero-left">
          <div class="hero-label">Total Earnings</div>
          <div class="hero-amount">Rs {{ totalEarnings.toLocaleString() }}</div>
          <div class="hero-sub">From {{ history.length }} completed job{{ history.length !== 1 ? 's' : '' }}</div>
        </div>
        <div class="hero-icon">💰</div>
      </div>

      <div class="two-col">
        <div class="card">
          <h2 class="card-title">Monthly Earnings</h2>
          <div v-if="monthly.length === 0" class="empty-inner"><p>No earnings data yet.</p></div>
          <div v-else class="monthly-list">
            <div v-for="m in monthly" :key="m.key" class="monthly-row">
              <div class="month-label">{{ m.label }}</div>
              <div class="month-bar-wrap">
                <div class="month-bar" :style="{ width: barWidth(m.total) + '%' }"></div>
              </div>
              <div class="month-amount">Rs {{ m.total.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Earnings by Service Type</h2>
          <div v-if="byType.length === 0" class="empty-inner"><p>No earnings data yet.</p></div>
          <div v-else class="type-list">
            <div v-for="item in byType" :key="item.type" class="type-row">
              <div class="type-info">
                <div class="type-name">{{ item.type || 'Other' }}</div>
                <div class="type-count">{{ item.count }} job{{ item.count !== 1 ? 's' : '' }}</div>
              </div>
              <div class="type-total">Rs {{ item.total.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-6">
        <h2 class="card-title">Earnings History</h2>
        <div v-if="history.length === 0" class="empty-inner"><p>No completed jobs yet. Earnings appear here when you complete service requests.</p></div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service Type</th>
                <th>Completed On</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in history" :key="h._id" class="table-row">
                <td>
                  <div class="customer-cell">
                    <div class="avatar">{{ getInitials(h.customer?.name) }}</div>
                    <div><div class="cname">{{ h.customer?.name || 'Unknown' }}</div><div class="cemail">{{ h.customer?.email || '' }}</div></div>
                  </div>
                </td>
                <td class="type-cell">{{ h.serviceType || '—' }}</td>
                <td class="date-cell">{{ formatDate(h.completedAt) }}</td>
                <td class="amount-cell">Rs {{ h.serviceFee.toLocaleString() }}</td>
                <td><span class="badge badge-green">✓ Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const error = ref('')
const totalEarnings = ref(0)
const monthly = ref<any[]>([])
const byType = ref<any[]>([])
const history = ref<any[]>([])

const fetchEarnings = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/specialists/dashboard/earnings', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to load earnings')
    const data = await res.json()
    totalEarnings.value = data.totalEarnings || 0
    monthly.value = data.monthly || []
    byType.value = data.byType || []
    history.value = data.history || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const maxMonthly = () => Math.max(...monthly.value.map(m => m.total), 1)
const barWidth = (total: number) => Math.round((total / maxMonthly()) * 100)
const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

onMounted(fetchEarnings)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 30px; font-weight: 800; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.5px; }
.page-subtitle { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; }

.loading-state,.error-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.spinner { width: 44px; height: 44px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p,.error-state p { color: rgba(255,255,255,0.8); font-size: 14px; }
.retry-btn { padding: 9px 20px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.earnings-hero {
  display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(135deg, #9754CB, #6237A0);
  border-radius: 16px; padding: 28px 32px; margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(151,84,203,0.3);
}
.hero-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.75); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.hero-amount { font-size: 42px; font-weight: 900; color: white; letter-spacing: -1px; line-height: 1; }
.hero-sub { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 6px; }
.hero-icon { font-size: 56px; opacity: 0.85; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card { background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 24px; box-shadow: 0 4px 12px rgba(151,84,203,0.07); }
.mt-6 { margin-top: 20px; }
.card-title { font-size: 17px; font-weight: 700; color: #1b1030; margin: 0 0 18px; }

.empty-inner { padding: 24px; text-align: center; color: rgba(40,16,60,0.55); font-size: 13px; }

.monthly-list { display: flex; flex-direction: column; gap: 12px; }
.monthly-row { display: flex; align-items: center; gap: 12px; }
.month-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); min-width: 70px; }
.month-bar-wrap { flex: 1; background: rgba(151,84,203,0.08); border-radius: 4px; height: 10px; overflow: hidden; }
.month-bar { height: 100%; background: linear-gradient(90deg,#9754CB,#DEACF5); border-radius: 4px; transition: width 0.6s ease; }
.month-amount { font-size: 13px; font-weight: 700; color: #9754CB; min-width: 80px; text-align: right; }

.type-list { display: flex; flex-direction: column; gap: 12px; }
.type-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(151,84,203,0.04); border-radius: 10px; border: 1px solid rgba(151,84,203,0.1); }
.type-name { font-size: 13px; font-weight: 700; color: #1b1030; }
.type-count { font-size: 11px; color: rgba(40,16,60,0.55); margin-top: 2px; }
.type-total { font-size: 15px; font-weight: 800; color: #9754CB; }

.table-wrap { overflow-x: auto; border-radius: 10px; border: 1.5px solid #DEACF5; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table thead { background: linear-gradient(90deg,#9754CB,#DEACF5); }
.table th { padding: 12px 14px; color: white; font-weight: 700; text-align: left; font-size: 11px; text-transform: uppercase; white-space: nowrap; }
.table-row { border-bottom: 1px solid #E5D9F0; }
.table-row:hover { background: #F8F4FF; }
.table td { padding: 12px 14px; color: #28104E; vertical-align: middle; }
.customer-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#9754CB,#DEACF5); color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cname { font-weight: 700; font-size: 13px; color: #1b1030; }
.cemail { font-size: 11px; color: rgba(40,16,60,0.55); }
.type-cell { font-weight: 600; }
.date-cell { font-size: 12px; color: rgba(40,16,60,0.65); white-space: nowrap; }
.amount-cell { font-weight: 800; color: #9754CB; font-size: 14px; }
.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-green { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }

@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } .earnings-hero { padding: 20px; } .hero-amount { font-size: 32px; } .hero-icon { font-size: 40px; } .page-title { font-size: 22px; } }
</style>
