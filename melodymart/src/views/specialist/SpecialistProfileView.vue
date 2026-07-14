<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Profile Settings</h1>
        <p class="page-subtitle">Manage your public profile and account settings.</p>
      </div>
    </div>

    <div class="two-col">
      <!-- Profile form -->
      <div class="card">
        <h2 class="card-title">Profile Information</h2>

        <div class="avatar-section">
          <div class="avatar-wrap">
            <img v-if="avatarPreview" :src="avatarPreview" class="avatar-img" alt="avatar" />
            <div v-else class="avatar-initials">{{ getInitials(form.name) }}</div>
            <label class="avatar-edit-btn" title="Change photo">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <input type="file" accept="image/jpeg,image/png" @change="onAvatarChange" class="avatar-input" />
            </label>
          </div>
          <div class="avatar-hint">JPG or PNG, max 2MB</div>
        </div>

        <div v-if="profileSuccess" class="alert alert-success">{{ profileSuccess }}</div>
        <div v-if="profileError"   class="alert alert-error">{{ profileError }}</div>

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
            <label class="label">Phone</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="Your phone number" />
          </div>
          <div class="field">
            <label class="label">Specialization</label>
            <input v-model="form.specialization" type="text" class="input" placeholder="e.g., Guitar Repair, Piano Tuning" />
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
            <label class="label">Certifications</label>
            <textarea v-model="form.certifications" rows="2" class="input textarea" placeholder="List any certifications..."></textarea>
          </div>
          <div class="field">
            <label class="label">Service Types</label>
            <textarea v-model="form.serviceTypes" rows="2" class="input textarea" placeholder="List services you offer..."></textarea>
          </div>
          <div class="field">
            <label class="label">Bio / About Me</label>
            <textarea v-model="form.bio" rows="4" class="input textarea" placeholder="Tell customers about your expertise..."></textarea>
          </div>
          <button type="submit" :disabled="profileSaving" class="submit-btn">
            {{ profileSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <div class="right-col">
        <!-- Account Status -->
        <div class="card">
          <h2 class="card-title">Account Status</h2>
          <div class="status-row">
            <span class="status-chip" :class="statusChipClass">{{ statusLabel }}</span>
            <span class="status-desc">{{ statusDescription }}</span>
          </div>
          <div class="info-list">
            <div class="info-row"><span class="info-label">Role</span><span class="info-val">Repair Specialist</span></div>
            <div class="info-row"><span class="info-label">Auth Provider</span><span class="info-val capitalize">{{ authStore.user?.authProvider || 'local' }}</span></div>
            <div class="info-row"><span class="info-label">Member Since</span><span class="info-val">{{ formatDate(authStore.user?.createdAt) }}</span></div>
          </div>
        </div>

        <!-- Password -->
        <div v-if="authStore.user?.authProvider === 'local'" class="card">
          <h2 class="card-title">Change Password</h2>
          <div v-if="pwSuccess" class="alert alert-success">{{ pwSuccess }}</div>
          <div v-if="pwError"   class="alert alert-error">{{ pwError }}</div>
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
            <div class="google-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
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
const form = reactive({ name: '', phone: '', specialization: '', experience: 0, hourlyRate: 0, certifications: '', serviceTypes: '', bio: '' })
const pw = reactive({ current: '', newPw: '', confirm: '' })
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')
const profileSaving = ref(false); const pwSaving = ref(false)
const profileSuccess = ref(''); const profileError = ref(''); const pwSuccess = ref(''); const pwError = ref('')

const statusLabel = computed(() => { const s = authStore.user?.verificationStatus; if (s === 'APPROVED') return 'Verified'; if (s === 'REJECTED') return 'Rejected'; return 'Pending' })
const statusChipClass = computed(() => { const s = authStore.user?.verificationStatus; if (s === 'APPROVED') return 'chip-emerald'; if (s === 'REJECTED') return 'chip-coral'; return 'chip-gold' })
const statusDescription = computed(() => { const s = authStore.user?.verificationStatus; if (s === 'APPROVED') return 'Your account is verified and visible to customers.'; if (s === 'REJECTED') return 'Your verification was rejected. Contact support.'; return 'Your account is pending admin approval.' })

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'

const onAvatarChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return
  if (file.size > 2 * 1024 * 1024) { profileError.value = 'Avatar must be under 2MB.'; return }
  avatarFile.value = file
  const reader = new FileReader(); reader.onload = (ev) => { avatarPreview.value = ev.target?.result as string }; reader.readAsDataURL(file)
}

const saveProfile = async () => {
  profileSaving.value = true; profileSuccess.value = ''; profileError.value = ''
  try {
    const token = localStorage.getItem('token')
    const fd = new FormData(); fd.append('name', form.name); fd.append('phone', form.phone); fd.append('specialization', form.specialization); fd.append('experience', String(form.experience)); fd.append('hourlyRate', String(form.hourlyRate)); fd.append('bio', form.bio); if (avatarFile.value) fd.append('avatar', avatarFile.value)
    const res = await fetch('http://localhost:5000/api/me', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to save') }
    const data = await res.json(); authStore.user = data.user; localStorage.setItem('user', JSON.stringify(data.user)); if (data.user.avatar) avatarPreview.value = data.user.avatar
    profileSuccess.value = 'Profile updated successfully!'; avatarFile.value = null
  } catch (e: any) { profileError.value = e.message }
  finally { profileSaving.value = false }
}

const changePassword = async () => {
  pwError.value = ''; pwSuccess.value = ''
  if (!pw.current || !pw.newPw || !pw.confirm) { pwError.value = 'All fields are required.'; return }
  if (pw.newPw !== pw.confirm) { pwError.value = 'New passwords do not match.'; return }
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

onMounted(() => {
  const u = authStore.user
  if (u) { form.name = u.name || ''; form.phone = u.phone || ''; form.specialization = u.specialization || ''; form.experience = u.experience || 0; form.hourlyRate = u.hourlyRate || 0; form.certifications = u.certifications || ''; form.serviceTypes = u.serviceTypes || ''; form.bio = u.bio || ''; avatarPreview.value = u.avatar || '' }
})
</script>

<style scoped>
.page { max-width: 1100px; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.two-col { display: grid; grid-template-columns: 3fr 2fr; gap: 1.25rem; align-items: start; }
.right-col { display: flex; flex-direction: column; gap: 1.25rem; }
.card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.5rem; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1.125rem; }

/* Avatar */
.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
.avatar-wrap { position: relative; margin-bottom: 0.5rem; }
.avatar-img { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2px solid var(--mm-warm-line); }
.avatar-initials { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(192,123,80,0.3); }
.avatar-edit-btn { position: absolute; bottom: -2px; right: -2px; width: 28px; height: 28px; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--mm-sand); cursor: pointer; transition: all 0.2s; }
.avatar-edit-btn:hover { background: var(--mm-carbon); color: var(--mm-copper); border-color: rgba(192,123,80,0.3); }
.avatar-input { display: none; }
.avatar-hint { font-size: 0.6875rem; color: var(--mm-stone); }

/* Alerts */
.alert { padding: 0.625rem 0.875rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 600; margin-bottom: 1rem; }
.alert-success { background: rgba(56,168,130,0.1); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.alert-error   { background: rgba(224,112,96,0.1); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

/* Form */
.form { display: flex; flex-direction: column; gap: 0.875rem; }
.field { display: flex; flex-direction: column; gap: 0.3125rem; }
.label { font-size: 0.8125rem; font-weight: 600; color: var(--mm-sand); }
.input { padding: 0.625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; color: var(--mm-ivory); font-size: 0.9375rem; outline: none; width: 100%; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, box-shadow 0.2s; }
.input::placeholder { color: var(--mm-stone); }
.input:focus { border-color: var(--mm-copper); box-shadow: 0 0 0 3px rgba(192,123,80,0.1); }
.input-readonly { background: rgba(46,41,60,0.5); color: var(--mm-stone); cursor: not-allowed; }
.textarea { resize: vertical; min-height: 80px; }
.field-hint { font-size: 0.6875rem; color: var(--mm-stone); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
.submit-btn { padding: 0.75rem; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 12px rgba(192,123,80,0.25); }
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(192,123,80,0.35); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Status card */
.status-row { display: flex; align-items: flex-start; gap: 0.875rem; margin-bottom: 1rem; flex-wrap: wrap; }
.status-chip { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8125rem; font-weight: 700; flex-shrink: 0; }
.chip-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.chip-gold    { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.chip-coral   { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }
.status-desc { font-size: 0.8125rem; color: var(--mm-sand); line-height: 1.5; }
.info-list { display: flex; flex-direction: column; gap: 0.5rem; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.625rem 0.875rem; background: rgba(192,123,80,0.04); border: 1px solid rgba(192,123,80,0.06); border-radius: 0.5rem; }
.info-label { font-size: 0.75rem; font-weight: 600; color: var(--mm-stone); }
.info-val { font-size: 0.875rem; font-weight: 700; color: var(--mm-ivory); }
.capitalize { text-transform: capitalize; }

/* Google note */
.google-note { display: flex; gap: 0.875rem; align-items: flex-start; }
.google-icon-wrap { width: 36px; height: 36px; border-radius: 0.5rem; background: rgba(192,123,80,0.1); color: var(--mm-copper); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.google-note p { font-size: 0.875rem; color: var(--mm-sand); line-height: 1.55; margin: 0; }

@media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } .grid-2 { grid-template-columns: 1fr; } }
</style>
