<script setup lang="ts">
defineProps<{
  isOnline: boolean
  lastSeen?: string
}>()
</script>

<template>
  <div class="online-wrap">
    <div class="dot-wrap">
      <div class="dot" :class="isOnline ? 'dot-on' : 'dot-off'" />
      <div v-if="isOnline" class="ping" />
    </div>
    <span class="label" :class="isOnline ? 'label-on' : 'label-off'">
      {{ isOnline ? 'Online now' : `Last seen ${lastSeen || 'recently'}` }}
    </span>
  </div>
</template>

<style scoped>
.online-wrap { display: inline-flex; align-items: center; gap: 0.4rem; }
.dot-wrap { position: relative; width: 8px; height: 8px; }
.dot { position: absolute; inset: 0; border-radius: 50%; }
.dot-on  { background: var(--mm-emerald); }
.dot-off { background: var(--mm-stone); }
.ping {
  position: absolute; inset: -2px;
  border-radius: 50%;
  background: var(--mm-emerald);
  opacity: 0.35;
  animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;
}
@keyframes ping { 75%, 100% { transform: scale(2.5); opacity: 0; } }
.label { font-size: 0.75rem; font-family: 'DM Sans', sans-serif; font-weight: 500; }
.label-on  { color: var(--mm-emerald); }
.label-off { color: var(--mm-stone); }
</style>
