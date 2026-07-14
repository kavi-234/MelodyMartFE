<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Profile Settings</h1>
        <p class="page-subtitle">Manage your public profile and account settings.</p>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <h2 class="card-title">Profile Information</h2>

        <div class="avatar-section">
          <div class="avatar-wrap">
            <img v-if="avatarPreview" :src="avatarPreview" class="avatar-img" alt="avatar" />
            <div v-else class="avatar-initials">{{ getInitials(form.name) }}</div>
            <label class="avatar-edit-btn" title="Change photo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <input type="file" accept="image/jpeg,image/png" @change="onAvatarChange" class="avatar-input" />
            </label>
          </div>
          <div class="avatar-hint">JPG or PNG, max 2MB</div>
        </div>

        <div v-if="profileSuccess" class="alert alert-success">✓ {{ profileSuccess }}</div>
        <div v-if="profileError" class="alert alert-error">⚠ {{ profileError }}</div>

        <form @submit.prevent="saveProfile" class="form">
          <div class="field">
            <label class="label">Full Name</label>
            <input v-model="form.name" type="text" class="input" placeholder="Your full name" />
          </div>
          <div class="field">
            <label class="label">Email</label>
            <input :value="authStore.user?.email" type="email" class="input input-readonly" readonly />
            <span class="field-hint">Email cannot be changed.</span>
          </div>
          <div class="field">
            <label class="label">Specialization</label>
            <input v-model="form.specialization" type="text" class="input" placeholder="e.g., Piano, Guitar, Violin" />
          </div>
          <div class="grid-2">
            <div class="field">
              <label class="label">Experience (years)</label>
              <input v-model.number="form.experience" type="number" min="0" class="input" placeholder="0" />
            </div>
            <div class="field">
              <label class="label">Hourly Rate (Rs)</label>
              <input v-model.number="form.hourlyRate" type="number" min="0" step="50" class="input" placeholder="0" />
            </div>
          </div>
          <div class="field">
            <label class="label">Bio / About Me</label>
            <textarea v-model="form.bio" rows="4" class="input textarea" placeholder="Tell students about your teaching approach, background, and style..."></textarea>
          </div>
          <button type="submit" :disabled="profileSaving" class="submit-btn">
            {{ profileSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <div class="right-col">
        <div class="card">
          <h2 class="card-title">Account Status</h2>
          <div class="status-row">
            <span class="status-chip" :class="statusChipClass">{{ statusLabel }}</span>
            <span class="status-text">{{ statusDescription }}</span>
          </div>
          <div class="info-list">
            <div class="info-row"><span class="info-label">Role</span><span class="info-val">Tutor</span></div>
            <div class="info-row"><span class="info-label">Auth Provider</span><span class="info-val capitalize">{{ authStore.user?.authProvider || 'local' }}</span></div>
            <div class="info-row"><span class="info-label">Member Since</span><span class="info-val">{{ formatDate(authStore.user?.createdAt) }}</span></div>
          </div>
        </div>

        <div v-if="authStore.user?.authProvider === 'local'" class="card">
          <h2 class="card-title">Change Password</h2>
          <div v-if="pwSuccess" class="alert alert-success">✓ {{ pwSuccess }}</div>
          <div v-if="pwError" class="alert alert-error">⚠ {{ pwError }}</div>
          <form @submit.prevent="changePassword" class="form">
            <div class="field">
              <label class="label">Current Password</label>
              <input v-model="pw.current" type="password" class="input" placeholder="Enter current password" autocomplete="current-password" />
            </div>
            <div class="field">
              <label class="label">New Password</label>
              <input v-model="pw.newPw" type="password" class="input" placeholder="At least 6 characters" autocomplete="new-password" />
            </div>
            <div class="field">
              <label class="label">Confirm New Password</label>
              <input v-model="pw.confirm" type="password" class="input" placeholder="Repeat new password" autocomplete="new-password" />
            </div>
            <button type="submit" :disabled="pwSaving" class="submit-btn">
              {{ pwSaving ? 'Changing...' : 'Change Password' }}
            </button>
          </form>
        </div>

        <div v-else class="card">
          <h2 class="card-title">Password</h2>
          <div class="google-note">
            <span class="google-icon">🔐</span>
            <p>Your account uses Google Sign-In. Password management is handled through your Google account.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const form = reactive({ name: '', specialization: '', experience: 0, hourlyRate: 0, bio: '' })
const pw = reactive({ current: '', newPw: '', confirm: '' })
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')
const profileSaving = ref(false)
const pwSaving = ref(false)
const profileSuccess = ref('')
const profileError = ref('')
const pwSuccess = ref('')
const pwError = ref('')

const statusLabel = computed(() => { const s = authStore.user?.verificationStatus; if (s === 'APPROVED') return 'Verified'; if (s === 'REJECTED') return 'Rejected'; return 'Pending' })
const statusChipClass = computed(() => { const s = authStore.user?.verificationStatus; if (s === 'APPROVED') return 'chip-green'; if (s === 'REJECTED') return 'chip-red'; return 'chip-amber' })
const statusDescription = computed(() => {
  const s = authStore.user?.verificationStatus
  if (s === 'APPROVED') return 'Your account is verified and visible to students.'
  if (s === 'REJECTED') return 'Your verification was rejected. Contact support.'
  return 'Your account is pending admin approval.'
})

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'

const onAvatarChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { profileError.value = 'Avatar must be under 2MB.'; return }
  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

const saveProfile = async () => {
  profileSaving.value = true; profileSuccess.value = ''; profileError.value = ''
  try {
    const token = localStorage.getItem('token')
    const fd = new FormData()
    fd.append('name', form.name); fd.append('specialization', form.specialization)
    fd.append('experience', String(form.experience)); fd.append('hourlyRate', String(form.hourlyRate)); fd.append('bio', form.bio)
    if (avatarFile.value) fd.append('avatar', avatarFile.value)
    const res = await fetch('http://localhost:5000/api/me', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to save') }
    const data = await res.json()
    authStore.user = data.user; localStorage.setItem('user', JSON.stringify(data.user))
    if (data.user.avatar) avatarPreview.value = data.user.avatar
    profileSuccess.value = 'Profile updated successfully!'; avatarFile.value = null
  } catch (e: any) { profileError.value = e.message }
  finally { profileSaving.value = false }
}

const changePassword = async () => {
  pwError.value = ''; pwSuccess.value = ''
  if (!pw.current || !pw.newPw || !pw.confirm) { pwError.value = 'All fields are required.'; return }
  if (pw.newPw !== pw.confirm) { pwError.value = 'New passwords do not match.'; return }
  if (pw.newPw.length < 6) { pwError.value = 'New password must be at least 6 characters.'; return }
  pwSaving.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/me/password', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw }),
    })
    if (!res.ok) { const d = await res.json(); throw new Error(d.message) }
    pwSuccess.value = 'Password changed successfully!'
    Object.assign(pw, { current: '', newPw: '', confirm: '' })
  } catch (e: any) { pwError.value = e.message }
  finally { pwSaving.value = false }
}

