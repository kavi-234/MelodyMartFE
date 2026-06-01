<template>
  <span :class="['status-chip', statusClass]">
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'].includes(value)
  }
})

const statusClass = computed(() => {
  const statusMap = {
    'Pending': 'status-pending',
    'Confirmed': 'status-confirmed',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled',
    'Rescheduled': 'status-rescheduled'
  }
  return statusMap[props.status] || 'status-pending'
})
</script>

<style scoped>
.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.status-pending {
  background-color: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.status-confirmed {
  background-color: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-completed {
  background-color: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.status-cancelled {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-rescheduled {
  background-color: rgba(168, 85, 247, 0.1);
  color: #9333ea;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

@media (max-width: 640px) {
  .status-chip {
    padding: 4px 10px;
    font-size: 11px;
  }
}
</style>
