<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Tab state
const activeTab = ref<'google' | 'email'>('google')

// Email auth state
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const name = ref('')
const role = ref('customer')
const document = ref<File | null>(null)
const errorMessage = ref('')
const isLoading = ref(false)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  email.value = ''
  password.value = ''
  name.value = ''
  role.value = 'customer'
  document.value = null
}

const switchTab = (tab: 'google' | 'email') => {
  activeTab.value = tab
  errorMessage.value = ''
  authStore.error = null
}

// Google OAuth
const initiateGoogleLogin = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = window.location.origin + '/auth'
  
  console.log('Redirect URI being used:', redirectUri)
  console.log('Make sure this exact URI is added to Google Cloud Console')
  
  const scope = 'openid profile email'
  const responseType = 'id_token'
  const nonce = Math.random().toString(36).substring(7)
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=${responseType}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `nonce=${nonce}&` +
    `prompt=select_account`
  
  window.location.href = authUrl
}

const handleGoogleCallback = async () => {
  const hash = window.location.hash
  if (hash && hash.includes('id_token=')) {
    const params = new URLSearchParams(hash.substring(1))
    const idToken = params.get('id_token')
    
    if (idToken) {
      const result = await authStore.googleLogin(idToken)
      if (result.success) {
        // Clear hash from URL
        window.location.hash = ''
        
        // Navigate based on user status
        if (result.requiresProfileCompletion) {
          router.push('/complete-profile')
        } else if (result.user.verificationStatus === 'PENDING_APPROVAL') {
          // Show pending approval message
          alert('Your account is pending admin approval. You will be able to access your dashboard once approved.')
          router.push('/')
        } else if (result.user.verificationStatus === 'REJECTED') {
          authStore.error = 'Your account has been rejected. Please contact support.'
          authStore.logout()
          window.location.hash = ''
        } else {
          // Navigate to role-based dashboard
          redirectByRole()
        }
      } else {
        window.location.hash = ''
      }
    }
  }
}

// Email/Password Auth
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0 && target.files[0]) {
    document.value = target.files[0]
  }
}

const handleEmailLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Email and password are required'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:5000/api/auth/email/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle specific error messages from backend
      if (response.status === 403 && data.message.includes('pending')) {
        errorMessage.value = data.message
      } else if (response.status === 403 && data.message.includes('rejected')) {
        errorMessage.value = data.message
      } else if (response.status === 400 && data.message.includes('Google')) {
        errorMessage.value = data.message
      } else {
        errorMessage.value = data.message || 'Login failed'
      }
      return
    }

    // Store JWT and user data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    authStore.user = data.user
    authStore.token = data.token

    redirectByRole()
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'An error occurred during login'
  } finally {
    isLoading.value = false
  }
}

const handleEmailSignup = async () => {
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = 'Name, email, and password are required'
    return
  }

  if ((role.value === 'tutor' || role.value === 'repair_specialist') && !document.value) {
    errorMessage.value = 'Document upload is required for tutors and repair specialists'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('email', email.value)
    formData.append('password', password.value)
    formData.append('role', role.value)
    
    if (document.value) {
      formData.append('document', document.value)
    }

    const response = await fetch('http://localhost:5000/api/auth/email/signup', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Signup failed'
      return
    }

    // Store JWT and user data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    authStore.user = data.user
    authStore.token = data.token

    // Show success message if account is pending
    if (data.message && data.message.includes('pending')) {
      alert(data.message)
    }

    redirectByRole()
  } catch (error) {
    console.error('Signup error:', error)
    errorMessage.value = 'An error occurred during signup'
  } finally {
    isLoading.value = false
  }
}

const handleEmailSubmit = () => {
  if (isLogin.value) {
    handleEmailLogin()
  } else {
    handleEmailSignup()
  }
}

const redirectByRole = () => {
  if (authStore.user) {
    const roleRoute: Record<string, string> = {
      'customer': '/dashboard/customer',
      'tutor': '/dashboard/tutor',
      'repair_specialist': '/dashboard/repair',
      'admin': '/dashboard/admin'
    }
    router.push(roleRoute[authStore.user.role] || '/')
  } else {
    router.push('/')
  }
}

onMounted(() => {
  handleGoogleCallback()
})

</script>

