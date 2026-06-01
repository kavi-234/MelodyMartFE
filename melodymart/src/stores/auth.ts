import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const requiresProfileCompletion = computed(() => !user.value?.role || user.value?.role === 'customer' && !user.value?.profileCompleted)
  const isPendingApproval = computed(() => user.value?.verificationStatus === 'PENDING_APPROVAL' && (user.value?.role === 'tutor' || user.value?.role === 'repair_specialist'))
  const isApproved = computed(() => user.value?.verificationStatus === 'APPROVED' && user.value?.isVerified)
  const isRejected = computed(() => user.value?.verificationStatus === 'REJECTED')

  async function googleLogin(googleToken: string) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Google login failed')
      }

      const data = await response.json()
      
      // Update state
      user.value = data.user
      token.value = data.token

      // Persist to local storage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      
      // Return data to determine where to navigate
      return {
        success: true,
        user: data.user,
        isNewUser: data.isNewUser,
        requiresProfileCompletion: data.requiresProfileCompletion
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred during login'
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function completeProfile(formData: FormData) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:5000/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to complete profile')
      }

      const data = await response.json()
      
      // Update user data
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to complete profile'
      return false
    } finally {
      loading.value = false
    }
  }

  async function refreshUser() {
    if (!token.value) return false
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const data = await response.json()
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
      // try to refresh lesson counts if present
      if (user.value) {
        // no-op here; consumer can call fetchMyLessonsCount
      }
      return true
    } catch (err) {
      console.error('Failed to refresh user:', err)
      return false
    }
  }

  const myLessonsCount = ref(0)

  async function fetchMyLessonsCount() {
    if (!token.value) return
    try {
      const res = await fetch('http://localhost:5000/api/lessons/student/my-lessons', {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      if (!res.ok) return
      const data = await res.json()
      myLessonsCount.value = Array.isArray(data.lessons) ? data.lessons.length : 0
    } catch (e) {
      console.error('Failed to fetch my lessons count', e)
    }
  }

  function incrementMyLessonsCount() {
    myLessonsCount.value = (myLessonsCount.value || 0) + 1
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    error,
    myLessonsCount,
    isAuthenticated,
    requiresProfileCompletion,
    isPendingApproval,
    isApproved,
    isRejected,
    googleLogin,
    completeProfile,
    refreshUser,
    fetchMyLessonsCount,
    incrementMyLessonsCount,
    logout
  }
})
