<script setup lang="ts">
defineProps<{ username?: string }>()
</script>

<template>
  <div class="typing-wrap">
    <div class="typing-bubble">
      <span class="dot" /><span class="dot" /><span class="dot" />
    </div>
    <span v-if="username" class="typing-label">{{ username }} is typing</span>
  </div>
</template>

<style scoped>
.typing-wrap { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; }
.typing-bubble {
  display: flex; align-items: center; gap: 3px;
  padding: 0.55rem 0.75rem;
  background: var(--mm-onyx);
  border: 1px solid var(--mm-warm-line);
  border-radius: 1rem;
  border-bottom-left-radius: 0.25rem;
}
.dot {
  display: block;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--mm-gold);
  animation: dot-bounce 1.3s ease-in-out infinite;
  opacity: 0.6;
}
.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.18s; }
.dot:nth-child(3) { animation-delay: 0.36s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40%            { transform: translateY(-5px); opacity: 1; }
}
.typing-label { font-size: 0.72rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; font-style: italic; }
</style>
