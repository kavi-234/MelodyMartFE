<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Account Settings</h1>
        <p class="page-subtitle">Manage your profile and account preferences.</p>
      </div>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading profile...</p></div>
    <div v-else-if="error && !user" class="state-box"><p class="err">{{ error }}</p></div>

    <div v-else-if="user" class="settings-grid">
      <div class="left-col">
        <!-- Profile form -->
        <div class="card">
          <h2 class="card-title">Profile Information</h2>

          <div class="avatar-section">
            <div class="avatar-wrap">
              <img v-if="avatarPreview || user.avatar" :src="avatarPreview || user.avatar" class="avatar-img" alt="avatar" />
              <div v-else class="avatar-initials">{{ getInitials(user.name) }}</div>
              <label class="avatar-edit-btn" title="Change photo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <input type="file" id="avatar" accept="image/jpeg,image/jpg,image/png" @change="handleAvatarChange" class="hidden-input" />
              </label>
            </div>
            <div class="avatar-hint">JPG or PNG, max 2MB</div>
          </div>

          <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
          <div v-if="error" class="alert alert-error">{{ error }}</div>

          <form @submit.prevent="handleSubmit" class="form">
            <div class="field">
              <label class="label">Full Name *</label>
              <input v-model="formData.name" type="text" class="input" placeholder="Your name" required />
            </div>
            <div class="field">
              <label class="label">Email</label>
              <input :value="user.email" type="email" class="input input-readonly" readonly />
              <span class="field-hint">Email cannot be changed.</span>
            </div>

            <!-- Customer: phone -->
            <div v-if="user.role === 'customer'" class="field">
              <label class="label">Phone Number</label>
              <input v-model="formData.phone" type="tel" class="input" placeholder="+1 (555) 000-0000" />
            </div>

            <!-- Tutor specific -->
            <template v-if="user.role === 'tutor'">
              <div class="field">
                <label class="label">Specialization</label>
                <input v-model="formData.specialization" type="text" class="input" placeholder="e.g., Piano, Guitar" />
              </div>
              <div class="grid-2">
                <div class="field">
                  <label class="label">Experience (years)</label>
                  <input v-model="formData.experience" type="number" min="0" class="input" placeholder="0" />
                </div>
                <div class="field">
                  <label class="label">Hourly Rate (Rs)</label>
                  <input v-model="formData.hourlyRate" type="number" min="0" class="input" placeholder="0" />
                </div>
              </div>
              <div class="field">
                <label class="label">Bio</label>
                <textarea v-model="formData.bio" rows="4" class="input textarea" placeholder="Tell students about yourself..."></textarea>
              </div>
            </template>

            <!-- Repair specialist specific -->
            <template v-if="user.role === 'repair_specialist'">
              <div class="field">
                <label class="label">Years of Experience</label>
                <input v-model="formData.experience" type="text" class="input" placeholder="e.g., 5 years" />
              </div>
              <div class="field">
                <label class="label">Specialization</label>
                <input v-model="formData.specialization" type="text" class="input" placeholder="e.g., Guitar Repair, Piano" />
              </div>
            </template>

            <button type="submit" :disabled="saving" class="submit-btn">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
          </form>
        </div>
      </div>

      <div class="right-col">
        <!-- Account Info -->
        <div class="card">
          <h2 class="card-title">Account Information</h2>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">Account Type</span>
              <span class="role-chip" :class="roleChipClass(user.role)">{{ user.role.replace('_', ' ').toUpperCase() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Sign-in Method</span>
              <span class="info-val capitalize">{{ user.authProvider }}</span>
            </div>
            <div v-if="user.role !== 'customer'" class="info-row">
              <span class="info-label">Verification</span>
              <span class="status-chip" :class="statusChipClass(user.verificationStatus)">{{ user.verificationStatus.replace('_', ' ') }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Member Since</span>
              <span class="info-val">{{ formatDate(user.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Security / Password -->
        <div class="card" v-if="canChangePassword">
          <h2 class="card-title">Security</h2>
          <p class="security-desc">Keep your account secure with a strong password.</p>
          <div v-if="pwSuccess" class="alert alert-success">{{ pwSuccess }}</div>
          <div v-if="pwError"   class="alert alert-error">{{ pwError }}</div>
          <form @submit.prevent="changePassword" class="form mt-sm">
            <div class="field">
              <label class="label">Current Password</label>
              <input v-model="pw.current" type="password" class="input" placeholder="Current password" autocomplete="current-password" />
            </div>
            <div class="field">
              <label class="label">New Password</label>
              <input v-model="pw.newPw" type="password" class="input" placeholder="At least 6 characters" autocomplete="new-password" />
            </div>
            <div class="field">
              <label class="label">Confirm New Password</label>
              <input v-model="pw.confirm" type="password" class="input" placeholder="Repeat new password" autocomplete="new-password" />
            </div>
            <button type="submit" :disabled="pwSaving" class="submit-btn">{{ pwSaving ? 'Changing...' : 'Change Password' }}</button>
          </form>
        </div>

        <div class="card" v-else>
          <h2 class="card-title">Security</h2>
          <div class="google-note">
            <div class="google-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <p>Your account uses Google Sign-In. Manage your password through your Google account.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const user = ref<any>(null)
const loading = ref(false); const saving = ref(false)
const error = ref(''); const successMessage = ref('')
const avatarFile = ref<File | null>(null); const avatarPreview = ref<string | null>(null)
const pwSaving = ref(false); const pwSuccess = ref(''); const pwError = ref('')

const formData = reactive({ name: '', phone: '', experience: '', specialization: '', hourlyRate: '', bio: '' })
const pw = reactive({ current: '', newPw: '', confirm: '' })

const canChangePassword = computed(() => user.value?.authProvider === 'local')

const fetchUserProfile = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth'); return }
    const res = await fetch('http://localhost:5000/api/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) { if (res.status === 401) { authStore.logout(); router.push('/auth') }; throw new Error('Failed to fetch profile') }
    const data = await res.json()
    user.value = data.user
    Object.assign(formData, { name: data.user.name || '', phone: data.user.phone || '', experience: data.user.experience || '', specialization: data.user.specialization || '', hourlyRate: data.user.hourlyRate || '', bio: data.user.bio || '' })
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const handleAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return
  if (file.size > 2 * 1024 * 1024) { error.value = 'Avatar must be under 2MB'; return }
  if (!['image/jpeg','image/jpg','image/png'].includes(file.type)) { error.value = 'Avatar must be JPG or PNG'; return }
  avatarFile.value = file
  const r = new FileReader(); r.onload = (e) => { avatarPreview.value = e.target?.result as string }; r.readAsDataURL(file)
}

const handleSubmit = async () => {
  error.value = ''; successMessage.value = ''
  if (!formData.name || formData.name.trim().length < 2) { error.value = 'Name must be at least 2 characters'; return }
  saving.value = true
  try {
    const token = localStorage.getItem('token')
    const fd = new FormData()
    fd.append('name', formData.name.trim())
    if (user.value?.role === 'customer' && formData.phone) fd.append('phone', formData.phone.trim())
    if (user.value?.role === 'tutor') { if (formData.experience) fd.append('experience', String(formData.experience)); if (formData.specialization) fd.append('specialization', formData.specialization.trim()); if (formData.hourlyRate) fd.append('hourlyRate', String(formData.hourlyRate)); if (formData.bio) fd.append('bio', formData.bio.trim()) }
    if (user.value?.role === 'repair_specialist') { if (formData.experience) fd.append('experience', String(formData.experience)); if (formData.specialization) fd.append('specialization', formData.specialization.trim()) }
    if (avatarFile.value) fd.append('avatar', avatarFile.value)
    const res = await fetch('http://localhost:5000/api/me', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to update profile')
    user.value = data.user; authStore.user = data.user; localStorage.setItem('user', JSON.stringify(data.user))
    successMessage.value = 'Profile updated successfully!'; avatarFile.value = null; avatarPreview.value = null
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (e: any) { error.value = e.message }
  finally { saving.value = false }
}

const changePassword = async () => {
  pwError.value = ''; pwSuccess.value = ''
  if (!pw.current || !pw.newPw || !pw.confirm) { pwError.value = 'All fields are required.'; return }
  if (pw.newPw !== pw.confirm) { pwError.value = 'Passwords do not match.'; return }
  if (pw.newPw.length < 6) { pwError.value = 'Password must be at least 6 characters.'; return }
  pwSaving.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/me/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw }) })
    if (!res.ok) { const d = await res.json(); throw new Error(d.message) }
    pwSuccess.value = 'Password changed successfully!'; Object.assign(pw, { current: '', newPw: '', confirm: '' })
  } catch (e: any) { pwError.value = e.message }
  finally { pwSaving.value = false }
}

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
const roleChipClass = (r: string) => ({ 'chip-teal': r === 'customer', 'chip-gold': r === 'tutor', 'chip-copper': r === 'repair_specialist', 'chip-coral': r === 'admin' })
const statusChipClass = (s: string) => ({ 'chip-emerald': s === 'APPROVED', 'chip-coral': s === 'REJECTED', 'chip-gold': s !== 'APPROVED' && s !== 'REJECTED' })
onMounted(fetchUserProfile)
</script>

<style scoped>
.page { max-width: 1050px; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-teal); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.err { color: var(--mm-coral); }

.settings-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 1.25rem; align-items: start; }
.left-col, .right-col { display: flex; flex-direction: column; gap: 1.25rem; }
.card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.5rem; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1.125rem; }

/* Avatar */
.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
.avatar-wrap { position: relative; margin-bottom: 0.5rem; }
.avatar-img { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2px solid var(--mm-warm-line); }
.avatar-initials { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(42,157,159,0.3); }
.avatar-edit-btn { position: absolute; bottom: -2px; right: -2px; width: 28px; height: 28px; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--mm-sand); cursor: pointer; transition: all 0.2s; }
.avatar-edit-btn:hover { background: var(--mm-carbon); color: var(--mm-teal); border-color: rgba(42,157,159,0.3); }
.hidden-input { display: none; }
.avatar-hint { font-size: 0.6875rem; color: var(--mm-stone); }

