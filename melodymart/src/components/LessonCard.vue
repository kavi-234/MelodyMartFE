<template>
  <div class="lesson-card">
    <div class="card-header">
      <div class="header-left">
        <div class="lesson-icon-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div>
          <h3 class="lesson-title">{{ lesson.title || 'Music Lesson' }}</h3>
          <p class="instructor-name">{{ lesson.tutor?.name || 'Unknown Instructor' }}</p>
        </div>
      </div>
      <StatusChip :status="lesson.bookingStatus || 'Pending'" />
    </div>

    <div class="details-grid">
      <div class="detail-item"><span class="dl">Category</span><span class="dv">{{ lesson.instrument || 'General' }}</span></div>
      <div class="detail-item"><span class="dl">Date</span><span class="dv">{{ formatDate(lesson.availableDays?.[0]) }}</span></div>
      <div class="detail-item"><span class="dl">Time</span><span class="dv">{{ lesson.availableTimeSlots?.[0] || 'N/A' }}</span></div>
      <div class="detail-item"><span class="dl">Duration</span><span class="dv">{{ lesson.duration }} min</span></div>
      <div class="detail-item"><span class="dl">Payment</span><span class="dv"><span class="payment-badge" :class="paymentBadgeClass">{{ paymentLabel }}</span></span></div>
      <div class="detail-item"><span class="dl">Booked</span><span class="dv">{{ formatDate(lesson.createdAt) }}</span></div>
    </div>

    <div class="price-row">
      <span class="price-label">Price</span>
      <span class="price-value">Rs {{ lesson.price }}</span>
    </div>

    <div class="card-actions">
      <button v-if="showPayNow" class="act-btn act-pay" @click="$emit('pay-now', lesson)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        Pay Now
      </button>
      <button class="act-btn act-view" @click="$emit('view-details')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        View Details
      </button>
      <button v-if="lesson.bookingStatus !== 'Completed' && lesson.bookingStatus !== 'Pending Payment'" class="act-btn act-reschedule" @click="$emit('reschedule')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
        Reschedule
      </button>
      <button v-if="lesson.bookingStatus !== 'Completed' && lesson.bookingStatus !== 'Cancelled'" class="act-btn act-cancel" @click="$emit('cancel')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatusChip from './StatusChip.vue'

const props = defineProps({ lesson: { type: Object, required: true } })
defineEmits(['view-details', 'reschedule', 'cancel', 'pay-now'])

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
const isPaid = computed(() => props.lesson.paymentStatus === 'Paid')
const showPayNow = computed(() => !isPaid.value && props.lesson.bookingStatus !== 'Cancelled' && props.lesson.bookingStatus !== 'Completed')
const paymentLabel = computed(() => isPaid.value ? 'Paid' : (props.lesson.paymentStatus || 'Pending'))
const paymentBadgeClass = computed(() => ({ 'badge-paid': isPaid.value, 'badge-pending': !isPaid.value }))
</script>

<style scoped>
.lesson-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.125rem; margin-bottom: 0.875rem; transition: all 0.2s; }
.lesson-card:hover { border-color: rgba(42,157,159,0.3); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }

.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 0.75rem; }
.header-left { display: flex; align-items: center; gap: 0.625rem; flex: 1; }
.lesson-icon-wrap { width: 36px; height: 36px; border-radius: 0.5rem; background: rgba(42,157,159,0.1); color: var(--mm-teal); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lesson-title { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 2px; }
.instructor-name { font-size: 0.75rem; color: var(--mm-teal); font-weight: 600; margin: 0; }

.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; margin-bottom: 0.875rem; }
.detail-item { display: flex; flex-direction: column; gap: 0.2rem; }
.dl { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; }
.dv { font-size: 0.8125rem; font-weight: 600; color: var(--mm-ivory); }

.payment-badge { display: inline-flex; align-items: center; padding: 0.125rem 0.4375rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.badge-paid    { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.badge-pending { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }

.price-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0.875rem; background: rgba(42,157,159,0.04); border: 1px solid rgba(42,157,159,0.1); border-radius: 0.625rem; margin-bottom: 0.875rem; }
.price-label { font-size: 0.75rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; }
.price-value { font-family: 'DM Serif Display', serif; font-size: 1.25rem; font-weight: 400; color: var(--mm-gold); }

.card-actions { display: flex; flex-direction: column; gap: 0.5rem; }
.act-btn { display: flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.625rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.act-pay        { background: rgba(56,168,130,0.1);  color: var(--mm-emerald); border-color: rgba(56,168,130,0.25); }
.act-pay:hover  { background: rgba(56,168,130,0.2); }
.act-view       { background: rgba(42,157,159,0.1);  color: var(--mm-teal);    border-color: rgba(42,157,159,0.25); }
.act-view:hover { background: rgba(42,157,159,0.2); }
.act-reschedule       { background: rgba(212,168,83,0.1);  color: var(--mm-gold);    border-color: rgba(212,168,83,0.25); }
.act-reschedule:hover { background: rgba(212,168,83,0.2); }
.act-cancel       { background: rgba(224,112,96,0.1);  color: var(--mm-coral);   border-color: rgba(224,112,96,0.25); }
.act-cancel:hover { background: rgba(224,112,96,0.2); }

@media (max-width: 480px) { .details-grid { grid-template-columns: 1fr; } .card-actions { flex-direction: row; flex-wrap: wrap; } .act-btn { flex: 1; min-width: calc(50% - 0.25rem); } }
</style>
