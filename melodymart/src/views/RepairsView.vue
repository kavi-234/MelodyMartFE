<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

interface Specialist {
  _id: string; name: string; email: string; phone?: string
  specialization?: string; experience?: string; hourlyRate?: number
  avatar?: string; certifications?: string; serviceTypes?: string; bio?: string
}

const SERVICE_TYPES = [
  'String Replacement', 'Tuning & Setup', 'Electronics Repair',
  'Body / Finish Repair', 'Cleaning & Maintenance', 'Bridge / Nut Replacement',
  'Neck / Fretboard Work', 'Custom Modification', 'Other',
]

const router = useRouter()
const authStore = useAuthStore()
const specialists = ref<Specialist[]>([])
const loading = ref(true)
const error = ref('')
const showProfile = ref(false)
const selectedSpecialist = ref<Specialist | null>(null)
const loadingProfile = ref(false)
const showRequestModal = ref(false)
const requestingSpecialist = ref<Specialist | null>(null)
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)
const requestForm = reactive({ serviceType: '', description: '', preferredDate: '' })

const avatarPlaceholder = new URL('../assets/placeholders/avatar-default.svg', import.meta.url).href

const fetchSpecialists = async () => {
  try {
    loading.value = true
    const response = await fetch('http://localhost:5000/api/specialists/all')
    const data = await response.json()
    specialists.value = data.success ? data.specialists : []
    if (!data.success) error.value = 'Failed to load specialists'
  } catch { error.value = 'Failed to load specialists' }
  finally { loading.value = false }
}

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return avatarPlaceholder
  if (avatar.startsWith('data:image') || avatar.startsWith('http')) return avatar
  return avatarPlaceholder
}
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
const onImgError = (e: Event) => {
  const t = e.target as HTMLImageElement
  if (t.dataset.fallbackApplied) return
  t.src = avatarPlaceholder; t.dataset.fallbackApplied = 'true'
}

const handleViewProfile = async (id: string) => {
  loadingProfile.value = true; showProfile.value = true
  try {
    const r = await fetch(`http://localhost:5000/api/specialists/${id}`)
    if (r.ok) { const d = await r.json(); selectedSpecialist.value = d.specialist }
  } catch { /* ignore */ }
  finally { loadingProfile.value = false }
}
const closeProfile = () => { showProfile.value = false; selectedSpecialist.value = null }

const openRequestModal = (specialist: Specialist) => {
  if (!authStore.isAuthenticated) { router.push('/auth'); return }
  requestingSpecialist.value = specialist
  Object.assign(requestForm, { serviceType: '', description: '', preferredDate: '' })
  submitError.value = ''; submitSuccess.value = false
  showProfile.value = false; showRequestModal.value = true
}
const closeRequestModal = () => { showRequestModal.value = false; requestingSpecialist.value = null; submitError.value = ''; submitSuccess.value = false }

const submitRequest = async () => {
  if (!requestForm.serviceType) { submitError.value = 'Please select a service type.'; return }
  submitting.value = true; submitError.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/service-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ specialistId: requestingSpecialist.value!._id, serviceType: requestForm.serviceType, description: requestForm.description, preferredDate: requestForm.preferredDate || undefined }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to submit')
    submitSuccess.value = true
    setTimeout(() => { closeRequestModal(); router.push('/dashboard/customer/services') }, 1200)
  } catch (err: any) { submitError.value = err.message || 'Failed to submit request.' }
  finally { submitting.value = false }
}

onMounted(fetchSpecialists)
</script>

