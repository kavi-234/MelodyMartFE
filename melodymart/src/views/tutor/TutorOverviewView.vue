<template>
  <div class="t-page">
    <!-- Ambient glow -->
    <div class="t-glow" aria-hidden="true" />

    <!-- Header row -->
    <div class="t-header">
      <div>
        <p class="t-greeting">{{ greeting() }}</p>
        <h1 class="t-title font-serif">{{ authStore.user?.name?.split(' ')[0] || 'Tutor' }}<span class="t-note"> ♪</span></h1>
        <p class="t-sub">Here's your teaching activity at a glance.</p>
      </div>
      <RouterLink to="/dashboard/tutor/create-lesson" class="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Create Lesson
      </RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="t-loading">
      <div class="t-spinner" />
      <p class="text-mm-sand text-sm">Loading dashboard…</p>
    </div>

    <div v-else>
      <!-- Stat cards -->
      <div class="t-stat-grid">
        <div class="t-stat-card" v-for="s in statCards" :key="s.label">
          <div class="t-stat-icon" :style="{ background: s.bg }">
            <span v-html="s.icon" />
          </div>
          <div>
            <div class="t-stat-value" :style="{ color: s.color }">{{ s.value }}</div>
            <div class="t-stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- Profile + Quick Actions -->
      <div class="t-two-col">
        <!-- Profile summary -->
        <div class="t-card">
          <div class="t-card-header">
            <h2 class="t-card-title font-serif">Profile Summary</h2>
            <span class="t-status-chip" :class="statusChipClass">{{ statusLabel }}</span>
          </div>
          <div class="t-profile-grid">
            <div class="t-profile-item">
              <span class="t-profile-label">Specialization</span>
              <span class="t-profile-value">{{ authStore.user?.specialization || '—' }}</span>
            </div>
            <div class="t-profile-item">
              <span class="t-profile-label">Experience</span>
              <span class="t-profile-value">{{ authStore.user?.experience ? authStore.user.experience + ' yrs' : '—' }}</span>
            </div>
            <div class="t-profile-item">
              <span class="t-profile-label">Hourly Rate</span>
              <span class="t-profile-value">{{ authStore.user?.hourlyRate ? 'Rs ' + authStore.user.hourlyRate + '/hr' : '—' }}</span>
            </div>
            <div class="t-profile-item">
              <span class="t-profile-label">Verification</span>
              <span class="t-profile-value" :style="{ color: statusColor }">{{ statusLabel }}</span>
            </div>
          </div>
          <RouterLink to="/dashboard/tutor/profile" class="t-card-link">Edit Profile →</RouterLink>
        </div>

        <!-- Quick actions -->
        <div class="t-card">
          <h2 class="t-card-title font-serif">Quick Actions</h2>
          <div class="t-quick-list">
            <RouterLink v-for="a in quickActions" :key="a.path" :to="a.path" class="t-quick-btn">
              <div class="t-quick-icon" :style="{ background: a.bg }">
                <span v-html="a.icon" />
              </div>
              <div>
                <div class="t-quick-label">{{ a.label }}</div>
                <div class="t-quick-desc">{{ a.desc }}</div>
              </div>
              <svg class="t-quick-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Recent bookings -->
      <div class="t-card t-mt">
        <div class="t-card-header">
          <h2 class="t-card-title font-serif">Recent Bookings</h2>
          <RouterLink v-if="recentBookings.length > 0" to="/dashboard/tutor/bookings" class="t-card-link">View all →</RouterLink>
        </div>

        <div v-if="recentBookings.length === 0" class="t-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--mm-stone); margin-bottom: 0.75rem;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>No bookings yet. Publish your lessons to get students!</p>
        </div>

        <div v-else class="t-table-wrap">
          <table class="t-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Lesson</th>
                <th>Booked On</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in recentBookings" :key="b._id" class="t-row">
                <td>
                  <div class="t-student">
                    <div class="t-avatar">{{ getInitials(b.student?.name) }}</div>
                    <span>{{ b.student?.name || 'Unknown' }}</span>
                  </div>
                </td>
                <td class="t-lesson-name">{{ b.lesson?.title || '—' }}</td>
                <td class="t-date">{{ formatDate(b.createdAt) }}</td>
                <td><span class="t-badge" :class="payBadge(b.paymentStatus)">{{ b.paymentStatus }}</span></td>
                <td><span class="t-badge" :class="statusBadge(b.bookingStatus)">{{ b.bookingStatus }}</span></td>
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
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading   = ref(true)
const stats     = ref({ totalLessons: 0, totalBookings: 0, totalStudents: 0, totalEarnings: 0 })
const recentBookings = ref<any[]>([])

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const statusLabel = computed(() => {
  const s = authStore.user?.verificationStatus
  if (s === 'APPROVED') return 'Verified'
  if (s === 'REJECTED') return 'Rejected'
  return 'Pending'
})
const statusChipClass = computed(() => {
  const s = authStore.user?.verificationStatus
  if (s === 'APPROVED') return 'chip-emerald'
  if (s === 'REJECTED') return 'chip-coral'
  return 'chip-amber'
})
const statusColor = computed(() => {
  const s = authStore.user?.verificationStatus
  if (s === 'APPROVED') return 'var(--mm-emerald)'
  if (s === 'REJECTED') return 'var(--mm-coral)'
  return '#F59E0B'
})

