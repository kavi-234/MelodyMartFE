<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const name = ref('')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  authStore.error = null
}

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
      const success = await authStore.googleLogin(idToken)
      if (success) {
        // Check if user needs to complete profile
        if (authStore.user && authStore.user.role === 'customer' && !authStore.user.verified) {
          // New user - redirect to profile completion
          router.push('/complete-profile')
        } else if (authStore.user) {
          // Existing user - redirect to their dashboard
          const roleRoute = {
            'customer': '/dashboard/customer',
            'tutor': '/dashboard/tutor',
            'repair_specialist': '/dashboard/repair'
          }
          router.push(roleRoute[authStore.user.role] || '/')
        } else {
          router.push('/')
        }
      } else {
        window.location.hash = ''
      }
    }
  }
}

onMounted(() => {
  handleGoogleCallback()
})

const handleEmailSubmit = () => {
  // Placeholder for future email/password implementation
  alert('Email/Password login is coming soon! Please use Google Login for now.')
}

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
          <div class="h-12 w-12 rounded-full bg-slate-700/50"></div> <!-- Placeholder Avatar -->
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
          {{ isLogin ? 'Enter your details to access your account' : 'Start your musical journey today' }}
        </p>

        <!-- Google Login Button -->
        <div class="mb-6">
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
            
             <div class="relative mt-6">
                <div class="absolute inset-0 flex items-center">
                  <span class="w-full border-t border-slate-800"></span>
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-slate-950 px-2 text-slate-500">Or continue with</span>
                </div>
              </div>
        </div>

        <form @submit.prevent="handleEmailSubmit" class="space-y-4">
          <div v-if="!isLogin">
            <label for="name" class="mb-1 block text-sm font-medium text-slate-300">Full Name</label>
            <input 
              id="name"
              v-model="name"
              type="text" 
              class="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              placeholder="John Doe"
              disabled
            />
          </div>
          
          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-slate-300">Email Address</label>
            <input 
              id="email"
              v-model="email"
              type="email" 
              class="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              placeholder="name@example.com"
              disabled
            />
          </div>

          <div>
            <div class="mb-1 flex items-center justify-between">
              <label for="password" class="block text-sm font-medium text-slate-300">Password</label>
              <button v-if="isLogin" type="button" @click.prevent class="text-sm font-medium text-purple-400 hover:text-purple-300">Forgot password?</button>
            </div>
            <input 
              id="password"
              v-model="password"
              type="password" 
              class="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              placeholder="••••••••"
              disabled
            />
          </div>

          <div v-if="authStore.error" class="rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
            {{ authStore.error }}
          </div>

          <button 
            type="submit" 
            class="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 hover:shadow-purple-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            {{ isLogin ? 'Sign in (Use Google above)' : 'Create account (Use Google above)' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <button @click="toggleMode" class="font-medium text-purple-400 hover:text-purple-300 hover:underline">
            {{ isLogin ? 'Sign up' : 'Log in' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
