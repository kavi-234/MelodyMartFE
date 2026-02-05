<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  authProvider: string
  isVerified: boolean
  verificationStatus: string
  specialization?: string
  experience?: number
  hourlyRate?: number
  bio?: string
  serviceTypes?: string
  createdAt: string
  updatedAt: string
}

const user = ref<UserProfile | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const successMessage = ref('')

const formData = ref({
  name: '',
  phone: '',
  experience: '',
  specialization: ''
})

const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

const canChangePassword = computed(() => user.value?.authProvider === 'local')

const fetchUserProfile = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }

    const response = await fetch('http://localhost:5000/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        authStore.logout()
        router.push('/auth')
        return
      }
      throw new Error('Failed to fetch profile')
    }

    const data = await response.json()
    user.value = data.user
    formData.value = {
      name: data.user.name,
      phone: data.user.phone || '',
      experience: data.user.experience || '',
      specialization: data.user.specialization || ''
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    error.value = 'Avatar image must be less than 2MB'
    return
  }

  // Validate file type
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
    error.value = 'Avatar must be a JPG or PNG image'
    return
  }

  avatarFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  error.value = ''
  successMessage.value = ''

  // Validation
  if (!formData.value.name || formData.value.name.trim().length < 2) {
    error.value = 'Name must be at least 2 characters long'
    return
  }

  saving.value = true

  try {
    const token = localStorage.getItem('token')
    const formDataToSend = new FormData()
    
    formDataToSend.append('name', formData.value.name.trim())
    
    // Only include phone for non-repair specialists
    if (user.value?.role !== 'repair_specialist' && formData.value.phone) {
      formDataToSend.append('phone', formData.value.phone.trim())
    }
    
    // Include experience and specialization for repair specialists
    if (user.value?.role === 'repair_specialist') {
      if (formData.value.experience) {
        formDataToSend.append('experience', formData.value.experience.trim())
      }
      if (formData.value.specialization) {
        formDataToSend.append('specialization', formData.value.specialization.trim())
      }
    }
    
    if (avatarFile.value) {
      formDataToSend.append('avatar', avatarFile.value)
    }

    const response = await fetch('http://localhost:5000/api/me', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataToSend
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile')
    }

    // Update local user data
    user.value = data.user
    
    // Update auth store
    authStore.user = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    
    successMessage.value = 'Profile updated successfully!'
    avatarFile.value = null
    avatarPreview.value = null
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    'admin': 'bg-red-100 text-red-700 border-red-200',
    'tutor': 'bg-purple-100 text-purple-700 border-purple-200',
    'repair_specialist': 'bg-blue-100 text-blue-700 border-blue-200',
    'customer': 'bg-green-100 text-green-700 border-green-200'
  }
  return colors[role] || 'bg-slate-100 text-slate-700 border-slate-200'
}

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    'APPROVED': 'bg-green-100 text-green-700 border-green-200',
    'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'REJECTED': 'bg-red-100 text-red-700 border-red-200'
  }
  return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="router.back()"
          class="mb-4 text-slate-400 hover:text-white flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1 class="text-3xl font-bold text-white">Account Settings</h1>
        <p class="text-slate-400 mt-2">Manage your profile and account preferences</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
        <p class="text-slate-400 mt-4">Loading profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error && !user" class="rounded-xl bg-red-900/20 border border-red-800 p-6 text-red-400">
        {{ error }}
      </div>

      <!-- Settings Form -->
      <div v-else-if="user" class="space-y-6">
        <!-- Success Message -->
        <div v-if="successMessage" class="rounded-xl bg-green-900/20 border border-green-800 p-4 text-green-400">
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-xl bg-red-900/20 border border-red-800 p-4 text-red-400">
          {{ error }}
        </div>

        <!-- Profile Card -->
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 class="text-xl font-bold text-white mb-6">Profile Information</h2>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Avatar -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-3">Avatar</label>
              <div class="flex items-center gap-4">
                <div class="relative">
                  <div v-if="avatarPreview || user.avatar" class="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700">
                    <img :src="avatarPreview || user.avatar" alt="Avatar" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {{ getInitials(user.name) }}
                  </div>
                </div>
                <div class="flex-1">
                  <input
                    type="file"
                    id="avatar"
                    accept="image/jpeg,image/jpg,image/png"
                    @change="handleAvatarChange"
                    class="hidden"
                  />
                  <label
                    for="avatar"
                    class="inline-block px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 cursor-pointer border border-slate-700"
                  >
                    Change Avatar
                  </label>
                  <p class="text-xs text-slate-500 mt-2">JPG or PNG. Max size 2MB.</p>
                </div>
              </div>
            </div>

            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-slate-300 mb-2">
                Name *
              </label>
              <input
                v-model="formData.name"
                type="text"
                id="name"
                required
                class="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <!-- Phone (for non-repair specialists) -->
            <div v-if="user.role !== 'repair_specialist'">
              <label for="phone" class="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                id="phone"
                placeholder="+1 (555) 000-0000"
                class="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <!-- Experience (for repair specialists) -->
            <div v-if="user.role === 'repair_specialist'">
              <label for="experience" class="block text-sm font-medium text-slate-300 mb-2">
                Years of Experience
              </label>
              <input
                v-model="formData.experience"
                type="text"
                id="experience"
                placeholder="e.g., 5 years"
                class="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <!-- Specialization (for repair specialists) -->
            <div v-if="user.role === 'repair_specialist'">
              <label for="specialization" class="block text-sm font-medium text-slate-300 mb-2">
                Specialization / Repair Fields
              </label>
              <input
                v-model="formData.specialization"
                type="text"
                id="specialization"
                placeholder="e.g., Guitar & String Instruments, Piano Repair"
                class="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <!-- Save Button -->
            <button
              type="submit"
              :disabled="saving"
              class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- Read-Only Information -->
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 class="text-xl font-bold text-white mb-6">Account Information</h2>
          
          <div class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
              <div class="text-white">{{ user.email }}</div>
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-slate-500 mb-1">Account Type</label>
              <span :class="['inline-block px-3 py-1 rounded-full text-xs font-semibold border', getRoleBadgeColor(user.role)]">
                {{ user.role.replace('_', ' ').toUpperCase() }}
              </span>
            </div>

            <!-- Auth Provider -->
            <div>
              <label class="block text-sm font-medium text-slate-500 mb-1">Sign-in Method</label>
              <div class="text-white capitalize">{{ user.authProvider }}</div>
            </div>

            <!-- Verification Status -->
            <div v-if="user.role !== 'customer'">
              <label class="block text-sm font-medium text-slate-500 mb-1">Verification Status</label>
              <span :class="['inline-block px-3 py-1 rounded-full text-xs font-semibold border', getStatusBadgeColor(user.verificationStatus)]">
                {{ user.verificationStatus.replace('_', ' ') }}
              </span>
            </div>

            <!-- Member Since -->
            <div>
              <label class="block text-sm font-medium text-slate-500 mb-1">Member Since</label>
              <div class="text-white">{{ new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</div>
            </div>
          </div>
        </div>

        <!-- Change Password (only for email auth) -->
        <div v-if="canChangePassword" class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 class="text-xl font-bold text-white mb-4">Security</h2>
          <p class="text-slate-400 mb-4">Keep your account secure by using a strong password</p>
          <button
            type="button"
            class="px-6 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 border border-slate-700"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
