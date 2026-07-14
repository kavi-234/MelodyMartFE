<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Lesson</th><th>Instructor</th><th>Category</th><th>Date</th><th>Time</th><th>Duration</th><th>Status</th><th>Payment</th><th>Price</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="lesson in lessons" :key="lesson._id" class="table-row">
          <td class="lesson-name-cell">
            <div class="lesson-icon-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            {{ lesson.title || 'Music Lesson' }}
          </td>
          <td class="instructor-cell">{{ lesson.tutor?.name || 'Unknown' }}</td>
          <td class="cat-cell">{{ lesson.instrument || 'General' }}</td>
          <td class="meta-cell">{{ formatDate(lesson.availableDays?.[0]) }}</td>
          <td class="meta-cell">{{ lesson.availableTimeSlots?.[0] || 'N/A' }}</td>
          <td class="meta-cell">{{ lesson.duration }} min</td>
          <td><StatusChip :status="lesson.bookingStatus || 'Pending'" /></td>
          <td><span class="payment-badge" :class="lesson.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'">{{ lesson.paymentStatus === 'Paid' ? 'Paid' : (lesson.paymentStatus || 'Pending') }}</span></td>
          <td class="price-cell">Rs {{ lesson.price }}</td>
          <td>
            <div class="action-btns">
              <button v-if="lesson.paymentStatus !== 'Paid' && lesson.bookingStatus !== 'Cancelled' && lesson.bookingStatus !== 'Completed'" class="act-btn act-pay" @click="$emit('pay-now', lesson)" title="Pay Now">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </button>
              <button class="act-btn act-view" @click="$emit('view-details', lesson)" title="View Details">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button v-if="lesson.bookingStatus !== 'Completed' && lesson.bookingStatus !== 'Pending Payment'" class="act-btn act-reschedule" @click="$emit('reschedule', lesson)" title="Reschedule">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              </button>
              <button v-if="lesson.bookingStatus !== 'Completed' && lesson.bookingStatus !== 'Cancelled'" class="act-btn act-cancel" @click="$emit('cancel', lesson)" title="Cancel">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import StatusChip from './StatusChip.vue'
defineProps({ lessons: { type: Array, required: true } })
defineEmits(['view-details', 'reschedule', 'cancel', 'pay-now'])
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
</script>

<style scoped>
.table-wrap { overflow-x: auto; border-radius: 0.875rem; border: 1px solid var(--mm-warm-line); }
.table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.table thead { background: rgba(42,157,159,0.06); border-bottom: 1px solid var(--mm-warm-line); }
.table th { padding: 0.75rem 0.875rem; text-align: left; color: var(--mm-teal); font-weight: 700; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.table-row { border-bottom: 1px solid var(--mm-warm-line); transition: background 0.15s; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(42,157,159,0.03); }
.table td { padding: 0.75rem 0.875rem; color: var(--mm-ivory); vertical-align: middle; }

.lesson-name-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; min-width: 160px; }
.lesson-icon-wrap { width: 28px; height: 28px; border-radius: 0.375rem; background: rgba(42,157,159,0.1); color: var(--mm-teal); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.instructor-cell { color: var(--mm-teal); font-weight: 600; }
.cat-cell { font-size: 0.75rem; color: var(--mm-sand); font-weight: 600; }
.meta-cell { font-size: 0.75rem; color: var(--mm-sand); white-space: nowrap; }
.price-cell { font-weight: 800; color: var(--mm-gold); white-space: nowrap; }

.payment-badge { display: inline-flex; align-items: center; padding: 0.2rem 0.5625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.badge-paid    { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.badge-pending { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }

.action-btns { display: flex; gap: 0.375rem; }
.act-btn { width: 30px; height: 30px; border-radius: 0.375rem; border: 1px solid; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.act-pay        { background: rgba(56,168,130,0.1);  color: var(--mm-emerald); border-color: rgba(56,168,130,0.25); }
.act-pay:hover  { background: rgba(56,168,130,0.2); }
.act-view       { background: rgba(42,157,159,0.1);  color: var(--mm-teal);    border-color: rgba(42,157,159,0.25); }
.act-view:hover { background: rgba(42,157,159,0.2); }
.act-reschedule       { background: rgba(212,168,83,0.1);  color: var(--mm-gold);    border-color: rgba(212,168,83,0.25); }
.act-reschedule:hover { background: rgba(212,168,83,0.2); }
.act-cancel       { background: rgba(224,112,96,0.1);  color: var(--mm-coral);   border-color: rgba(224,112,96,0.25); }
.act-cancel:hover { background: rgba(224,112,96,0.2); }

@media (max-width: 768px) { .table-wrap { display: none; } }
</style>
