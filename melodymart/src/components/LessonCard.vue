<template>
  <div class="lesson-card">
    <!-- Header -->
    <div class="card-header">
      <div class="header-left">
        <h3 class="lesson-title">{{ lesson.title || 'Music Lesson' }}</h3>
        <p class="instructor-name">{{ lesson.tutor?.name || 'Unknown Instructor' }}</p>
      </div>
      <StatusChip :status="lesson.bookingStatus || 'Pending'" />
    </div>

    <!-- Content -->
    <div class="card-content">
      <!-- Lesson Details Grid -->
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">📚 Category</span>
          <span class="detail-value">{{ lesson.instrument || 'General' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📅 Date</span>
          <span class="detail-value">{{ formatDate(lesson.availableDays?.[0]) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">⏰ Time</span>
          <span class="detail-value">{{ lesson.availableTimeSlots?.[0] || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">⏱️ Duration</span>
          <span class="detail-value">{{ lesson.duration }} min</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">💳 Payment</span>
          <span class="detail-value payment-status">Paid</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📝 Booking Date</span>
          <span class="detail-value">{{ formatDate(lesson.createdAt) }}</span>
        </div>
      </div>

      <!-- Price -->
      <div class="price-section">
        <span class="price-label">Price:</span>
        <span class="price-value">Rs {{ lesson.price }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions">
      <button class="action-btn action-details" @click="$emit('view-details')">
        <span>👁️</span> View Details
      </button>
      <button class="action-btn action-reschedule" @click="$emit('reschedule')" v-if="lesson.bookingStatus !== 'Completed'">
        <span>🔄</span> Reschedule
      </button>
      <button class="action-btn action-cancel" @click="$emit('cancel')" v-if="lesson.bookingStatus !== 'Completed' && lesson.bookingStatus !== 'Cancelled'">
        <span>❌</span> Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import StatusChip from './StatusChip.vue'

defineProps({
  lesson: {
    type: Object,
    required: true
  }
})

defineEmits(['view-details', 'reschedule', 'cancel'])

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
<style scoped>
.lesson-card {
  background: #ffffff;
  border: 2px solid #DEACF5;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(151, 84, 203, 0.15);
  transition: all 0.3s ease;
}

.lesson-card:hover {
  box-shadow: 0 8px 20px rgba(151, 84, 203, 0.2);
  border-color: #9754CB;
  transform: translateY(-2px);
}

.lesson-card:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(151, 84, 203, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.header-left {
  flex: 1;
}

.lesson-title {
  font-size: 16px;
  font-weight: 800;
  color: #1b1030;
  margin: 0 0 4px 0;
}

.instructor-name {
  font-size: 13px;
  color: #6237A0;
  margin: 0;
  font-weight: 600;
}

.card-content {
  margin-bottom: 16px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 11px;
  color: #9754CB;
  font-weight: 700;
  text-transform: uppercase;
}

.detail-value {
  font-size: 13px;
  font-weight: 700;
  color: #28104E;
}

.payment-status {
  color: #059669;
  background: #d1fae5;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.price-section {
  background: linear-gradient(90deg, #FBF7FF, #F3E8FF);
  padding: 12px 14px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #9754CB;
  border: 2px solid #DEACF5;
}

.price-label {
  font-size: 12px;
  color: #6237A0;
  font-weight: 700;
}

.price-value {
  font-size: 18px;
  font-weight: 800;
  color: #9754CB;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-transform: capitalize;
}

.action-details {
  background: linear-gradient(90deg, #9754CB, #DEACF5);
  color: white;
  box-shadow: 0 2px 6px rgba(151, 84, 203, 0.2);
}

.action-details:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(151, 84, 203, 0.3);
}

.action-details:active {
  opacity: 0.9;
}

.action-reschedule {
  background: #ede9fe;
  color: #7c3aed;
  border: 2px solid #c4b5fd;
  font-weight: 700;
}

.action-reschedule:hover {
  background: #ddd6fe;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
}

.action-reschedule:active {
  background: #e9d5ff;
}

.action-cancel {
  background: #fee2e2;
  color: #dc2626;
  border: 2px solid #fca5a5;
  font-weight: 700;
}

.action-cancel:hover {
  background: #fecaca;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

.action-cancel:active {
  background: #fef2f2;
}

@media (max-width: 480px) {
  .lesson-card {
    padding: 12px;
  }

  .lesson-title {
    font-size: 15px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: row;
  }

  .action-btn {
    flex: 1;
    font-size: 12px;
    padding: 8px 10px;
  }
}
</style>
