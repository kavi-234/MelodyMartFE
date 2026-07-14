import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  isRead: boolean
  channels: {
    email: { sent: boolean }
    push: { sent: boolean }
    inApp: { shown: boolean }
  }
  metadata: {
    senderName: string
    senderRole: string
    icon: string
    actionUrl: string
    actionText: string
  }
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useNotifications = () => {
  const authStore = useAuthStore()
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.isRead)
  )

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authStore.token}`,
  })

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${API_URL}/api/messages/notifications?page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) throw new Error('Failed to fetch notifications')

      const data = await response.json()
      notifications.value = data.notifications
      unreadCount.value = data.notifications.filter((n: Notification) => !n.isRead).length
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Get unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/notifications/unread`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch unread count')

      const data = await response.json()
      unreadCount.value = data.unreadCount
    } catch (err: any) {
      console.error('Error fetching unread count:', err)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to mark as read')

      const notification = notifications.value.find(n => n._id === notificationId)
      if (notification) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to mark all as read')

      notifications.value.forEach(n => (n.isRead = true))
      unreadCount.value = 0
    } catch (err: any) {
      console.error('Error marking all as read:', err)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to delete notification')

      notifications.value = notifications.value.filter(n => n._id !== notificationId)
    } catch (err: any) {
      console.error('Error deleting notification:', err)
    }
  }

  // Request push notification permission
  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support push notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  // Save push subscription
  const savePushSubscription = async (subscription: any) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/push-subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subscription }),
      })

      if (!response.ok) throw new Error('Failed to save push subscription')

      return true
    } catch (err: any) {
      console.error('Error saving push subscription:', err)
      return false
    }
  }

  // Show desktop notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options)
    }
  }

  // Setup push notifications
  const setupPushNotifications = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported')
      return
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)

      // Request permission
      const hasPermission = await requestPushPermission()
      if (!hasPermission) {
        console.log('Push notification permission not granted')
        return
      }

      // Get subscription
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        // Create new subscription if doesn't exist
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.VITE_PUBLIC_VAPID_KEY,
        })
      }

      // Save subscription to server
      await savePushSubscription(subscription)
      console.log('Push notifications setup complete')
    } catch (err: any) {
      console.error('Error setting up push notifications:', err)
    }
  }

  return {
    notifications,
    unreadCount,
    unreadNotifications,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPushPermission,
    savePushSubscription,
    showNotification,
    setupPushNotifications,
  }
}