<template>
  <div class="flex min-h-screen bg-slate-950 text-slate-100">
    <!-- Left Side: Branding/Image -->
    <div class="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-purple-900 via-slate-900 to-black p-12 lg:flex">
      <div>
        <div class="flex items-center gap-3">
          <span class="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v10.5a3.5 3.5 0 11-2-3.2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 3v10.5a3.5 3.5 0 11-2-3.2" />
            </svg>
          </span>
          <span class="bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 bg-clip-text text-3xl font-bold text-transparent">
            Melody Mart
          </span>
        </div>
        <p class="mt-4 text-xl text-purple-200/80">
          Your one-stop shop for everything musical.
        </p>
      </div>
      
      <div class="space-y-6">
        <blockquote class="text-xl font-medium leading-relaxed text-slate-300">
          "The best place to find high-quality instruments and expert tutors. My journey in music started here!"
        </blockquote>
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-slate-700/50"></div>
          <div>
             <div class="font-semibold text-white">Alex Chen</div>
             <div class="text-sm text-slate-400">Professional Guitarist</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Form -->
    <div class="flex w-full flex-col justify-center bg-slate-950 px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
      <div class="mb-8 flex items-center gap-2 lg:hidden">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v10.5a3.5 3.5 0 11-2-3.2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 3v10.5a3.5 3.5 0 11-2-3.2" />
            </svg>
        </span>
        <span class="text-2xl font-bold text-white">Melody Mart</span>
      </div>

      <div class="mx-auto w-full max-w-md">
        <h1 class="mb-2 text-3xl font-bold tracking-tight text-white">
          {{ isLogin ? 'Welcome back' : 'Create an account' }}
        </h1>
        <p class="mb-8 text-slate-400">
          {{ isLogin ? 'Choose your preferred login method' : 'Start your musical journey today' }}
        </p>

        <!-- Tab Navigation -->
        <div class="mb-6 flex gap-2 rounded-xl bg-slate-900/50 p-1">
          <button
            @click="switchTab('google')"
            :class="[
              'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition',
              activeTab === 'google' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            ]"
          >
            Google Login
          </button>
          <button
            @click="switchTab('email')"
            :class="[
              'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition',
              activeTab === 'email' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            ]"
          >
            Email Login
          </button>
        </div>

        <!-- Google Tab -->
        <div v-if="activeTab === 'google'" class="space-y-4">
          <button 
            @click="initiateGoogleLogin" 
            type="button"
            class="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-white px-4 py-3 font-semibold text-slate-900 shadow-lg transition hover:bg-slate-50"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div v-if="authStore.error" class="rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
            {{ authStore.error }}
          </div>

          <p class="text-center text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <!-- Email Tab -->
        <div v-if="activeTab === 'email'">
          <!-- Login/Signup Toggle -->
          <div class="mb-4 flex justify-center gap-2">
            <button
              @click="isLogin = true"
              :class="[
                'px-4 py-1 text-sm font-medium transition',
                isLogin ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
              ]"
            >
              Login
            </button>
            <span class="text-slate-600">|</span>
            <button
              @click="isLogin = false"
              :class="[
                'px-4 py-1 text-sm font-medium transition',
                !isLogin ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
              ]"
            >
              Sign Up
            </button>
          </div>

          <form @submit.prevent="handleEmailSubmit" class="space-y-4">
            <!-- Name (Signup only) -->
            <div v-if="!isLogin">
              <label for="name" class="mb-1 block text-sm font-medium text-slate-300">Full Name</label>
              <input 
                id="name"
                v-model="name"
                type="text" 
                required
                class="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="John Doe"
              />
            </div>
            
            <!-- Email -->
            <div>
              <label for="email" class="mb-1 block text-sm font-medium text-slate-300">Email Address</label>
              <input 
                id="email"
                v-model="email"
                type="email" 
                required
                class="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="name@example.com"
              />
            </div>

            <!-- Password -->
            <div>
              <div class="mb-1 flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-slate-300">Password</label>
                <button v-if="isLogin" type="button" class="text-sm font-medium text-purple-400 hover:text-purple-300">
                  Forgot password?
                </button>
              </div>
              <input 
                id="password"
                v-model="password"
                type="password" 
                required
                :minlength="isLogin ? undefined : 6"
                class="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <!-- Role Selection (Signup only) -->
            <div v-if="!isLogin">
              <label class="mb-2 block text-sm font-medium text-slate-300">I am a:</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="role = 'customer'"
                  :class="[
                    'rounded-lg border px-3 py-2 text-sm font-medium transition',
                    role === 'customer'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  ]"
                >
                  Customer
                </button>
                <button
                  type="button"
                  @click="role = 'tutor'"
                  :class="[
                    'rounded-lg border px-3 py-2 text-sm font-medium transition',
                    role === 'tutor'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  ]"
                >
                  Tutor
                </button>
                <button
                  type="button"
                  @click="role = 'repair_specialist'"
                  :class="[
                    'rounded-lg border px-3 py-2 text-sm font-medium transition',
                    role === 'repair_specialist'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  ]"
                >
                  Repair
                </button>
              </div>
            </div>

            <!-- Document Upload (Signup only, for tutor/repair) -->
            <div v-if="!isLogin && (role === 'tutor' || role === 'repair_specialist')">
              <label for="document" class="mb-1 block text-sm font-medium text-slate-300">
                {{ role === 'tutor' ? 'Teaching Certificate' : 'License/Certificate' }}
                <span class="text-red-400">*</span>
              </label>
              <input 
                id="document"
                type="file" 
                @change="handleFileChange"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                class="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-slate-100 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-purple-500"
              />
              <p class="mt-1 text-xs text-slate-500">
                Upload your {{ role === 'tutor' ? 'teaching certificate' : 'professional license' }} (JPG, PNG, PDF, DOC, DOCX - Max 5MB)
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage || authStore.error" class="rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
              {{ errorMessage || authStore.error }}
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 hover:shadow-purple-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading">{{ isLogin ? 'Sign in' : 'Create account' }}</span>
              <span v-else>{{ isLogin ? 'Signing in...' : 'Creating account...' }}</span>
            </button>
          </form>

          <p class="mt-4 text-center text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
