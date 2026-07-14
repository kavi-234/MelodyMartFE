<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const verificationStatusText = computed(() => {
  if (authStore.user?.verificationStatus === 'APPROVED') return 'Verified'
  if (authStore.user?.verificationStatus === 'REJECTED') return 'Rejected'
  return 'Pending Verification'
})

const statusChipClass = computed(() => {
  if (authStore.user?.verificationStatus === 'APPROVED') return 'chip-emerald'
  if (authStore.user?.verificationStatus === 'REJECTED') return 'chip-coral'
  return 'chip-amber'
})

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'repair_specialist') {
    router.push('/')
    return
  }
  await authStore.refreshUser()
})
</script>

<template>
  <div class="rd-page">
    <div class="rd-header">
      <h1 class="rd-title">Repair Specialist Dashboard</h1>
      <p class="rd-sub">Welcome, {{ authStore.user?.name }}!</p>
    </div>

    <div class="rd-grid">
      <div class="rd-card">
        <div class="rd-card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <h3 class="rd-card-title">Active Repairs</h3>
        <p class="rd-card-sub">Instruments in repair</p>
        <RouterLink to="/dashboard/specialist/service-requests" class="rd-btn">View Repairs</RouterLink>
      </div>

      <div class="rd-card">
        <div class="rd-card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        <h3 class="rd-card-title">Work Orders</h3>
        <p class="rd-card-sub">Pending repair requests</p>
        <RouterLink to="/dashboard/specialist/service-requests" class="rd-btn">View Orders</RouterLink>
      </div>

      <div class="rd-card">
        <div class="rd-card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </div>
        <h3 class="rd-card-title">Earnings</h3>
        <p class="rd-card-sub">View your income</p>
        <RouterLink to="/dashboard/specialist/earnings" class="rd-btn">View Earnings</RouterLink>
      </div>
    </div>

    <div class="rd-profile-card">
      <h3 class="rd-section-title">Profile Information</h3>
      <div class="rd-info-grid">
        <div class="rd-info-item">
          <span class="rd-info-label">Service Types</span>
          <span class="rd-info-val">{{ authStore.user?.serviceTypes || 'Not set' }}</span>
        </div>
        <div class="rd-info-item">
          <span class="rd-info-label">Certifications</span>
          <span class="rd-info-val">{{ authStore.user?.certifications || 'None' }}</span>
        </div>
        <div class="rd-info-item">
          <span class="rd-info-label">Status</span>
          <span class="rd-chip" :class="statusChipClass">{{ verificationStatusText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rd-page { min-height: 100vh; background: var(--mm-graphite); padding: 2rem; }
.rd-header { margin-bottom: 2rem; }
.rd-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.rd-sub { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; font-family: 'DM Sans', sans-serif; }
.rd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
.rd-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 1rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.rd-card-icon { width: 48px; height: 48px; border-radius: 0.75rem; background: rgba(192,123,80,0.1); color: var(--mm-copper); display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem; }
.rd-card-title { font-size: 1.0625rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.rd-card-sub { font-size: 0.8125rem; color: var(--mm-sand); margin: 0; font-family: 'DM Sans', sans-serif; }
.rd-btn { display: inline-block; margin-top: 0.5rem; padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); border-radius: 0.5rem; font-size: 0.875rem; font-weight: 700; text-decoration: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.rd-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(192,123,80,0.3); }
.rd-profile-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 1rem; padding: 1.5rem; }
.rd-section-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1.125rem; }
.rd-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.rd-info-item { display: flex; flex-direction: column; gap: 0.375rem; }
.rd-info-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-copper); text-transform: uppercase; letter-spacing: 0.08em; font-family: 'DM Sans', sans-serif; }
.rd-info-val { font-size: 0.9375rem; font-weight: 600; color: var(--mm-ivory); font-family: 'DM Sans', sans-serif; }
.rd-chip { display: inline-flex; align-items: center; padding: 0.2rem 0.625rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 700; border: 1px solid; font-family: 'DM Sans', sans-serif; }
.chip-emerald { background: rgba(56,168,130,0.12); border-color: rgba(56,168,130,0.25); color: var(--mm-emerald); }
.chip-coral   { background: rgba(224,112,96,0.12); border-color: rgba(224,112,96,0.25); color: var(--mm-coral); }
.chip-amber   { background: rgba(245,158,11,0.12);  border-color: rgba(245,158,11,0.25); color: #F59E0B; }
@media (max-width: 900px) { .rd-grid { grid-template-columns: 1fr 1fr; } .rd-info-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .rd-grid { grid-template-columns: 1fr; } .rd-info-grid { grid-template-columns: 1fr; } .rd-page { padding: 1.25rem; } }
</style>