onMounted(() => {
  const u = authStore.user
  if (u) { form.name = u.name || ''; form.specialization = u.specialization || ''; form.experience = u.experience || 0; form.hourlyRate = u.hourlyRate || 0; form.bio = u.bio || ''; avatarPreview.value = u.avatar || '' }
})
</script>

<style scoped>
.page { max-width: 1100px; padding: 1.75rem 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.two-col { display: grid; grid-template-columns: 3fr 2fr; gap: 1.25rem; align-items: start; }
.right-col { display: flex; flex-direction: column; gap: 1.25rem; }
.card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.5rem; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1.125rem; }

.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
.avatar-wrap { position: relative; margin-bottom: 0.5rem; }
.avatar-img { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2px solid var(--mm-warm-line); }
.avatar-initials { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); font-size: 1.875rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(212,168,83,0.3); }
.avatar-edit-btn { position: absolute; bottom: 2px; right: 2px; width: 26px; height: 26px; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--mm-sand); cursor: pointer; transition: all 0.2s; }
.avatar-edit-btn:hover { background: rgba(212,168,83,0.15); color: var(--mm-gold); border-color: rgba(212,168,83,0.3); }
.avatar-input { display: none; }
.avatar-hint { font-size: 0.6875rem; color: var(--mm-stone); }

.alert { padding: 0.625rem 0.875rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 600; margin-bottom: 1rem; }
.alert-success { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.alert-error   { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

.form { display: flex; flex-direction: column; gap: 0.875rem; }
.field { display: flex; flex-direction: column; gap: 0.3125rem; }
.label { font-size: 0.8125rem; font-weight: 600; color: var(--mm-sand); }
.input { padding: 0.625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; font-size: 0.875rem; color: var(--mm-ivory); outline: none; width: 100%; transition: border-color 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; }
.input::placeholder { color: var(--mm-stone); }
.input:focus { border-color: var(--mm-gold); box-shadow: 0 0 0 3px rgba(212,168,83,0.1); }
.input-readonly { background: rgba(46,41,60,0.5); color: var(--mm-stone); cursor: not-allowed; }
.textarea { resize: vertical; min-height: 100px; }
.field-hint { font-size: 0.6875rem; color: var(--mm-stone); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }

.submit-btn { padding: 0.75rem; background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(212,168,83,0.2); margin-top: 0.25rem; font-family: 'DM Sans', sans-serif; }
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(212,168,83,0.3); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.status-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.status-chip { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8125rem; font-weight: 700; }
.chip-green { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.chip-amber { background: rgba(212,168,83,0.12); color: var(--mm-gold); border: 1px solid rgba(212,168,83,0.25); }
.chip-red   { background: rgba(224,112,96,0.12); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.25); }
.status-text { font-size: 0.75rem; color: var(--mm-sand); }
.info-list { display: flex; flex-direction: column; gap: 0.5rem; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: rgba(212,168,83,0.04); border-radius: 0.5rem; }
.info-label { font-size: 0.75rem; font-weight: 600; color: var(--mm-stone); }
.info-val { font-size: 0.8125rem; font-weight: 700; color: var(--mm-ivory); }
.capitalize { text-transform: capitalize; }

.google-note { display: flex; gap: 0.75rem; align-items: flex-start; }
.google-icon { font-size: 1.375rem; flex-shrink: 0; }
.google-note p { font-size: 0.8125rem; color: var(--mm-sand); line-height: 1.5; margin: 0; }

@media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } .grid-2 { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .page { padding: 1.25rem; } .card { padding: 1.125rem; } }
</style>