<template>
  <main class="rv-page">
    <div class="rv-hero">
      <div class="rv-hero-glow" aria-hidden="true" />
      <div class="rv-hero-inner">
        <span class="rv-badge">Expert Technicians</span>
        <h1 class="rv-hero-title">Repair Specialists</h1>
        <p class="rv-hero-sub">From tuning to total restoration — our verified technicians keep your instruments sounding their best.</p>
      </div>
    </div>

    <div class="rv-body">
      <div v-if="loading" class="rv-state"><div class="rv-spinner" /><p>Loading specialists...</p></div>
      <div v-else-if="error" class="rv-state"><p class="rv-error-msg">{{ error }}</p></div>
      <div v-else-if="specialists.length === 0" class="rv-state"><p>No specialists available at the moment.</p></div>

      <div v-else class="rv-grid">
        <div v-for="s in specialists" :key="s._id" class="rv-card">
          <div class="rv-card-img">
            <img v-if="s.avatar" :src="getAvatarUrl(s.avatar)" :alt="s.name" class="rv-img" @error="onImgError" />
            <div v-else class="rv-initials">{{ getInitials(s.name) }}</div>
            <span class="rv-verified">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              Verified
            </span>
          </div>
          <div class="rv-card-body">
            <h3 class="rv-name">{{ s.name }}</h3>
            <p class="rv-spec">{{ s.specialization || 'Instrument Repair' }}</p>
            <div class="rv-meta">
              <div v-if="s.experience" class="rv-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ s.experience }} experience
              </div>
              <div v-if="s.hourlyRate" class="rv-meta-row rv-meta-rate">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                Rs {{ s.hourlyRate }}/hr
              </div>
              <div v-if="s.phone" class="rv-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                {{ s.phone }}
              </div>
            </div>
            <div class="rv-card-btns">
              <button @click="handleViewProfile(s._id)" class="rv-btn-primary">View Profile</button>
              <button @click="openRequestModal(s)" class="rv-btn-outline">Request Service</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <Teleport to="body">
      <div v-if="showProfile" class="rv-overlay" @click.self="closeProfile">
        <div class="rv-modal">
          <div class="rv-modal-hdr">
            <h3 class="rv-modal-title">Specialist Profile</h3>
            <button @click="closeProfile" class="rv-modal-close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div v-if="loadingProfile" class="rv-modal-loading"><div class="rv-spinner" /></div>
          <div v-else-if="selectedSpecialist" class="rv-modal-body">
            <div class="rv-profile-top">
              <div class="rv-profile-avatar-wrap">
                <div class="rv-profile-avatar">
                  <img v-if="selectedSpecialist.avatar" :src="getAvatarUrl(selectedSpecialist.avatar)" class="rv-profile-img" @error="onImgError" />
                  <div v-else class="rv-profile-initials">{{ getInitials(selectedSpecialist.name) }}</div>
                </div>
                <span class="rv-verified-dot"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
              </div>
              <div>
                <h4 class="rv-profile-name">{{ selectedSpecialist.name }}</h4>
                <p class="rv-profile-spec">{{ selectedSpecialist.specialization || 'Instrument Repair' }}</p>
                <div class="rv-profile-chips">
                  <span class="rv-chip rv-chip-emerald">Verified Specialist</span>
                  <span v-if="selectedSpecialist.experience" class="rv-chip rv-chip-copper">{{ selectedSpecialist.experience }}</span>
                </div>
              </div>
            </div>
            <p v-if="selectedSpecialist.bio" class="rv-bio">{{ selectedSpecialist.bio }}</p>
            <div v-if="selectedSpecialist.serviceTypes" class="rv-profile-section">
              <p class="rv-section-lbl">Services</p>
              <p class="rv-section-val">{{ selectedSpecialist.serviceTypes }}</p>
            </div>
            <div v-if="selectedSpecialist.certifications" class="rv-profile-section">
              <p class="rv-section-lbl">Certifications</p>
              <p class="rv-section-val">{{ selectedSpecialist.certifications }}</p>
            </div>
            <div class="rv-info-grid">
              <div v-if="selectedSpecialist.hourlyRate" class="rv-info-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--mm-copper);flex-shrink:0;"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                <div><p class="rv-info-lbl">Hourly Rate</p><p class="rv-info-val">Rs {{ selectedSpecialist.hourlyRate }}/hour</p></div>
              </div>
              <div v-if="selectedSpecialist.email" class="rv-info-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--mm-copper);flex-shrink:0;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <div><p class="rv-info-lbl">Email</p><p class="rv-info-val">{{ selectedSpecialist.email }}</p></div>
              </div>
            </div>
            <div class="rv-modal-actions">
              <button @click="openRequestModal(selectedSpecialist!)" class="rv-btn-primary">Request Service</button>
              <button @click="closeProfile" class="rv-btn-ghost">Close</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Request Modal -->
    <Teleport to="body">
      <div v-if="showRequestModal" class="rv-overlay" @click.self="closeRequestModal">
        <div class="rv-modal rv-modal-sm">
          <div class="rv-modal-hdr">
            <div>
              <h3 class="rv-modal-title">Request Service</h3>
              <p class="rv-modal-sub">{{ requestingSpecialist?.name }} · {{ requestingSpecialist?.specialization || 'Instrument Repair' }}</p>
            </div>
            <button @click="closeRequestModal" class="rv-modal-close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="rv-modal-body">
            <div v-if="submitSuccess" class="rv-success">
              <div class="rv-success-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
              <h4 class="rv-success-title">Request Submitted!</h4>
              <p class="rv-success-sub">Redirecting to your dashboard...</p>
            </div>
            <form v-else @submit.prevent="submitRequest" class="rv-form">
              <div class="rv-field">
                <label class="rv-label">Service Type <span class="rv-req">*</span></label>
                <select v-model="requestForm.serviceType" class="rv-input">
                  <option value="">Select a service type...</option>
                  <option v-for="t in SERVICE_TYPES" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="rv-field">
                <label class="rv-label">Description</label>
                <textarea v-model="requestForm.description" rows="3" placeholder="Describe the issue or work needed..." class="rv-input rv-textarea"></textarea>
              </div>
              <div class="rv-field">
                <label class="rv-label">Preferred Date</label>
                <input type="date" v-model="requestForm.preferredDate" :min="new Date().toISOString().split('T')[0]" class="rv-input" />
              </div>
              <div v-if="requestingSpecialist?.hourlyRate" class="rv-rate-box">
                <span>Estimated Rate</span>
                <span class="rv-rate-val">Rs {{ requestingSpecialist.hourlyRate }}/hour</span>
              </div>
              <div v-if="submitError" class="rv-alert-error">{{ submitError }}</div>
              <div class="rv-form-btns">
                <button type="submit" :disabled="submitting" class="rv-btn-primary">{{ submitting ? 'Submitting...' : 'Submit Request' }}</button>
                <button type="button" @click="closeRequestModal" :disabled="submitting" class="rv-btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.rv-page { min-height: 100vh; background: var(--mm-graphite); }
