<template>
  <span :class="['status-chip', statusClass]">{{ status }}</span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ status: { type: String, required: true } })
const statusClass = computed(() => {
  const map = {
    'Pending':         'chip-gold',
    'Pending Payment': 'chip-copper',
    'Confirmed':       'chip-teal',
    'Completed':       'chip-emerald',
    'Cancelled':       'chip-coral',
    'Rescheduled':     'chip-gold',
  }
  return map[props.status] || 'chip-gold'
})
</script>

<style scoped>
.status-chip { display: inline-flex; align-items: center; justify-content: center; padding: 0.2rem 0.5625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; text-transform: capitalize; letter-spacing: 0.02em; white-space: nowrap; }
.chip-gold    { background: rgba(212,168,83,0.12);  color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.chip-copper  { background: rgba(192,123,80,0.12);  color: var(--mm-copper);  border: 1px solid rgba(192,123,80,0.25); }
.chip-teal    { background: rgba(42,157,159,0.12);  color: var(--mm-teal);    border: 1px solid rgba(42,157,159,0.25); }
.chip-emerald { background: rgba(56,168,130,0.12);  color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.chip-coral   { background: rgba(224,112,96,0.12);  color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }
</style>
