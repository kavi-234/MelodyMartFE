<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'
import TypingIndicator from './TypingIndicator.vue'
import OnlineStatus from './OnlineStatus.vue'

interface Message {
  _id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  createdAt: string
  status: 'sent' | 'delivered' | 'read'
}

interface Participant {
  userId: string
  userName: string
  userRole: string
  userAvatar: string
  isOnline: boolean
  lastSeen?: string
}

interface Conversation {
  _id: string
  participants: Participant[]
}

const props = defineProps<{
  conversationId: string | null
  currentUserId: string
}>()

const emit = defineEmits<{ sendMessage: [message: string] }>()

const authStore              = useAuthStore()
const messagesContainer      = ref<HTMLDivElement>()
const showTyping             = ref(false)
const typingUserName         = ref('')
const messages               = ref<Message[]>([])
const conversation           = ref<Conversation | null>(null)
const loading                = ref(false)
const error                  = ref<string | null>(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` })

const fetchMessages = async () => {
  if (!props.conversationId || !authStore.token) return
  loading.value = true; error.value = null
  try {
    const res = await fetch(`${API_URL}/api/messages/conversations/${props.conversationId}/messages?limit=50`, { headers: authHeaders() })
    if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`)
    const data = await res.json()
    messages.value = data.messages || []
    await scrollToBottom()
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const fetchConversation = async () => {
  if (!props.conversationId || !authStore.token) return
  try {
    const res = await fetch(`${API_URL}/api/messages/conversations`, { headers: authHeaders() })
    if (!res.ok) return
    const data = await res.json()
    conversation.value = data.find((c: Conversation) => c._id === props.conversationId) || null
  } catch {}
}

const getOther = (): Participant | undefined =>
  conversation.value?.participants.find(p => p.userId !== authStore.user?.id)

const formatTs = (date: string) =>
  new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
}

const handleSend = async (message: string) => {
  if (!props.conversationId) return
  try {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ conversationId: props.conversationId, content: message, messageType: 'text' }),
    })
    if (!res.ok) throw new Error(`Failed to send message (${res.status})`)
    messages.value.push(await res.json())
    emit('sendMessage', message)
    await scrollToBottom()
  } catch (err: any) {
    error.value = err.message
  }
}

const handleTyping    = () => { showTyping.value = true;  typingUserName.value = getOther()?.userName || '' }
const handleStopTyping = () => { showTyping.value = false }

watch(() => props.conversationId, async () => { await fetchMessages(); await fetchConversation() })
onMounted(async () => { if (props.conversationId) { await fetchMessages(); await fetchConversation() } })
</script>

<template>
  <!-- Empty state -->
  <div v-if="!conversationId" class="cw-empty">
    <div class="cw-empty-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mm-gold-dk)">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    </div>
    <h2 class="cw-empty-title font-serif">Select a conversation</h2>
    <p class="cw-empty-sub">Choose someone to message from the list</p>
  </div>

  <!-- Chat -->
  <div v-else class="cw-root">
    <!-- Header -->
    <div class="cw-header">
      <div v-if="getOther()" class="cw-header-info">
        <div class="cw-avatar-wrap">
          <img v-if="getOther()!.userAvatar" :src="getOther()!.userAvatar" :alt="getOther()!.userName" class="cw-avatar" />
          <div v-else class="cw-avatar-fallback">{{ getOther()!.userName[0]?.toUpperCase() }}</div>
          <div v-if="getOther()!.isOnline" class="cw-online-dot" />
        </div>
        <div>
          <div class="cw-name">{{ getOther()!.userName }}</div>
          <div class="cw-role">{{ getOther()!.userRole?.replace('_', ' ') }}</div>
          <OnlineStatus :isOnline="getOther()!.isOnline" :lastSeen="getOther()!.lastSeen" />
        </div>
      </div>
      <div class="cw-header-actions">
        <button class="cw-action-btn" title="More options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="5" r="1" fill="currentColor"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="19" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="cw-messages">
      <div v-if="loading" class="cw-state">
        <div class="cw-loading-dots"><span /><span /><span /></div>
        <p class="cw-state-text">Loading messages…</p>
      </div>

      <div v-else-if="error" class="cw-state">
        <p class="cw-state-text" style="color: var(--mm-coral)">{{ error }}</p>
      </div>

      <div v-else-if="messages.length === 0" class="cw-state">
        <p class="cw-state-text">No messages yet — say hello!</p>
      </div>

      <MessageBubble
        v-for="msg in messages"
        :key="msg._id"
        :message="msg.content"
        :isSender="msg.senderId === authStore.user?.id"
        :timestamp="formatTs(msg.createdAt)"
        :status="msg.status"
        :avatar="msg.senderId !== authStore.user?.id ? getOther()?.userAvatar : undefined"
        :senderName="msg.senderId !== authStore.user?.id ? msg.senderName : undefined"
      />

      <div v-if="showTyping" class="px-4 pb-2">
        <TypingIndicator :username="typingUserName" />
      </div>
    </div>

    <!-- Input -->
    <MessageInput @send="handleSend" @typing="handleTyping" @stopTyping="handleStopTyping" />
  </div>