.rv-hero { position: relative; overflow: hidden; background: linear-gradient(135deg, var(--mm-onyx) 0%, #1a1520 100%); padding: 5rem 1.5rem; text-align: center; border-bottom: 1px solid var(--mm-warm-line); }
.rv-hero-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(192,123,80,0.1) 0%, transparent 65%); pointer-events: none; filter: blur(50px); }
.rv-hero-inner { position: relative; z-index: 1; max-width: 50rem; margin: 0 auto; }
.rv-badge { display: inline-flex; align-items: center; padding: 0.375rem 0.875rem; background: rgba(192,123,80,0.1); border: 1px solid rgba(192,123,80,0.3); border-radius: 2rem; font-size: 0.6875rem; font-weight: 700; color: var(--mm-copper); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.25rem; font-family: 'DM Sans', sans-serif; }
.rv-hero-title { font-family: 'DM Serif Display', serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 400; color: var(--mm-ivory); margin: 0 0 1rem; letter-spacing: -0.02em; }
.rv-hero-sub { font-size: 1.0625rem; color: var(--mm-sand); margin: 0 auto; max-width: 40rem; line-height: 1.65; font-family: 'DM Sans', sans-serif; }
.rv-body { max-width: 90rem; margin: 0 auto; padding: 4rem 1.5rem; }
.rv-state { display: flex; flex-direction: column; align-items: center; padding: 5rem 1rem; gap: 1rem; text-align: center; }
.rv-state p { color: var(--mm-sand); font-size: 0.9375rem; font-family: 'DM Sans', sans-serif; }
.rv-error-msg { color: var(--mm-coral); }
.rv-spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-copper); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.rv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
.rv-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 1.25rem; overflow: hidden; transition: all 0.25s ease; }
.rv-card:hover { border-color: rgba(192,123,80,0.3); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
.rv-card-img { position: relative; aspect-ratio: 1; background: var(--mm-mist); overflow: hidden; }
.rv-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.rv-card:hover .rv-img { transform: scale(1.05); }
.rv-initials { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--mm-copper), #A06240); font-size: 3rem; font-weight: 700; color: var(--mm-ink); }
.rv-verified { position: absolute; top: 0.75rem; right: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.625rem; background: rgba(56,168,130,0.15); border: 1px solid rgba(56,168,130,0.35); border-radius: 2rem; font-size: 0.6875rem; font-weight: 700; color: var(--mm-emerald); font-family: 'DM Sans', sans-serif; }
.rv-card-body { padding: 1.25rem; }
.rv-name { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.25rem; }
.rv-spec { font-size: 0.8125rem; color: var(--mm-copper); font-weight: 600; margin: 0 0 0.875rem; font-family: 'DM Sans', sans-serif; }
.rv-meta { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
.rv-meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }
.rv-meta-row svg { color: var(--mm-copper); flex-shrink: 0; }
.rv-meta-rate { color: var(--mm-cream); font-weight: 600; }
.rv-card-btns { display: flex; flex-direction: column; gap: 0.5rem; }
.rv-btn-primary { width: 100%; padding: 0.625rem 1.25rem; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.rv-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(192,123,80,0.3); }
.rv-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.rv-btn-outline { width: 100%; padding: 0.625rem 1.25rem; background: transparent; color: var(--mm-copper); border: 1px solid rgba(192,123,80,0.4); border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.rv-btn-outline:hover { background: rgba(192,123,80,0.1); }
.rv-btn-ghost { padding: 0.625rem 1.25rem; background: var(--mm-mist); color: var(--mm-sand); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.rv-btn-ghost:hover { color: var(--mm-ivory); border-color: var(--mm-stone); }
.rv-overlay { position: fixed; inset: 0; background: rgba(9,8,12,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.25rem; backdrop-filter: blur(4px); }
.rv-modal { background: var(--mm-carbon); border: 1px solid var(--mm-warm-line); border-radius: 1.25rem; max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.7); }
.rv-modal-sm { max-width: 480px; }
.rv-modal-hdr { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--mm-warm-line); position: sticky; top: 0; background: var(--mm-carbon); z-index: 1; }
.rv-modal-title { font-size: 1.125rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.rv-modal-sub { font-size: 0.8125rem; color: var(--mm-stone); margin: 0.2rem 0 0; font-family: 'DM Sans', sans-serif; }
.rv-modal-close { background: none; border: none; color: var(--mm-stone); cursor: pointer; padding: 0.25rem; border-radius: 0.375rem; display: flex; align-items: center; transition: all 0.2s; }
.rv-modal-close:hover { background: var(--mm-mist); color: var(--mm-ivory); }
.rv-modal-loading { display: flex; justify-content: center; padding: 3rem; }
.rv-modal-body { padding: 1.5rem; }
.rv-modal-actions { display: flex; gap: 0.75rem; padding-top: 1.25rem; }
.rv-modal-actions .rv-btn-primary { flex: 1; width: auto; }
.rv-profile-top { display: flex; align-items: flex-start; gap: 1.25rem; margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--mm-warm-line); }
.rv-profile-avatar-wrap { position: relative; flex-shrink: 0; }
.rv-profile-avatar { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, var(--mm-copper), #A06240); display: flex; align-items: center; justify-content: center; }
.rv-profile-img { width: 100%; height: 100%; object-fit: cover; }
.rv-profile-initials { font-size: 1.75rem; font-weight: 700; color: var(--mm-ink); }
.rv-verified-dot { position: absolute; bottom: 0; right: 0; width: 24px; height: 24px; background: var(--mm-emerald); border-radius: 50%; border: 2px solid var(--mm-carbon); display: flex; align-items: center; justify-content: center; color: var(--mm-ink); }
.rv-profile-name { font-size: 1.25rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.25rem; }
.rv-profile-spec { font-size: 0.9375rem; color: var(--mm-copper); font-weight: 600; margin: 0 0 0.625rem; font-family: 'DM Sans', sans-serif; }
.rv-profile-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.rv-chip { display: inline-flex; align-items: center; padding: 0.2rem 0.625rem; border-radius: 2rem; font-size: 0.6875rem; font-weight: 700; border: 1px solid; font-family: 'DM Sans', sans-serif; }
.rv-chip-emerald { background: rgba(56,168,130,0.12); border-color: rgba(56,168,130,0.25); color: var(--mm-emerald); }
.rv-chip-copper  { background: rgba(192,123,80,0.12); border-color: rgba(192,123,80,0.25); color: var(--mm-copper); }
.rv-bio { font-size: 0.875rem; color: var(--mm-sand); line-height: 1.6; margin: 0 0 1rem; font-family: 'DM Sans', sans-serif; }
.rv-profile-section { margin-bottom: 0.875rem; }
.rv-section-lbl { font-size: 0.625rem; font-weight: 700; color: var(--mm-copper); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 0.25rem; font-family: 'DM Sans', sans-serif; }
.rv-section-val { font-size: 0.875rem; color: var(--mm-cream); margin: 0; font-family: 'DM Sans', sans-serif; }
.rv-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin: 1rem 0; }
.rv-info-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: rgba(192,123,80,0.06); border: 1px solid rgba(192,123,80,0.12); border-radius: 0.75rem; }
.rv-info-lbl { font-size: 0.6875rem; color: var(--mm-stone); margin: 0; font-family: 'DM Sans', sans-serif; }
.rv-info-val { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); margin: 0; font-family: 'DM Sans', sans-serif; }
.rv-form { display: flex; flex-direction: column; gap: 1rem; }
.rv-field { display: flex; flex-direction: column; gap: 0.375rem; }
.rv-label { font-size: 0.8125rem; font-weight: 600; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }
.rv-req { color: var(--mm-coral); }
.rv-input { padding: 0.625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; font-size: 0.875rem; color: var(--mm-ivory); outline: none; width: 100%; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.rv-input::placeholder { color: var(--mm-stone); }
.rv-input:focus { border-color: var(--mm-copper); box-shadow: 0 0 0 3px rgba(192,123,80,0.1); }
.rv-textarea { resize: vertical; min-height: 80px; }
.rv-rate-box { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: rgba(192,123,80,0.08); border: 1px solid rgba(192,123,80,0.2); border-radius: 0.625rem; font-size: 0.875rem; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }
.rv-rate-val { font-weight: 700; color: var(--mm-copper); }
.rv-alert-error { padding: 0.625rem 0.875rem; background: rgba(224,112,96,0.1); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.5rem; font-size: 0.875rem; color: var(--mm-coral); font-family: 'DM Sans', sans-serif; }
.rv-form-btns { display: flex; gap: 0.75rem; }
.rv-form-btns .rv-btn-primary { flex: 1; width: auto; }
.rv-success { text-align: center; padding: 1.5rem 0; }
.rv-success-icon { width: 60px; height: 60px; background: rgba(56,168,130,0.12); border: 1px solid rgba(56,168,130,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--mm-emerald); margin: 0 auto 1rem; }
.rv-success-title { font-size: 1.125rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.375rem; }
.rv-success-sub { font-size: 0.875rem; color: var(--mm-sand); margin: 0; font-family: 'DM Sans', sans-serif; }
@media (max-width: 640px) { .rv-info-grid { grid-template-columns: 1fr; } .rv-modal-actions, .rv-form-btns { flex-direction: column; } }
</style>