const statCards = computed(() => [
  {
    label: 'Total Lessons', value: stats.value.totalLessons,
    color: 'var(--mm-gold-lt)', bg: 'rgba(212,168,83,0.12)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A853" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  },
  {
    label: 'Total Bookings', value: stats.value.totalBookings,
    color: 'var(--mm-teal)', bg: 'rgba(42,157,159,0.12)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A9D9F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  },
  {
    label: 'Total Students', value: stats.value.totalStudents,
    color: 'var(--mm-emerald)', bg: 'rgba(56,168,130,0.12)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38A882" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  },
  {
    label: 'Total Earnings', value: `Rs ${stats.value.totalEarnings.toLocaleString()}`,
    color: 'var(--mm-copper)', bg: 'rgba(192,123,80,0.12)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C07B50" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
  },
])

const quickActions = [
  { label: 'Create New Lesson', desc: 'Publish a lesson for students', path: '/dashboard/tutor/create-lesson', bg: 'rgba(212,168,83,0.1)', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A853" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>` },
  { label: 'Manage Lessons',    desc: 'Edit or remove your lessons',  path: '/dashboard/tutor/lessons',       bg: 'rgba(42,157,159,0.1)', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A9D9F" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>` },
  { label: 'View Bookings',     desc: 'Manage student bookings',      path: '/dashboard/tutor/bookings',      bg: 'rgba(56,168,130,0.1)', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38A882" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { label: 'View Earnings',     desc: 'Track your revenue',           path: '/dashboard/tutor/earnings',      bg: 'rgba(192,123,80,0.1)', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C07B50" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>` },
]

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/tutors/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      stats.value = data.stats
      recentBookings.value = data.recentBookings || []
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

const payBadge = (s: string) => ({ 'badge-emerald': s === 'Paid', 'badge-amber': s === 'Pending', 'badge-coral': s === 'Failed' })
const statusBadge = (s: string) => ({
  'badge-emerald': s === 'Confirmed' || s === 'Completed',
  'badge-amber': s === 'Pending Payment',
  'badge-coral': s === 'Cancelled',
})

onMounted(fetchStats)
</script>

<style scoped>
.t-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  position: relative;
}
.t-glow {
  position: fixed; top: 0; right: 0;
  width: 500px; height: 300px; pointer-events: none;
  background: radial-gradient(ellipse, rgba(212,168,83,0.04) 0%, transparent 70%);
  filter: blur(60px);
}

/* Header */
.t-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 1rem; flex-wrap: wrap;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--mm-warm-line);
}
.t-greeting { font-size: 0.8rem; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; margin-bottom: 0.25rem; }
.t-title   { font-size: 2rem; color: var(--mm-ivory); line-height: 1.1; }
.t-note    { color: var(--mm-gold); }
.t-sub     { font-size: 0.875rem; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; margin-top: 0.25rem; }

/* Loading */
.t-loading { display: flex; flex-direction: column; align-items: center; padding: 5rem 0; gap: 1rem; }
.t-spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--mm-warm-line);
  border-top-color: var(--mm-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Stat grid */
.t-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.t-stat-card {
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex; align-items: center; gap: 1rem;
  transition: all 0.25s ease;
}
.t-stat-card:hover {
  border-color: rgba(212,168,83,0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.t-stat-icon {
  width: 46px; height: 46px; border-radius: 0.75rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.t-stat-value { font-size: 1.6rem; font-weight: 700; line-height: 1.1; font-family: 'DM Serif Display', serif; }
.t-stat-label { font-size: 0.7rem; font-weight: 600; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.15rem; font-family: 'DM Sans', sans-serif; }

/* Cards */
.t-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.t-mt { margin-top: 1.25rem; }
.t-card {
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  border-radius: 1.25rem;
  padding: 1.5rem;
}
.t-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.t-card-title { font-size: 1.05rem; color: var(--mm-ivory); }
.t-card-link { font-size: 0.8rem; color: var(--mm-gold); font-weight: 600; text-decoration: none; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
.t-card-link:hover { color: var(--mm-gold-lt); }

.t-status-chip {
  display: inline-flex; align-items: center; padding: 0.2rem 0.65rem;
  border-radius: 2rem; font-size: 0.72rem; font-weight: 700; border: 1px solid;
  font-family: 'DM Sans', sans-serif;
}
.chip-emerald { background: rgba(56,168,130,0.1); border-color: rgba(56,168,130,0.25); color: var(--mm-emerald); }
.chip-coral   { background: rgba(224,112,96,0.1); border-color: rgba(224,112,96,0.25); color: var(--mm-coral); }
.chip-amber   { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #F59E0B; }

/* Profile grid */
.t-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; margin-bottom: 1.25rem; }
.t-profile-item { display: flex; flex-direction: column; gap: 0.2rem; }
.t-profile-label { font-size: 0.65rem; font-weight: 700; color: var(--mm-gold); text-transform: uppercase; letter-spacing: 0.1em; font-family: 'DM Sans', sans-serif; }
.t-profile-value { font-size: 0.9rem; font-weight: 600; color: var(--mm-ivory); font-family: 'DM Sans', sans-serif; }

/* Quick actions */
.t-quick-list { display: flex; flex-direction: column; gap: 0.5rem; }
.t-quick-btn {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 0.875rem; border-radius: 0.75rem;
  border: 1px solid var(--mm-warm-line); background: transparent;
  text-decoration: none; color: var(--mm-ivory);
  transition: all 0.2s ease;
}
.t-quick-btn:hover { background: var(--mm-onyx); border-color: rgba(212,168,83,0.2); transform: translateX(3px); }
.t-quick-icon {
  width: 34px; height: 34px; border-radius: 0.6rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.t-quick-label { font-size: 0.875rem; font-weight: 600; color: var(--mm-ivory); font-family: 'DM Sans', sans-serif; }
.t-quick-desc  { font-size: 0.72rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; margin-top: 0.05rem; }
.t-quick-arrow { color: var(--mm-stone); margin-left: auto; flex-shrink: 0; transition: transform 0.2s; }
.t-quick-btn:hover .t-quick-arrow { transform: translateX(3px); color: var(--mm-gold-lt); }

/* Table */
.t-empty { display: flex; flex-direction: column; align-items: center; padding: 2.5rem 1rem; text-align: center; }
.t-empty p { font-size: 0.875rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }

.t-table-wrap { overflow-x: auto; border-radius: 0.75rem; border: 1px solid var(--mm-warm-line); }
.t-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.t-table thead { background: rgba(212,168,83,0.06); }
.t-table th {
  padding: 0.75rem 1rem; color: var(--mm-gold); font-weight: 700;
  text-align: left; font-size: 0.68rem; text-transform: uppercase;
  letter-spacing: 0.08em; font-family: 'DM Sans', sans-serif;
  border-bottom: 1px solid var(--mm-warm-line);
}
.t-row { border-bottom: 1px solid var(--mm-warm-line); transition: background 0.15s; }
.t-row:last-child { border-bottom: none; }
.t-row:hover { background: rgba(255,255,255,0.02); }
.t-table td { padding: 0.875rem 1rem; color: var(--mm-ivory); vertical-align: middle; font-family: 'DM Sans', sans-serif; }
.t-student { display: flex; align-items: center; gap: 0.6rem; }
.t-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold-dk), var(--mm-copper));
  color: var(--mm-ink); font-size: 0.65rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.t-lesson-name { font-weight: 600; color: var(--mm-cream); }
.t-date { color: var(--mm-stone); white-space: nowrap; }

.t-badge { display: inline-flex; align-items: center; padding: 0.2rem 0.6rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 700; border: 1px solid; white-space: nowrap; font-family: 'DM Sans', sans-serif; }
.badge-emerald { background: rgba(56,168,130,0.1);  border-color: rgba(56,168,130,0.25); color: var(--mm-emerald); }
.badge-amber   { background: rgba(245,158,11,0.1);  border-color: rgba(245,158,11,0.25); color: #F59E0B; }
.badge-coral   { background: rgba(224,112,96,0.1);  border-color: rgba(224,112,96,0.25); color: var(--mm-coral); }

@media (max-width: 1024px) { .t-stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px)  { .t-two-col { grid-template-columns: 1fr; } .t-stat-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px)  { .t-stat-grid { grid-template-columns: 1fr; } }
</style>
