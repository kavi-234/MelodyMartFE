<script setup lang="ts">
defineProps<{
  message: string
  isSender: boolean
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
  avatar?: string
  senderName?: string
}>()
</script>

<template>
  <div class="bubble-row" :class="isSender ? 'bubble-row-self' : 'bubble-row-other'">

    <div v-if="!isSender" class="bubble-avatar">
      <img v-if="avatar" :src="avatar" :alt="senderName" class="w-full h-full object-cover rounded-full" />
      <span v-else class="bubble-avatar-init">{{ senderName?.[0]?.toUpperCase() || '?' }}</span>
    </div>

    <div class="bubble-content" :class="isSender ? 'items-end' : 'items-start'">
      <span v-if="!isSender && senderName" class="bubble-sender-name">{{ senderName }}</span>

      <div class="bubble" :class="isSender ? 'bubble-self' : 'bubble-other'">
        <p class="bubble-text">{{ message }}</p>
      </div>

      <div class="bubble-meta" :class="isSender ? 'flex-row-reverse' : 'flex-row'">
        <span class="bubble-time">{{ timestamp }}</span>
        <div v-if="isSender && status" class="bubble-status">
          <svg v-if="status === 'sent'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mm-stone)"><path d="M20 6L9 17l-5-5"/></svg>
          <svg v-else-if="status === 'delivered'" width="14" height="11" viewBox="0 0 28 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mm-stone)"><path d="M1 12l5 5 9-9"/><path d="M8 12l5 5 9-9"/></svg>
          <svg v-else-if="status === 'read'" width="14" height="11" viewBox="0 0 28 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mm-gold)"><path d="M1 12l5 5 9-9"/><path d="M8 12l5 5 9-9"/></svg>
        </div>
      </div>
    </div>

    <div v-if="isSender" class="bubble-avatar-placeholder" />
  </div>
</template>

<style scoped>
.bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  animation: bubble-in 0.22s ease both;
}
.bubble-row-self  { flex-direction: row-reverse; }
.bubble-row-other { flex-direction: row; }

@keyframes bubble-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.bubble-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold-dk), var(--mm-copper));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
}
.bubble-avatar-init { font-size: 0.7rem; font-weight: 700; color: var(--mm-ink); }
.bubble-avatar-placeholder { width: 30px; flex-shrink: 0; }

.bubble-content {
  display: flex;
  flex-direction: column;
  max-width: min(70%, 480px);
}
.bubble-sender-name {
  font-size: 0.7rem;
  color: var(--mm-gold-lt);
  font-weight: 600;
  margin-bottom: 0.2rem;
  padding: 0 0.25rem;
  font-family: 'DM Sans', sans-serif;
}
.bubble {
  padding: 0.65rem 0.9rem;
  border-radius: 1.1rem;
  word-break: break-word;
}
.bubble-self {
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper));
  color: var(--mm-ink);
  border-bottom-right-radius: 0.25rem;
  box-shadow: 0 2px 12px rgba(212,168,83,0.2);
}
.bubble-other {
  background: var(--mm-onyx);
  border: 1px solid var(--mm-warm-line);
  color: var(--mm-ivory);
  border-bottom-left-radius: 0.25rem;
}
.bubble-text { font-size: 0.875rem; line-height: 1.55; font-family: 'DM Sans', sans-serif; }
.bubble-meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.25rem;
  padding: 0 0.25rem;
}
.bubble-time { font-size: 0.67rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }
.bubble-status { display: flex; align-items: center; }
</style>
