<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ConversationItem from './ConversationItem.vue'

interface Conversation {
  _id: string
  participants: Array<{
    userId: string
    userName: string
    userRole: string
    userAvatar: string
    isOnline: boolean
    lastSeen: string
  }>
  lastMessage: { content: string; timestamp: string }
  lastActivity: string
}

const props = defineProps<{ selectedConversationId: string | null }>()
const emit  = defineEmits<{ selectConversation: [id: string] }>()

const authStore     = useAuthStore()
const searchQuery   = ref('')
const filterOnline  = ref(false)
const conversations = ref<Conversation[]>([])
const loading       = ref(false)
const error         = ref<string | null>(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const fetchConversations = async () => {
  if (!authStore.token) return
  loading.value = true; error.value = null
  try {
    const res = await fetch(`${API_URL}/api/messages/conversations`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
    })
    if (!res.ok) throw new Error(`Failed to fetch conversations (${res.status})`)
    conversations.value = (await res.json()) || []
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const getOther = (conv: Conversation) => conv.participants.find(p => p.userId !== authStore.user?.id)

const formatTs = (date: string) => {
  const d = new Date(date), now = new Date()
  const ms = now.getTime() - d.getTime()
  const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dd = Math.floor(ms / 86400000)
  if (m < 1)  return 'now'
  if (m < 60) return `${m}m`
  if (h < 24) return `${h}h`
  if (dd < 7) return `${dd}d`
  return d.toLocaleDateString()
}

const filtered = computed(() =>
  conversations.value.filter(conv => {
    const o = getOther(conv)
    if (!o) return false
    const q = o.userName.toLowerCase().includes(searchQuery.value.toLowerCase())
    return q && (!filterOnline.value || o.isOnline)
  })
)

onMounted(fetchConversations)
</script>

<template>
  <div class="cs-root">
    <!-- Sidebar header -->
    <div class="cs-header">
      <div class="cs-header-top">
        <span class="cs-title font-serif">Conversations</span>
      </div>
      <!-- Search -->
      <div class="cs-search-wrap">
        <svg class="cs-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Search…" class="cs-search" />
      </div>
      <!-- Filter -->
      <div class="cs-filters">
        <button
          @click="filterOnline = !filterOnline"
          class="cs-filter-btn"
          :class="{ 'cs-filter-active': filterOnline }"
        >
          <span class="online-dot-sm" />
          Online only
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="cs-list">
      <!-- Loading -->
      <div v-if="loading" class="cs-empty">
        <div class="cs-loading-dots">
          <span /><span /><span />
        </div>
        <p class="cs-empty-text">Loading…</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="cs-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--mm-stone); margin-bottom: 0.75rem;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <p class="cs-empty-text">{{ searchQuery ? 'No matches found' : 'No conversations yet' }}</p>
      </div>

      <!-- Items -->
      <ConversationItem
        v-for="conv in filtered"
        :key="conv._id"
        :id="conv._id"
        :avatar="getOther(conv)?.userAvatar || ''"
        :name="getOther(conv)?.userName || 'Unknown'"
        :role="getOther(conv)?.userRole || 'customer'"
        :lastMessage="conv.lastMessage?.content || 'No messages yet'"
        :timestamp="formatTs(conv.lastActivity)"
        :unreadCount="0"
        :isOnline="getOther(conv)?.isOnline || false"
        :isSelected="selectedConversationId === conv._id"
        @select="$emit('selectConversation', conv._id)"
      />
    </div>

    <!-- Footer -->
    <div class="cs-footer">{{ filtered.length }} conversation{{ filtered.length !== 1 ? 's' : '' }}</div>
  </div>
</template>

<style scoped>
.cs-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--mm-carbon);
}
.cs-header {
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid var(--mm-warm-line);
  flex-shrink: 0;
}
.cs-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.cs-title {
  font-size: 1rem;
  color: var(--mm-ivory);
  letter-spacing: -0.01em;
}
.cs-search-wrap {
  position: relative;
  margin-bottom: 0.6rem;
}
.cs-search-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%; transform: translateY(-50%);
  color: var(--mm-stone);
  pointer-events: none;
}
.cs-search {
  width: 100%;
  background: var(--mm-onyx);
  border: 1px solid var(--mm-warm-line);
  border-radius: 0.6rem;
  padding: 0.5rem 0.75rem 0.5rem 2.1rem;
  color: var(--mm-ivory);
  font-size: 0.85rem;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}
.cs-search::placeholder { color: var(--mm-stone); }
.cs-search:focus { border-color: rgba(212,168,83,0.3); }

.cs-filters { display: flex; gap: 0.4rem; }
.cs-filter-btn {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  border-radius: 2rem;
  border: 1px solid var(--mm-warm-line);
  background: transparent;
  color: var(--mm-sand);
  font-size: 0.75rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cs-filter-btn:hover { border-color: rgba(56,168,130,0.3); color: var(--mm-ivory); }
.cs-filter-active {
  border-color: rgba(56,168,130,0.35);
  background: rgba(56,168,130,0.08);
  color: var(--mm-emerald);
}
.online-dot-sm {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--mm-emerald);
  flex-shrink: 0;
}

.cs-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--mm-mist) transparent;
}
.cs-list::-webkit-scrollbar { width: 3px; }
.cs-list::-webkit-scrollbar-thumb { background: var(--mm-mist); border-radius: 3px; }

.cs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}
.cs-empty-text { font-size: 0.85rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }

.cs-loading-dots { display: flex; gap: 4px; margin-bottom: 0.75rem; }
.cs-loading-dots span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--mm-gold);
  animation: dot-bounce 1.3s ease-in-out infinite;
}
.cs-loading-dots span:nth-child(2) { animation-delay: 0.18s; }
.cs-loading-dots span:nth-child(3) { animation-delay: 0.36s; }
@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40%            { transform: translateY(-5px); opacity: 1; }
}

.cs-footer {
  padding: 0.6rem 1rem;
  border-top: 1px solid var(--mm-warm-line);
  font-size: 0.7rem;
  color: var(--mm-stone);
  font-family: 'DM Sans', sans-serif;
  text-align: center;
  flex-shrink: 0;
}
</style>
