import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

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
        throw new Error('Google login failed')
      }

      const data = await response.json()
      
      // Update state
      user.value = data.user
      token.value = data.token

      // Persist to local storage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      
      return true
    } catch (err: any) {
      error.value = err.message || 'An error occurred during login'
      return false
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
    isAuthenticated,
    googleLogin,
    completeProfile,
    logout
  }
})
