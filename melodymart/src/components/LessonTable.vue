<template>
  <div class="table-container">
    <table class="lessons-table">
      <thead>
        <tr>
          <th>Lesson Name</th>
          <th>Instructor</th>
          <th>Category</th>
          <th>Date</th>
          <th>Time</th>
          <th>Duration</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="lesson in lessons" :key="lesson._id" class="lesson-row">
          <td class="lesson-name">
            <span class="lesson-icon">🎵</span>
            {{ lesson.title || 'Music Lesson' }}
          </td>
          <td class="instructor">{{ lesson.tutor?.name || 'Unknown' }}</td>
          <td class="category">{{ lesson.instrument || 'General' }}</td>
          <td class="date">{{ formatDate(lesson.availableDays?.[0]) }}</td>
          <td class="time">{{ lesson.availableTimeSlots?.[0] || 'N/A' }}</td>
          <td class="duration">{{ lesson.duration }} min</td>
          <td class="status">
            <StatusChip :status="lesson.bookingStatus || 'Pending'" />
          </td>
          <td class="payment">
            <span class="payment-badge" :class="lesson.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'">
              {{ lesson.paymentStatus === 'Paid' ? '✓ Paid' : (lesson.paymentStatus || 'Pending') }}
            </span>
          </td>
          <td class="price">Rs {{ lesson.price }}</td>
          <td class="actions">
            <div class="action-buttons">
              <button
                v-if="lesson.paymentStatus !== 'Paid' && lesson.bookingStatus !== 'Cancelled' && lesson.bookingStatus !== 'Completed'"
                class="action-btn pay-btn"
                @click="$emit('pay-now', lesson)"
                title="Pay Now"
              >
                💳
              </button>
              <button class="action-btn details-btn" @click="$emit('view-details', lesson)" title="View Details">
                👁️
              </button>
              <button
                v-if="lesson.bookingStatus !== 'Completed' && lesson.bookingStatus !== 'Pending Payment'"
                class="action-btn reschedule-btn"
                @click="$emit('reschedule', lesson)"
                title="Reschedule"
              >
                🔄
              </button>
              <button
                v-if="lesson.bookingStatus !== 'Completed' && lesson.bookingStatus !== 'Cancelled'"
                class="action-btn cancel-btn"
                @click="$emit('cancel', lesson)"
                title="Cancel"
              >
                ❌
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

defineProps({
  lessons: {
    type: Array,
    required: true
  }
})

defineEmits(['view-details', 'reschedule', 'cancel', 'pay-now'])

const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return date
  }
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 2px solid #9754CB;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lessons-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.lessons-table thead {
  background: linear-gradient(90deg, #9754CB, #DEACF5);
  border-bottom: 2px solid #6237A0;
}

.lessons-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 700;
  color: #ffffff;
  text-transform: capitalize;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.lesson-row {
  border-bottom: 1px solid #E5D9F0;
  transition: all 0.2s ease;
  background: #ffffff;
}

.lesson-row:hover {
  background: #F8F4FF;
  box-shadow: inset 0 0 0 1px rgba(151, 84, 203, 0.1);
}

.lessons-table td {
  padding: 14px 12px;
  color: #28104E;
  vertical-align: middle;
  font-weight: 500;
}

.lesson-icon {
  margin-right: 8px;
  font-size: 16px;
}

.lesson-name {
  font-weight: 700;
  min-width: 180px;
  color: #1b1030;
}

.instructor {
  color: #6237A0;
  font-weight: 600;
}

.category {
  font-size: 13px;
  color: #9754CB;
  font-weight: 600;
}

.date,
.time,
.duration {
  font-size: 13px;
  color: #4a3f6b;
  font-weight: 500;
}

.status {
  min-width: 110px;
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.badge-paid {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.price {
  font-weight: 800;
  color: #9754CB;
  min-width: 80px;
}

.actions {
  min-width: 120px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pay-btn {
  background: linear-gradient(90deg, #059669, #34d399);
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
}

.pay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);
}

.details-btn {
  background: linear-gradient(90deg, #9754CB, #DEACF5);
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(151, 84, 203, 0.2);
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(151, 84, 203, 0.3);
}

.reschedule-btn {
  background: #f3e8ff;
  color: #7c3aed;
  border: 2px solid #a78bfa;
  font-weight: 700;
}

.reschedule-btn:hover {
  background: #ede9fe;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
}

.cancel-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 2px solid #fca5a5;
  font-weight: 700;
}

.cancel-btn:hover {
  background: #fecaca;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

@media (max-width: 1024px) {
  .lessons-table th,
  .lessons-table td {
    padding: 12px 10px;
    font-size: 12px;
  }

  .lesson-name {
    min-width: 140px;
  }
}

@media (max-width: 768px) {
  .table-container {
    display: none;
  }
}
</style>
