<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'tutor' | 'repair_specialist' | 'seller' | 'admin'
  avatar: string
}

const emit = defineEmits<{
  close: []
  created: [conversationId: string]
}>()

const authStore    = useAuthStore()
const searchQuery  = ref('')
const selectedUser = ref<User | null>(null)
const users        = ref<User[]>([])
const loading      = ref(false)
const creating     = ref(false)
const error        = ref<string | null>(null)

const API_URL     = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` })

const searchUsers = async (query: string) => {
  if (!query.trim() || query.length < 2) { users.value = []; return }
  loading.value = true; error.value = null
  try {
    const url = new URL(`${API_URL}/api/messages/users/search`)
    url.searchParams.set('query', query)
    url.searchParams.set('limit', '20')
    const res = await fetch(url.toString(), { headers: authHeaders() })
    if (!res.ok) { const t = await res.text(); throw new Error(`Server responded with ${res.status}`) }
    const data = await res.json()
    users.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    error.value = err.message || 'Failed to search users'
    users.value = []
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  if (!selectedUser.value) return
  creating.value = true; error.value = null
  try {
    const res = await fetch(`${API_URL}/api/messages/conversations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ participantId: selectedUser.value.id }),
    })
    if (!res.ok) throw new Error(`Failed to create conversation (${res.status})`)
    const conv = await res.json()
    emit('created', conv._id)
    emit('close')
  } catch (err: any) {
    error.value = err.message
  } finally {
    creating.value = false
  }
}

const roleColors: Record<string, string> = {
  tutor:             'color: var(--mm-gold-lt)',
  customer:          'color: var(--mm-teal)',
  repair_specialist: 'color: var(--mm-copper)',
  admin:             'color: var(--mm-coral)',
  seller:            'color: var(--mm-emerald)',
}

const filteredUsers = computed(() => users.value.filter(u => u.id !== authStore.user?.id))
</script>

<template>
  <Transition name="modal-fade" appear>
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-panel">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title font-serif">New Conversation</h2>
            <p class="modal-sub">Search and select someone to message</p>
          </div>
          <button @click="$emit('close')" class="modal-close-btn" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Search -->
        <div class="modal-body">
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              v-model="searchQuery"
              @input="searchUsers(searchQuery)"
              type="text"
              placeholder="Search by name or email…"
              class="modal-search"
              autofocus
            />
          </div>

          <!-- Error -->
          <div v-if="error" class="modal-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ error }}
          </div>

          <!-- User list -->
          <div class="user-list">
            <!-- Loading -->
            <div v-if="loading" class="list-state">
              <div class="loading-dots"><span /><span /><span /></div>
              <p class="list-state-text">Searching…</p>
            </div>

            <!-- Prompt -->
            <div v-else-if="!searchQuery" class="list-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--mm-stone); margin-bottom: 0.5rem;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <p class="list-state-text">Type to search for people</p>
            </div>

            <!-- No results -->
            <div v-else-if="filteredUsers.length === 0" class="list-state">
              <p class="list-state-text">No people found</p>
            </div>

            <!-- User rows -->
            <button
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectedUser = user"
              class="user-row"
              :class="{ 'user-row-selected': selectedUser?.id === user.id }"
            >
              <div class="user-avatar">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="w-full h-full object-cover rounded-full" />
                <span v-else class="avatar-init">{{ user.name[0]?.toUpperCase() }}</span>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-role" :style="roleColors[user.role] || 'color: var(--mm-sand)'">{{ user.role.replace('_', ' ') }}</span>
              </div>
              <div v-if="selectedUser?.id === user.id" class="user-check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="$emit('close')" class="btn-ghost text-sm px-4 py-2.5">Cancel</button>
          <button
            @click="handleCreate"
            :disabled="!selectedUser || creating"
            class="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <svg v-if="creating" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.8s linear infinite"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-dasharray="56" stroke-dashoffset="20"/></svg>
            {{ creating ? 'Creating…' : 'Start Chat' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(9,8,12,0.7);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.modal-panel {
  width: 100%; max-width: 440px;
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  border-radius: 1.25rem;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden;
}

.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid var(--mm-warm-line);
}
.modal-title { font-size: 1.1rem; color: var(--mm-ivory); }
.modal-sub   { font-size: 0.8rem; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; margin-top: 0.2rem; }
.modal-close-btn {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 0.4rem; border: none;
  background: transparent; color: var(--mm-stone); cursor: pointer;
  transition: all 0.2s; flex-shrink: 0; margin-left: 0.5rem;
}
.modal-close-btn:hover { background: var(--mm-onyx); color: var(--mm-ivory); }

.modal-body { padding: 1rem 1.25rem; }

.search-wrap { position: relative; margin-bottom: 0.75rem; }
.search-icon {
  position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
  color: var(--mm-stone); pointer-events: none;
}
.modal-search {
  width: 100%;
  background: var(--mm-onyx);
  border: 1px solid var(--mm-warm-line);
  border-radius: 0.65rem;
  padding: 0.6rem 0.9rem 0.6rem 2.2rem;
  color: var(--mm-ivory); font-size: 0.875rem; font-family: 'DM Sans', sans-serif;
  outline: none; transition: border-color 0.2s;
}
.modal-search::placeholder { color: var(--mm-stone); }
.modal-search:focus { border-color: rgba(212,168,83,0.3); }

.modal-error {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.6rem 0.75rem;
  background: rgba(224,112,96,0.08);
  border: 1px solid rgba(224,112,96,0.2);
  border-radius: 0.6rem;
  color: var(--mm-coral); font-size: 0.8rem; font-family: 'DM Sans', sans-serif;
  margin-bottom: 0.75rem;
}

.user-list {
  max-height: 280px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: var(--mm-mist) transparent;
}
.user-list::-webkit-scrollbar { width: 3px; }
.user-list::-webkit-scrollbar-thumb { background: var(--mm-mist); }

.list-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2rem 1rem;
}
.list-state-text { font-size: 0.85rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }

.loading-dots { display: flex; gap: 4px; margin-bottom: 0.6rem; }
.loading-dots span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--mm-gold);
  animation: dot-b 1.3s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.18s; }
.loading-dots span:nth-child(3) { animation-delay: 0.36s; }
@keyframes dot-b {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40%            { transform: translateY(-5px); opacity: 1; }
}

.user-row {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%; padding: 0.65rem 0.5rem;
  border: 1px solid transparent; border-radius: 0.65rem;
  background: transparent; cursor: pointer; text-align: left;
  transition: all 0.18s ease; margin-bottom: 0.2rem;
}
.user-row:hover { background: rgba(255,255,255,0.03); border-color: var(--mm-warm-line); }
.user-row-selected { background: rgba(212,168,83,0.07); border-color: rgba(212,168,83,0.2); }

.user-avatar {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold-dk), var(--mm-copper));
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  border: 1.5px solid rgba(255,255,255,0.06);
}
.avatar-init { font-size: 0.85rem; font-weight: 700; color: var(--mm-ink); }

.user-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.user-name {
  font-size: 0.875rem; font-weight: 600; color: var(--mm-ivory);
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-role {
  font-size: 0.72rem; font-weight: 500;
  text-transform: capitalize; font-family: 'DM Sans', sans-serif;
  margin-top: 0.1rem;
}
.user-check {
  width: 20px; height: 20px; flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper));
  display: flex; align-items: center; justify-content: center;
  color: var(--mm-ink);
}

.modal-footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--mm-warm-line);
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.22s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-panel { transform: scale(0.96); }
.modal-fade-leave-to .modal-panel { transform: scale(0.96); }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
