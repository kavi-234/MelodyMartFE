<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  send: [message: string]
  typing: []
  stopTyping: []
}>()

const message     = ref('')
const textareaRef = ref<HTMLTextAreaElement>()
const isTyping    = ref(false)
let typingTimeout: ReturnType<typeof setTimeout>

const handleInput = () => {
  if (!isTyping.value) { isTyping.value = true; emit('typing') }
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => { isTyping.value = false; emit('stopTyping') }, 3000)
  adjustHeight()
}

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
}

const handleSend = () => {
  if (!message.value.trim()) return
  emit('send', message.value)
  message.value = ''
  isTyping.value = false
  if (textareaRef.value) textareaRef.value.style.height = 'auto'
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
}

const addEmoji = (emoji: string) => {
  message.value += emoji
  textareaRef.value?.focus()
  adjustHeight()
}

const quickEmojis = ['🎵', '🎸', '🎹', '🥁', '🎺', '👍', '❤️', '😊']
</script>

<template>
  <div class="input-area">
    <div class="emoji-tray">
      <button v-for="e in quickEmojis" :key="e" @click="addEmoji(e)" class="emoji-btn" :title="e">{{ e }}</button>
    </div>
    <div class="composer-row">
      <div class="textarea-wrap">
        <textarea
          ref="textareaRef"
          v-model="message"
          rows="1"
          placeholder="Write a message… (Enter to send)"
          @input="handleInput"
          @keydown="handleKeydown"
          class="composer-textarea"
        />
      </div>
      <button @click="handleSend" :disabled="!message.trim()" class="send-btn" :class="{ 'send-active': message.trim() }" title="Send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
    <p class="hint">Shift+Enter for new line</p>
  </div>
</template>

<style scoped>
.input-area {
  border-top: 1px solid var(--mm-warm-line);
  padding: 0.75rem 1rem 0.6rem;
  background: var(--mm-carbon);
}
.emoji-tray { display: flex; gap: 0.15rem; margin-bottom: 0.6rem; overflow-x: auto; scrollbar-width: none; }
.emoji-tray::-webkit-scrollbar { display: none; }
.emoji-btn {
  background: none; border: none; font-size: 1.1rem; cursor: pointer;
  padding: 0.2rem 0.25rem; border-radius: 0.4rem; flex-shrink: 0;
  transition: transform 0.15s ease, background 0.15s ease;
}
.emoji-btn:hover { transform: scale(1.3); background: rgba(255,255,255,0.05); }

.composer-row { display: flex; align-items: flex-end; gap: 0.6rem; }
.textarea-wrap { flex: 1; }
.composer-textarea {
  width: 100%;
  background: var(--mm-onyx);
  border: 1px solid var(--mm-warm-line);
  border-radius: 0.875rem;
  padding: 0.65rem 1rem;
  color: var(--mm-ivory);
  font-size: 0.875rem;
  line-height: 1.5;
  font-family: 'DM Sans', sans-serif;
  resize: none;
  max-height: 120px;
  outline: none;
  transition: border-color 0.2s;
}
.composer-textarea::placeholder { color: var(--mm-stone); }
.composer-textarea:focus { border-color: rgba(212,168,83,0.3); }

.send-btn {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 50%; border: none;
  background: var(--mm-mist); color: var(--mm-stone);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease;
}
.send-btn.send-active {
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper));
  color: var(--mm-ink);
  box-shadow: 0 4px 16px rgba(212,168,83,0.3);
}
.send-btn.send-active:hover { box-shadow: 0 6px 22px rgba(212,168,83,0.4); transform: scale(1.05); }
.send-btn:disabled:not(.send-active) { opacity: 0.4; cursor: not-allowed; }

.hint { font-size: 0.67rem; color: var(--mm-stone); margin-top: 0.35rem; font-family: 'DM Sans', sans-serif; padding-left: 0.25rem; }
</style>
