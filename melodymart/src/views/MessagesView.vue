<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ConversationSidebar from '../components/messaging/ConversationSidebar.vue'
import ChatWindow from '../components/messaging/ChatWindow.vue'
import NewConversationModal from '../components/messaging/NewConversationModal.vue'

const authStore = useAuthStore()
const selectedConversationId  = ref<string | null>(null)
const showNewConversationModal = ref(false)
const sidebarKey               = ref(0)

const currentUserId = computed(() => authStore.user?.id || '')

const handleSelectConversation = (id: string) => { selectedConversationId.value = id }
const handleNewConversationCreated = (id: string) => {
  selectedConversationId.value = id
  showNewConversationModal.value = false
  sidebarKey.value += 1
}
</script>

<template>
  <div class="messages-page" style="background: var(--mm-graphite);">

    <!-- Page header -->
    <div class="messages-header">
      <!-- Warm top line -->
      <div class="absolute top-0 inset-x-0 h-px pointer-events-none"
           style="background: linear-gradient(90deg, transparent, rgba(212,168,83,0.2) 30%, rgba(212,168,83,0.2) 70%, transparent);" />
      <div class="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 class="font-serif text-2xl text-mm-ivory">Messages</h1>
          <p class="text-sm text-mm-sand mt-0.5 font-sans">Your Melody Mart conversations</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- New conversation -->
          <button
            @click="showNewConversationModal = true"
            class="msg-icon-btn"
            title="New conversation"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main layout -->
    <div class="messages-body">

      <!-- Conversation list (desktop) -->
      <div class="conv-panel hidden md:flex flex-col">
        <ConversationSidebar
          :key="sidebarKey"
          :selectedConversationId="selectedConversationId"
          @selectConversation="handleSelectConversation"
        />
      </div>

      <!-- Chat window -->
      <div class="chat-panel flex flex-col" :class="{ 'hidden md:flex': selectedConversationId === null }">
        <ChatWindow
          :conversationId="selectedConversationId"
          :currentUserId="currentUserId"
        />
      </div>

      <!-- Mobile: show conv list when nothing selected -->
      <div v-if="selectedConversationId === null" class="conv-panel md:hidden flex flex-col">
        <ConversationSidebar
          :key="sidebarKey"
          :selectedConversationId="selectedConversationId"
          @selectConversation="handleSelectConversation"
        />
      </div>

    </div>

    <!-- New conversation modal -->
    <NewConversationModal
      v-if="showNewConversationModal"
      @close="showNewConversationModal = false"
      @created="handleNewConversationCreated"
    />
  </div>
</template>

<style scoped>
.messages-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.messages-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(17,15,22,0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--mm-warm-line);
  position: relative;
}
.msg-icon-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid var(--mm-warm-line);
  background: var(--mm-carbon);
  color: var(--mm-sand);
  cursor: pointer;
  transition: all 0.2s ease;
}
.msg-icon-btn:hover {
  border-color: rgba(212,168,83,0.3);
  color: var(--mm-gold-lt);
  background: rgba(212,168,83,0.06);
}
.messages-body {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  height: calc(100vh - 73px);
}
.conv-panel {
  width: 340px;
  flex-shrink: 0;
  border-right: 1px solid var(--mm-warm-line);
  background: var(--mm-carbon);
  overflow: hidden;
}
.chat-panel {
  flex: 1;
  min-width: 0;
  background: var(--mm-graphite);
  overflow: hidden;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--mm-mist); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--mm-line); }
</style>