.alert { padding: 0.625rem 0.875rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 600; margin-bottom: 1rem; }
.alert-success { background: rgba(56,168,130,0.1); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.alert-error   { background: rgba(224,112,96,0.1); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

.form { display: flex; flex-direction: column; gap: 0.875rem; }
.mt-sm { margin-top: 0.25rem; }
.field { display: flex; flex-direction: column; gap: 0.3125rem; }
.label { font-size: 0.8125rem; font-weight: 600; color: var(--mm-sand); }
.input { padding: 0.625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; color: var(--mm-ivory); font-size: 0.9375rem; outline: none; width: 100%; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, box-shadow 0.2s; }
.input::placeholder { color: var(--mm-stone); }
.input:focus { border-color: var(--mm-teal); box-shadow: 0 0 0 3px rgba(42,157,159,0.1); }
.input-readonly { background: rgba(46,41,60,0.5); color: var(--mm-stone); cursor: not-allowed; }
.textarea { resize: vertical; min-height: 90px; }
.field-hint { font-size: 0.6875rem; color: var(--mm-stone); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
.submit-btn { padding: 0.75rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 12px rgba(42,157,159,0.25); }
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(42,157,159,0.35); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.info-list { display: flex; flex-direction: column; gap: 0.625rem; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.625rem 0.875rem; background: rgba(42,157,159,0.04); border: 1px solid rgba(42,157,159,0.06); border-radius: 0.5rem; }
.info-label { font-size: 0.75rem; font-weight: 600; color: var(--mm-stone); }
.info-val { font-size: 0.875rem; font-weight: 700; color: var(--mm-ivory); }
.capitalize { text-transform: capitalize; }

.role-chip, .status-chip { display: inline-flex; align-items: center; padding: 0.2rem 0.625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.chip-teal    { background: rgba(42,157,159,0.12);  color: var(--mm-teal);    border: 1px solid rgba(42,157,159,0.25); }
.chip-gold    { background: rgba(212,168,83,0.12);  color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.chip-copper  { background: rgba(192,123,80,0.12);  color: var(--mm-copper);  border: 1px solid rgba(192,123,80,0.25); }
.chip-coral   { background: rgba(224,112,96,0.12);  color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }
.chip-emerald { background: rgba(56,168,130,0.12);  color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }

.security-desc { font-size: 0.875rem; color: var(--mm-sand); margin: 0 0 0.75rem; }
.google-note { display: flex; gap: 0.875rem; align-items: flex-start; }
.google-icon-wrap { width: 36px; height: 36px; border-radius: 0.5rem; background: rgba(42,157,159,0.1); color: var(--mm-teal); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.google-note p { font-size: 0.875rem; color: var(--mm-sand); line-height: 1.55; margin: 0; }

@media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } .grid-2 { grid-template-columns: 1fr; } }
</style>
