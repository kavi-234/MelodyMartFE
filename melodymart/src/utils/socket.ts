import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const initSocket = (userId: string) => {
  if (socket?.connected) {
    return socket
  }

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    auth: {
      userId,
    },
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id)
    socket?.emit('user-online', userId)
  })

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected')
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })

  return socket
}

export const getSocket = () => {
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Conversation events
export const joinConversation = (conversationId: string, userId: string) => {
  socket?.emit('join-conversation', { conversationId, userId })
}

export const leaveConversation = (conversationId: string, userId: string) => {
  socket?.emit('leave-conversation', { conversationId, userId })
}

// Message events
export const sendMessage = (
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string,
  messageType: string = 'text'
) => {
  socket?.emit('send-message', {
    conversationId,
    senderId,
    senderName,
    content,
    messageType,
  })
}

export const onReceiveMessage = (callback: (message: any) => void) => {
  socket?.on('receive-message', callback)
}

export const offReceiveMessage = () => {
  socket?.off('receive-message')
}

// Typing events
export const sendTyping = (conversationId: string, userId: string, userName: string) => {
  socket?.emit('typing', { conversationId, userId, userName })
}

export const sendStopTyping = (conversationId: string, userId: string) => {
  socket?.emit('stop-typing', { conversationId, userId })
}

export const onUserTyping = (callback: (data: any) => void) => {
  socket?.on('user-typing', callback)
}

export const onUserStopTyping = (callback: (data: any) => void) => {
  socket?.on('user-stop-typing', callback)
}

export const offUserTyping = () => {
  socket?.off('user-typing')
}

export const offUserStopTyping = () => {
  socket?.off('user-stop-typing')
}

// Read receipt events
export const markMessageAsRead = (messageId: string, conversationId: string) => {
  socket?.emit('message-read', { messageId, conversationId })
}

export const markConversationAsRead = (conversationId: string) => {
  socket?.emit('conversation-read', { conversationId })
}

export const onMessageReadUpdate = (callback: (data: any) => void) => {
  socket?.on('message-read-update', callback)
}

export const onConversationReadUpdate = (callback: (data: any) => void) => {
  socket?.on('conversation-read-update', callback)
}

export const offMessageReadUpdate = () => {
  socket?.off('message-read-update')
}

export const offConversationReadUpdate = () => {
  socket?.off('conversation-read-update')
}

// User status events
export const onUserStatusChanged = (callback: (data: any) => void) => {
  socket?.on('user-status-changed', callback)
}

export const onUserJoined = (callback: (data: any) => void) => {
  socket?.on('user-joined', callback)
}

export const onUserLeft = (callback: (data: any) => void) => {
  socket?.on('user-left', callback)
}

export const offUserStatusChanged = () => {
  socket?.off('user-status-changed')
}

export const offUserJoined = () => {
  socket?.off('user-joined')
}

export const offUserLeft = () => {
  socket?.off('user-left')
}
