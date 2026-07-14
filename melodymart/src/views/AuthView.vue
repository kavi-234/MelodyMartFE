<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'google' | 'email'>('google')
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
  email.value = ''; password.value = ''; name.value = ''; role.value = 'customer'; document.value = null
}
const switchTab = (tab: 'google' | 'email') => { activeTab.value = tab; errorMessage.value = ''; authStore.error = null }

const initiateGoogleLogin = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = window.location.origin + '/auth'
  const scope = 'openid profile email'
  const nonce = Math.random().toString(36).substring(7)
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=${encodeURIComponent(scope)}&nonce=${nonce}&prompt=select_account`
  window.location.href = authUrl
}

const handleGoogleCallback = async () => {
  const hash = window.location.hash
  if (hash && hash.includes('id_token=')) {
    try {
      const params = new URLSearchParams(hash.substring(1))
      const idToken = params.get('id_token')
      if (idToken) {
        isLoading.value = true
        window.history.replaceState({}, '', window.location.pathname)
        const result = await authStore.googleLogin(idToken)
        if (result.success) {
          if (result.user.verificationStatus === 'PENDING_APPROVAL') { errorMessage.value = 'Your account is pending admin approval.'; authStore.logout() }
          else if (result.user.verificationStatus === 'REJECTED') { errorMessage.value = 'Your account has been rejected. Please contact support.'; authStore.logout() }
          else if (!result.user.profileCompleted) { router.push('/complete-profile') }
          else { redirectByRole() }
        } else { errorMessage.value = result.error || 'Google login failed' }
        isLoading.value = false
      }
    } catch (err) { errorMessage.value = 'Error processing login. Please try again.'; isLoading.value = false }
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) document.value = target.files[0]
}

const handleEmailLogin = async () => {
  if (!email.value || !password.value) { errorMessage.value = 'Email and password are required'; return }
  isLoading.value = true; errorMessage.value = ''
  try {
    const response = await fetch('http://localhost:5000/api/auth/email/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value, password: password.value }) })
    const data = await response.json()
    if (!response.ok) { errorMessage.value = data.message || 'Login failed'; return }
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user))
    authStore.user = data.user; authStore.token = data.token
    redirectByRole()
  } catch { errorMessage.value = 'An error occurred during login' }
  finally { isLoading.value = false }
}

const handleEmailSignup = async () => {
  if (!name.value || !email.value || !password.value) { errorMessage.value = 'Name, email, and password are required'; return }
  if ((role.value === 'tutor' || role.value === 'repair_specialist') && !document.value) { errorMessage.value = 'Document upload is required for tutors and repair specialists'; return }
  isLoading.value = true; errorMessage.value = ''
  try {
    const formData = new FormData()
    formData.append('name', name.value); formData.append('email', email.value)
    formData.append('password', password.value); formData.append('role', role.value)
    if (document.value) formData.append('document', document.value)
    const response = await fetch('http://localhost:5000/api/auth/email/signup', { method: 'POST', body: formData })
    const data = await response.json()
    if (!response.ok) { errorMessage.value = data.message || 'Signup failed'; return }
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user))
    authStore.user = data.user; authStore.token = data.token
    if (data.message && data.message.includes('pending')) alert(data.message)
    redirectByRole()
  } catch { errorMessage.value = 'An error occurred during signup' }
  finally { isLoading.value = false }
}

const handleEmailSubmit = () => { isLogin.value ? handleEmailLogin() : handleEmailSignup() }
const redirectByRole = () => {
  if (authStore.user) {
    const roleRoute: Record<string, string> = { customer: '/dashboard/customer', tutor: '/dashboard/tutor', repair_specialist: '/dashboard/specialist', admin: '/dashboard/admin' }
    router.push(roleRoute[authStore.user.role] || '/')
  } else { router.push('/') }
}

onMounted(() => handleGoogleCallback())
</script>

<template>
  <div class="auth-root">
    <!-- Left: Brand Panel -->
    <div class="auth-left">
      <div class="auth-left-overlay" />
      <div class="auth-left-inner">
        <div class="auth-brand">
          <div class="auth-logo-mark">
            <div class="logo-ring" /><div class="logo-dot" />
          </div>
          <span class="auth-logo-text">Melody Mart</span>
        </div>
        <p class="auth-tagline">Your one-stop shop for everything musical.</p>
      </div>
      <div class="auth-left-bottom">
        <blockquote class="auth-quote">
          "The best place to find high-quality instruments and expert tutors. My journey in music started here!"
        </blockquote>
        <div class="auth-reviewer">
          <div class="auth-reviewer-avatar">AC</div>
          <div>
            <div class="auth-reviewer-name">Alex Chen</div>
            <div class="auth-reviewer-role">Professional Guitarist</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form Panel -->
    <div class="auth-right">
      <!-- Mobile brand -->
      <div class="auth-mobile-brand">
        <div class="auth-logo-mark sm"><div class="logo-ring" /><div class="logo-dot" /></div>
        <span class="auth-logo-text sm">Melody Mart</span>
      </div>

      <div class="auth-form-wrap">
        <div class="auth-form-head">
          <h1 class="auth-title">{{ isLogin ? 'Welcome back' : 'Create an account' }}</h1>
          <p class="auth-subtitle">{{ isLogin ? 'Choose your preferred login method' : 'Start your musical journey today' }}</p>
        </div>

        <!-- Tab switcher -->
        <div class="auth-tabs">
          <button @click="switchTab('google')" :class="['auth-tab', activeTab === 'google' ? 'auth-tab-active' : '']">Google Login</button>
          <button @click="switchTab('email')"  :class="['auth-tab', activeTab === 'email'  ? 'auth-tab-active' : '']">Email Login</button>
        </div>

        <!-- Google tab -->
        <div v-if="activeTab === 'google'" class="auth-section">
          <button @click="initiateGoogleLogin" type="button" class="google-btn">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div v-if="authStore.error" class="auth-alert auth-alert-error">{{ authStore.error }}</div>
          <p class="auth-legal">By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>

        <!-- Email tab -->
        <div v-if="activeTab === 'email'" class="auth-section">
          <div class="auth-mode-toggle">
            <button @click="isLogin = true"  :class="['auth-mode-btn', isLogin  ? 'active' : '']">Sign In</button>
            <span class="auth-mode-sep">|</span>
            <button @click="isLogin = false" :class="['auth-mode-btn', !isLogin ? 'active' : '']">Sign Up</button>
          </div>

          <form @submit.prevent="handleEmailSubmit" class="auth-form">
            <div v-if="!isLogin" class="field">
              <label class="label">Full Name</label>
              <input v-model="name" type="text" required class="input" placeholder="John Doe" />
            </div>
            <div class="field">
              <label class="label">Email Address</label>
              <input v-model="email" type="email" required class="input" placeholder="name@example.com" />
            </div>
            <div class="field">
              <div class="label-row">
                <label class="label">Password</label>
                <button v-if="isLogin" type="button" class="forgot-btn">Forgot password?</button>
              </div>
              <input v-model="password" type="password" required :minlength="isLogin ? undefined : 6" class="input" placeholder="••••••••" />
            </div>

            <!-- Role selection (signup) -->
            <div v-if="!isLogin" class="field">
              <label class="label">I am a:</label>
              <div class="role-grid">
                <button type="button" @click="role = 'customer'"         :class="['role-btn', role === 'customer'         ? 'role-active' : '']">Customer</button>
                <button type="button" @click="role = 'tutor'"            :class="['role-btn', role === 'tutor'            ? 'role-active' : '']">Tutor</button>
                <button type="button" @click="role = 'repair_specialist'" :class="['role-btn', role === 'repair_specialist' ? 'role-active' : '']">Repair</button>
              </div>
            </div>

            <!-- Document upload (signup, tutor/repair) -->
            <div v-if="!isLogin && (role === 'tutor' || role === 'repair_specialist')" class="field">
              <label class="label">
                {{ role === 'tutor' ? 'Teaching Certificate' : 'License/Certificate' }}
                <span class="req">*</span>
              </label>
              <input type="file" @change="handleFileChange" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="file-input" />
              <p class="field-hint">JPG, PNG, PDF, DOC — Max 5MB</p>
            </div>

            <div v-if="errorMessage || authStore.error" class="auth-alert auth-alert-error">{{ errorMessage || authStore.error }}</div>

            <button type="submit" :disabled="isLoading" class="submit-btn">
              <span v-if="!isLoading">{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
              <span v-else>{{ isLogin ? 'Signing in...' : 'Creating account...' }}</span>
            </button>
          </form>

          <p class="auth-legal">By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-root { display: flex; min-height: 100vh; }

/* ---- Left Panel ---- */
.auth-left {
  display: none;
  position: relative; width: 50%; overflow: hidden;
  background: var(--mm-graphite);
}
.auth-left-overlay {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop');
  background-size: cover; background-position: center;
  opacity: 0.6;
}
.auth-left::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(17,15,22,0.25) 0%, rgba(17,15,22,0.7) 100%);
}
.auth-left-inner { position: relative; z-index: 1; padding: 2.5rem 2.5rem 0; }
.auth-left-bottom { position: relative; z-index: 1; padding: 0 2.5rem 2.5rem; margin-top: auto; }
.auth-left { flex-direction: column; }

.auth-brand { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1.25rem; }
.auth-logo-mark {
  position: relative; width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper));
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.auth-logo-mark.sm { width: 36px; height: 36px; }
.logo-ring { position: absolute; inset: 20%; border-radius: 50%; border: 1.5px solid rgba(9,8,12,0.4); }
.logo-dot  { position: absolute; inset: 42%; border-radius: 50%; background: rgba(9,8,12,0.5); }
.auth-logo-text { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; color: var(--mm-ivory); letter-spacing: -0.01em; }
.auth-logo-text.sm { font-size: 1.25rem; }
.auth-tagline { font-size: 1rem; color: var(--mm-sand); line-height: 1.5; }

.auth-quote {
  font-family: 'DM Serif Display', serif; font-size: 1.125rem; font-weight: 400;
  color: var(--mm-cream); line-height: 1.65; margin: 0 0 1.25rem;
  padding-left: 1rem; border-left: 2px solid var(--mm-gold);
}
.auth-reviewer { display: flex; align-items: center; gap: 0.875rem; }
.auth-reviewer-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper));
  color: var(--mm-ink); font-size: 0.8125rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.auth-reviewer-name { font-size: 0.875rem; font-weight: 700; color: var(--mm-ivory); }
.auth-reviewer-role { font-size: 0.75rem; color: var(--mm-sand); margin-top: 1px; }

/* ---- Right Panel ---- */
.auth-right {
  flex: 1; display: flex; flex-direction: column; justify-content: center;
  background: var(--mm-carbon);
  padding: 2.5rem 2rem;
}
.auth-mobile-brand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
.auth-form-wrap { width: 100%; max-width: 420px; margin: 0 auto; }
.auth-form-head { margin-bottom: 1.75rem; }
.auth-title { font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.auth-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

/* Tabs */
.auth-tabs { display: flex; background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.75rem; padding: 0.25rem; gap: 0.25rem; margin-bottom: 1.5rem; }
.auth-tab { flex: 1; padding: 0.5625rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; border: none; background: transparent; color: var(--mm-stone); cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.auth-tab:hover { color: var(--mm-sand); }
.auth-tab-active { background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); box-shadow: 0 4px 12px rgba(212,168,83,0.25); }

/* Sections */
.auth-section { display: flex; flex-direction: column; gap: 1rem; }

/* Google button */
.google-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  width: 100%; padding: 0.875rem 1.25rem;
  background: var(--mm-ivory); border: 1px solid rgba(255,255,255,0.15); border-radius: 0.75rem;
  color: #111827; font-size: 0.9375rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
}
.google-btn:hover { background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.4); transform: translateY(-1px); }
.google-icon { width: 20px; height: 20px; flex-shrink: 0; }

/* Mode toggle */
.auth-mode-toggle { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.auth-mode-btn { background: none; border: none; padding: 0.25rem 0.75rem; font-size: 0.9375rem; font-weight: 600; color: var(--mm-stone); cursor: pointer; transition: color 0.2s; font-family: 'DM Sans', sans-serif; border-radius: 0.375rem; }
.auth-mode-btn.active { color: var(--mm-gold); }
.auth-mode-btn:hover:not(.active) { color: var(--mm-sand); }
.auth-mode-sep { color: var(--mm-warm-line); }

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 0.875rem; }
.field { display: flex; flex-direction: column; gap: 0.3125rem; }
.label { font-size: 0.8125rem; font-weight: 600; color: var(--mm-sand); }
.req { color: var(--mm-coral); }
.label-row { display: flex; justify-content: space-between; align-items: center; }
.forgot-btn { font-size: 0.8125rem; font-weight: 600; color: var(--mm-gold); background: none; border: none; cursor: pointer; padding: 0; transition: opacity 0.2s; font-family: 'DM Sans', sans-serif; }
.forgot-btn:hover { opacity: 0.8; }

.input {
  padding: 0.6875rem 0.875rem;
  background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem;
  font-size: 0.9375rem; color: var(--mm-ivory); outline: none; width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif;
}
.input::placeholder { color: var(--mm-stone); }
.input:focus { border-color: var(--mm-gold); box-shadow: 0 0 0 3px rgba(212,168,83,0.12); }

/* Role buttons */
.role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.role-btn {
  padding: 0.5625rem 0.5rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 600;
  background: var(--mm-mist); border: 1px solid var(--mm-warm-line); color: var(--mm-sand);
  cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.role-btn:hover { border-color: rgba(212,168,83,0.3); color: var(--mm-ivory); }
.role-active { background: rgba(212,168,83,0.1); border-color: rgba(212,168,83,0.4); color: var(--mm-gold); }

/* File input */
.file-input {
  width: 100%; padding: 0.5rem 0.875rem;
  background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem;
  font-size: 0.8125rem; color: var(--mm-ivory); cursor: pointer; font-family: 'DM Sans', sans-serif;
}
.file-input::file-selector-button {
  padding: 0.375rem 0.875rem; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper));
  color: var(--mm-ink); border: none; border-radius: 0.375rem; font-size: 0.8125rem; font-weight: 700;
  cursor: pointer; margin-right: 0.75rem; font-family: 'DM Sans', sans-serif;
}
.field-hint { font-size: 0.6875rem; color: var(--mm-stone); }

/* Alerts */
.auth-alert { padding: 0.75rem 1rem; border-radius: 0.625rem; font-size: 0.8125rem; font-weight: 500; }
.auth-alert-error { background: rgba(224,112,96,0.1); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.25); }

/* Submit */
.submit-btn {
  width: 100%; padding: 0.875rem;
  background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink);
  border: none; border-radius: 0.625rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  box-shadow: 0 4px 16px rgba(212,168,83,0.25);
}
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(212,168,83,0.35); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.auth-legal { text-align: center; font-size: 0.6875rem; color: var(--mm-stone); }

/* Responsive */
@media (min-width: 1024px) {
  .auth-left { display: flex; }
  .auth-right { padding: 3rem 4rem; }
  .auth-mobile-brand { display: none; }
}
@media (max-width: 1023px) {
  .auth-mobile-brand { display: flex; }
}
</style>