</template>

<style scoped>
.cw-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--mm-graphite);
  text-align: center;
  padding: 2rem;
}
.cw-empty-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(212,168,83,0.06);
  border: 1px solid rgba(212,168,83,0.12);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.25rem;
}
.cw-empty-title { font-size: 1.25rem; color: var(--mm-ivory); margin-bottom: 0.5rem; }
.cw-empty-sub { font-size: 0.875rem; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }

.cw-root { display: flex; flex-direction: column; height: 100%; }

.cw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--mm-warm-line);
  background: var(--mm-carbon);
  flex-shrink: 0;
}
.cw-header-info { display: flex; align-items: center; gap: 0.75rem; }
.cw-avatar-wrap { position: relative; flex-shrink: 0; }
.cw-avatar {
  width: 38px; height: 38px;
  border-radius: 50%; object-fit: cover;
  border: 1.5px solid rgba(255,255,255,0.08);
}
.cw-avatar-fallback {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold-dk), var(--mm-copper));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; font-weight: 700; color: var(--mm-ink);
}
.cw-online-dot {
  position: absolute; bottom: 0; right: 0;
  width: 9px; height: 9px;
  background: var(--mm-emerald);
  border-radius: 50%;
  border: 2px solid var(--mm-carbon);
}
.cw-name {
  font-size: 0.9rem; font-weight: 600; color: var(--mm-ivory);
  font-family: 'DM Sans', sans-serif;
}
.cw-role {
  font-size: 0.7rem; color: var(--mm-gold-lt);
  text-transform: capitalize;
  font-family: 'DM Sans', sans-serif; font-weight: 500;
  margin-bottom: 0.15rem;
}
.cw-action-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 0.4rem; border: none;
  background: transparent; color: var(--mm-stone); cursor: pointer;
  transition: all 0.2s;
}
.cw-action-btn:hover { background: var(--mm-onyx); color: var(--mm-ivory); }

.cw-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  background: var(--mm-graphite);
  scrollbar-width: thin;
  scrollbar-color: var(--mm-mist) transparent;
}
.cw-messages::-webkit-scrollbar { width: 4px; }
.cw-messages::-webkit-scrollbar-thumb { background: var(--mm-mist); border-radius: 4px; }

.cw-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}
.cw-state-text { font-size: 0.85rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }
.cw-loading-dots { display: flex; gap: 4px; margin-bottom: 0.6rem; }
.cw-loading-dots span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--mm-gold);
  animation: dot-b 1.3s ease-in-out infinite;
}
.cw-loading-dots span:nth-child(2) { animation-delay: 0.18s; }
.cw-loading-dots span:nth-child(3) { animation-delay: 0.36s; }
@keyframes dot-b {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40%            { transform: translateY(-5px); opacity: 1; }
}
</style>
