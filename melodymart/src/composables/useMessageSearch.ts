import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface SearchResult {
  _id: string
  content: string
  senderName: string
  conversationId: string
  createdAt: string
  status: string
}

interface ConversationResult {
  _id: string
  participants: Array<{ userName: string; userRole: string }>
  lastMessage: { content: string; timestamp: string }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useMessageSearch = () => {
  const authStore = useAuthStore()
  const searchQuery = ref('')
  const messageResults = ref<SearchResult[]>([])
  const conversationResults = ref<ConversationResult[]>([])
  const isSearching = ref(false)
  const error = ref<string | null>(null)
  const searchType = ref<'messages' | 'conversations' | 'all'>('messages')

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authStore.token}`,
  })

  // Search messages in conversation
  const searchMessagesInConversation = async (
    conversationId: string,
    query: string,
    page = 1,
    limit = 20
  ) => {
    if (!query.trim()) {
      error.value = 'Search query cannot be empty'
      return
    }

    isSearching.value = true
    error.value = null

    try {
      const response = await fetch(
        `${API_URL}/api/messages/conversations/${conversationId}/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      messageResults.value = data.messages
    } catch (err: any) {
      error.value = err.message
      messageResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // Search all messages
  const searchAllMessages = async (query: string, page = 1, limit = 20) => {
    if (!query.trim()) {
      error.value = 'Search query cannot be empty'
      return
    }

    isSearching.value = true
    error.value = null

    try {
      const response = await fetch(
        `${API_URL}/api/messages/search/all?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      messageResults.value = data.messages
    } catch (err: any) {
      error.value = err.message
      messageResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // Search conversations
  const searchConversations = async (query: string, page = 1, limit = 20) => {
    if (!query.trim()) {
      error.value = 'Search query cannot be empty'
      return
    }

    isSearching.value = true
    error.value = null

    try {
      const response = await fetch(
        `${API_URL}/api/messages/conversations/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      conversationResults.value = data.conversations
    } catch (err: any) {
      error.value = err.message
      conversationResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // Execute search based on type
  const executeSearch = async (query: string, conversationId?: string) => {
    searchQuery.value = query

    if (searchType.value === 'messages' && conversationId) {
      await searchMessagesInConversation(conversationId, query)
    } else if (searchType.value === 'all') {
      await searchAllMessages(query)
    } else if (searchType.value === 'conversations') {
      await searchConversations(query)
    }
  }

  // Clear results
  const clearResults = () => {
    messageResults.value = []
    conversationResults.value = []
    searchQuery.value = ''
    error.value = null
  }

  // Highlight search terms in text
  const highlightSearchTerm = (text: string, term: string): string => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, 'gi')
    return text.replace(regex, '<mark style="background-color: #fbbf24;">$1</mark>')
  }

  // Get formatted results
  const formattedMessageResults = computed(() =>
    messageResults.value.map(msg => ({
      ...msg,
      highlightedContent: highlightSearchTerm(msg.content, searchQuery.value),
    }))
  )

  return {
    searchQuery,
    messageResults,
    conversationResults,
    isSearching,
    error,
    searchType,
    formattedMessageResults,
    searchMessagesInConversation,
    searchAllMessages,
    searchConversations,
    executeSearch,
    clearResults,
    highlightSearchTerm,
  }
}
