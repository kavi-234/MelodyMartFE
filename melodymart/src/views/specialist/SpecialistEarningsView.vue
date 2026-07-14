<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Earnings</h1>
        <p class="page-subtitle">Track income from completed service requests.</p>
      </div>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading earnings...</p></div>
    <div v-else-if="error" class="state-box"><p class="err">{{ error }}</p><button @click="fetchEarnings" class="retry-btn">Retry</button></div>

    <div v-else>
      <div class="earnings-hero">
        <div class="hero-glow" />
        <div class="hero-left">
          <div class="hero-label">Total Earnings</div>
          <div class="hero-amount">Rs {{ totalEarnings.toLocaleString() }}</div>
          <div class="hero-sub">From {{ history.length }} completed job{{ history.length !== 1 ? 's' : '' }}</div>
        </div>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--mm-copper);opacity:0.4">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      </div>

      <div class="two-col">
        <div class="card">
          <h2 class="card-title">Monthly Earnings</h2>
          <div v-if="monthly.length === 0" class="empty-inner"><p>No earnings data yet.</p></div>
          <div v-else class="monthly-list">
            <div v-for="m in monthly" :key="m.key" class="monthly-row">
              <div class="month-label">{{ m.label }}</div>
              <div class="month-bar-wrap"><div class="month-bar" :style="{ width: barWidth(m.total) + '%' }"></div></div>
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

      <div class="card mt">
        <h2 class="card-title">Earnings History</h2>
        <div v-if="history.length === 0" class="empty-inner"><p>No completed jobs yet. Earnings appear here when you complete service requests.</p></div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead><tr><th>Customer</th><th>Service Type</th><th>Completed On</th><th>Amount</th><th>Status</th></tr></thead>
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
                <td><span class="badge badge-emerald">Completed</span></td>
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
    totalEarnings.value = data.totalEarnings || 0; monthly.value = data.monthly || []; byType.value = data.byType || []; history.value = data.history || []
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
.page-header { margin-bottom: 1.5rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3.75rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-copper); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.err { color: var(--mm-coral); }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.earnings-hero {
  position: relative; overflow: hidden;
  display: flex; justify-content: space-between; align-items: center;
  background: var(--mm-onyx); border: 1px solid var(--mm-warm-line);
  border-radius: 1rem; padding: 1.75rem 2rem; margin-bottom: 1.25rem;
}
.hero-glow { position: absolute; top: -40px; left: -40px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(192,123,80,0.15) 0%, transparent 70%); pointer-events: none; }
.hero-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.375rem; }
.hero-amount { font-family: 'DM Serif Display', serif; font-size: 2.5rem; font-weight: 400; color: var(--mm-copper); letter-spacing: -0.02em; line-height: 1; margin-bottom: 0.5rem; }
.hero-sub { font-size: 0.8125rem; color: var(--mm-sand); }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.5rem; }
.mt { margin-top: 0; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1rem; }
.empty-inner { padding: 2rem 1rem; text-align: center; color: var(--mm-stone); font-size: 0.8125rem; }

.monthly-list { display: flex; flex-direction: column; gap: 0.75rem; }
.monthly-row { display: flex; align-items: center; gap: 0.75rem; }
.month-label { font-size: 0.75rem; font-weight: 600; color: var(--mm-sand); min-width: 70px; }
.month-bar-wrap { flex: 1; background: var(--mm-mist); border-radius: 4px; height: 8px; overflow: hidden; }
.month-bar { height: 100%; background: linear-gradient(90deg, var(--mm-copper), #E09060); border-radius: 4px; transition: width 0.6s ease; }
.month-amount { font-size: 0.8125rem; font-weight: 700; color: var(--mm-copper); min-width: 80px; text-align: right; }

.type-list { display: flex; flex-direction: column; gap: 0.625rem; }
.type-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0.875rem; background: rgba(192,123,80,0.04); border: 1px solid rgba(192,123,80,0.08); border-radius: 0.625rem; }
.type-name  { font-size: 0.875rem; font-weight: 700; color: var(--mm-ivory); }
.type-count { font-size: 0.6875rem; color: var(--mm-stone); margin-top: 2px; }
.type-total { font-size: 1rem; font-weight: 800; color: var(--mm-copper); white-space: nowrap; margin-left: 1rem; }

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
.cname { font-weight: 700; font-size: 0.8125rem; color: var(--mm-ivory); }
.cemail { font-size: 0.6875rem; color: var(--mm-stone); }
.type-cell { font-weight: 600; color: var(--mm-cream); }
.date-cell { font-size: 0.75rem; color: var(--mm-sand); white-space: nowrap; }
.amount-cell { font-weight: 800; color: var(--mm-copper); }
.badge { display: inline-flex; align-items: center; padding: 0.2rem 0.5625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.badge-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }

@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } .earnings-hero { padding: 1.25rem; } .hero-amount { font-size: 2rem; } }
</style>
