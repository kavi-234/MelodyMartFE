<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

interface Specialist {
  _id: string; name: string; email: string; phone?: string
  specialization?: string; experience?: string; hourlyRate?: number
  avatar?: string; certifications?: string; serviceTypes?: string; bio?: string
  verificationStatus?: string
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
const showModal = ref(false)
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
    const response = await fetch('http://localhost:5000/api/specialists')
    const data = await response.json()
    if (data.success) specialists.value = data.specialists
    else error.value = 'Failed to load repair specialists'
  } catch { error.value = 'Failed to load repair specialists' }
  finally { loading.value = false }
}

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return avatarPlaceholder
  if (avatar.startsWith('data:image') || avatar.startsWith('http')) return avatar
  return avatarPlaceholder
}
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
const handleSpecialistError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target || target.dataset.fallbackApplied === 'true') return
  target.src = avatarPlaceholder; target.dataset.fallbackApplied = 'true'
}

const handleViewProfile = async (specialistId: string) => {
  loadingProfile.value = true; showModal.value = true
  try {
    const response = await fetch(`http://localhost:5000/api/specialists/${specialistId}`)
    if (response.ok) { const data = await response.json(); selectedSpecialist.value = data.specialist }
  } catch { /* silently fail */ }
  finally { loadingProfile.value = false }
}
const closeModal = () => { showModal.value = false; selectedSpecialist.value = null }

const openRequestModal = (specialist: Specialist) => {
  if (!authStore.isAuthenticated) { router.push('/auth'); return }
  requestingSpecialist.value = specialist
  requestForm.serviceType = ''; requestForm.description = ''; requestForm.preferredDate = ''
  submitError.value = ''; submitSuccess.value = false
  showModal.value = false; showRequestModal.value = true
}
const closeRequestModal = () => { showRequestModal.value = false; requestingSpecialist.value = null; submitError.value = ''; submitSuccess.value = false }

const submitRequest = async () => {
  if (!requestForm.serviceType) { submitError.value = 'Please select a service type.'; return }
  submitting.value = true; submitError.value = ''
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/service-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ specialistId: requestingSpecialist.value!._id, serviceType: requestForm.serviceType, description: requestForm.description, preferredDate: requestForm.preferredDate || undefined }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to submit request')
    submitSuccess.value = true
    setTimeout(() => { closeRequestModal(); router.push('/dashboard/customer/services') }, 1200)
  } catch (err: any) {
    submitError.value = err.message || 'Failed to submit request. Please try again.'
  } finally { submitting.value = false }
}

onMounted(() => fetchSpecialists())
</script>

<template>
  <section id="repairs" class="rs-section">
    <div class="rs-glows" aria-hidden="true">
      <div class="rs-glow rs-glow-left" />
      <div class="rs-glow rs-glow-right" />
    </div>

    <div class="rs-container">
      <!-- Header -->
      <div class="rs-header">
        <div class="badge badge-gradient inline-flex mb-6">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.048A3.066 3.066 0 006 7c1.105 0 2.1.85 2.134 1.948.03.644-.635 1.2-1.302 1.225-.712.013-1.473.049-2.093.088a.5.5 0 00-.528.47m12.854.998a2.9 2.9 0 00-2.94-2.743c-.08 0-.16.004-.237.013a2.9 2.9 0 00-2.582 2.914 2.9 2.9 0 002.94 2.743c.081 0 .16-.004.236-.013a2.9 2.9 0 002.583-2.914zM6.036 6.692a.75.75 0 110-1.5.75.75 0 010 1.5zM12.72 14.468a.75.75 0 110-1.5.75.75 0 010 1.5z" clip-rule="evenodd"/>
          </svg>
          <span>Expert Technicians</span>
        </div>
        <h2 class="rs-title">Repair Specialists</h2>
        <p class="rs-sub">Expert technicians ensuring your instruments sound their absolute best. From tuning to restoration.</p>
      </div>

      <div v-if="loading" class="rs-state">
        <div class="rs-spinner" />
        <p>Loading repair specialists...</p>
      </div>
      <div v-else-if="error" class="rs-state"><p class="rs-error">{{ error }}</p></div>
      <div v-else-if="specialists.length === 0" class="rs-state"><p>No repair specialists available at the moment.</p></div>

      <div v-else class="rs-grid">
        <div v-for="s in specialists" :key="s._id" class="rs-card card-modern group">
          <div class="rs-card-img">
            <img v-if="s.avatar" :src="getAvatarUrl(s.avatar)" :alt="s.name" class="rs-img" @error="handleSpecialistError" />
            <div v-else class="rs-initials">{{ getInitials(s.name) }}</div>
            <span class="rs-verified">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Verified
            </span>
          </div>
          <div class="rs-card-body">
            <h3 class="rs-name">{{ s.name }}</h3>
            <p class="rs-spec">{{ s.specialization || 'Instrument Repair' }}</p>
            <div class="rs-meta">
              <div v-if="s.experience" class="rs-meta-row">
                <svg xmlns="http://www.w3.org/2000/svg" class="rs-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{{ s.experience }} experience</span>
              </div>
              <div v-if="s.hourlyRate" class="rs-meta-row rs-rate">
                <svg xmlns="http://www.w3.org/2000/svg" class="rs-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Rs {{ s.hourlyRate }}/hr</span>
              </div>
            </div>
            <div class="rs-card-btns">
              <button @click="handleViewProfile(s._id)" class="rs-btn-primary btn-primary">View Profile</button>
              <button @click="openRequestModal(s)" class="rs-btn-outline btn-outline">Request Service</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && !error && specialists.length > 0" class="rs-footer">
        <RouterLink to="/repairs" class="btn-primary rs-view-all">
          <span>View All Specialists</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </RouterLink>
      </div>
    </div>

    <!-- Profile Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="rs-overlay" @click.self="closeModal">
        <div class="rs-modal">
          <div class="rs-modal-hdr">
            <h3 class="rs-modal-title">Repair Specialist Profile</h3>
            <button @click="closeModal" class="rs-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div v-if="loadingProfile" class="rs-modal-loading">
            <div class="rs-spinner" />
            <p>Loading profile...</p>
          </div>
          <div v-else-if="selectedSpecialist" class="rs-modal-body">
            <div class="rs-profile-top">
              <div class="rs-profile-avatar-wrap">
                <div class="rs-profile-avatar">
                  <img v-if="selectedSpecialist.avatar" :src="getAvatarUrl(selectedSpecialist.avatar)" :alt="selectedSpecialist.name" class="rs-profile-img" @error="handleSpecialistError" />
                  <span v-else class="rs-profile-initials">{{ getInitials(selectedSpecialist.name) }}</span>
                </div>
                <span class="rs-verified-dot">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              </div>
              <div class="rs-profile-info">
                <h4 class="rs-profile-name">{{ selectedSpecialist.name }}</h4>
                <p class="rs-profile-spec">{{ selectedSpecialist.specialization || 'Instrument Repair' }}</p>
                <div class="rs-profile-chips">
                  <span class="rs-chip rs-chip-emerald">Verified Specialist</span>
                  <span v-if="selectedSpecialist.experience" class="rs-chip rs-chip-copper">{{ selectedSpecialist.experience }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedSpecialist.bio" class="rs-profile-section">
              <h5 class="rs-section-lbl">About</h5>
              <p class="rs-section-val">{{ selectedSpecialist.bio }}</p>
            </div>
            <div v-if="selectedSpecialist.certifications" class="rs-profile-section">
              <h5 class="rs-section-lbl">Certifications</h5>
              <p class="rs-section-val">{{ selectedSpecialist.certifications }}</p>
            </div>
            <div v-if="selectedSpecialist.serviceTypes" class="rs-profile-section">
              <h5 class="rs-section-lbl">Service Types</h5>
              <p class="rs-section-val">{{ selectedSpecialist.serviceTypes }}</p>
            </div>

            <div class="rs-info-grid">
              <div v-if="selectedSpecialist.hourlyRate" class="rs-info-box">
                <div class="rs-info-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div><p class="rs-info-lbl">Hourly Rate</p><p class="rs-info-val">Rs {{ selectedSpecialist.hourlyRate }}/hour</p></div>
              </div>
              <div v-if="selectedSpecialist.email" class="rs-info-box">
                <div class="rs-info-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div class="rs-info-overflow"><p class="rs-info-lbl">Email</p><p class="rs-info-val rs-info-truncate">{{ selectedSpecialist.email }}</p></div>
              </div>
            </div>

            <div class="rs-modal-btns">
              <button @click="openRequestModal(selectedSpecialist!)" class="rs-btn-copper">Request Service</button>
              <button @click="closeModal" class="rs-btn-ghost">Close</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Request Service Modal -->
    <Teleport to="body">
      <div v-if="showRequestModal" class="rs-overlay" @click.self="closeRequestModal">
        <div class="rs-modal rs-modal-sm">
          <div class="rs-modal-hdr">
            <div>
              <h3 class="rs-modal-title">Request Service</h3>
              <p class="rs-modal-sub">{{ requestingSpecialist?.name }} · {{ requestingSpecialist?.specialization || 'Instrument Repair' }}</p>
            </div>
            <button @click="closeRequestModal" class="rs-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="rs-modal-body">
            <div v-if="submitSuccess" class="rs-success">
              <div class="rs-success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4 class="rs-success-title">Request Submitted!</h4>
              <p class="rs-success-sub">Redirecting to your Requested Services...</p>
            </div>
            <form v-else @submit.prevent="submitRequest" class="rs-form">
              <div class="rs-field">
                <label class="rs-label">Service Type <span class="rs-req">*</span></label>
                <select v-model="requestForm.serviceType" class="rs-input">
                  <option value="" style="color:#111827;background:#fff;">Select a service type...</option>
                  <option v-for="type in SERVICE_TYPES" :key="type" :value="type" style="color:#111827;background:#fff;">{{ type }}</option>
                </select>
              </div>
              <div class="rs-field">
                <label class="rs-label">Description</label>
                <textarea v-model="requestForm.description" rows="3" placeholder="Describe the issue or work needed..." class="rs-input rs-textarea"></textarea>
              </div>
              <div class="rs-field">
                <label class="rs-label">Preferred Date</label>
                <input type="date" v-model="requestForm.preferredDate" :min="new Date().toISOString().split('T')[0]" class="rs-input" />
              </div>
              <div v-if="requestingSpecialist?.hourlyRate" class="rs-rate-box">
                <span>Estimated Rate</span>
                <span class="rs-rate-val">Rs {{ requestingSpecialist.hourlyRate }}/hour</span>
              </div>
              <div v-if="submitError" class="rs-alert-error">{{ submitError }}</div>
              <div class="rs-form-btns">
                <button type="submit" :disabled="submitting" class="rs-btn-copper">{{ submitting ? 'Submitting...' : 'Submit Request' }}</button>
                <button type="button" @click="closeRequestModal" :disabled="submitting" class="rs-btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.rs-section { position: relative; padding: 6rem 0 8rem; background: var(--mm-graphite); overflow: hidden; }
.rs-glows { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.rs-glow { position: absolute; width: 24rem; height: 24rem; border-radius: 50%; filter: blur(64px); }
.rs-glow-left  { top: 0;    left: 0;          background: rgba(192,123,80,0.07); opacity: 0.7; }
.rs-glow-right { bottom: 0; right: 25%;       background: rgba(212,168,83,0.06); opacity: 0.5; }
.rs-container { position: relative; z-index: 10; max-width: 90rem; margin: 0 auto; padding: 0 1.5rem; }
.rs-header { text-align: center; margin-bottom: 5rem; }
.rs-title { font-family: 'DM Serif Display', serif; font-size: clamp(2rem,5vw,3.25rem); font-weight: 400; color: var(--mm-ivory); margin: 0 0 1.25rem; letter-spacing: -0.02em; }
.rs-sub { font-size: 1.0625rem; color: var(--mm-sand); max-width: 40rem; margin: 0 auto; line-height: 1.65; font-family: 'DM Sans', sans-serif; }
.rs-state { text-align: center; padding: 4rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.rs-state p { color: var(--mm-sand); font-size: 0.9375rem; font-family: 'DM Sans', sans-serif; }
.rs-error { color: var(--mm-coral) !important; }
.rs-spinner { width: 44px; height: 44px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-copper); border-radius: 50%; animation: rs-spin 1s linear infinite; }
@keyframes rs-spin { to { transform: rotate(360deg); } }
.rs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
.rs-card { overflow: hidden; }
.rs-card-img { position: relative; aspect-ratio: 1; overflow: hidden; background: var(--mm-mist); border-radius: 0.875rem 0.875rem 0 0; }
.rs-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.rs-card:hover .rs-img { transform: scale(1.08); }
.rs-initials { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--mm-copper), #A06240); font-size: 3rem; font-weight: 700; color: var(--mm-ink); }
.rs-verified { position: absolute; top: 0.75rem; right: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.625rem; background: rgba(56,168,130,0.18); border: 1px solid rgba(56,168,130,0.4); border-radius: 2rem; font-size: 0.6875rem; font-weight: 700; color: var(--mm-emerald); font-family: 'DM Sans', sans-serif; }
.rs-card-body { padding: 1.125rem; }
.rs-name { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 0.2s; }
.rs-card:hover .rs-name { color: var(--mm-copper); }
.rs-spec { font-size: 0.75rem; font-weight: 700; color: var(--mm-copper); margin: 0 0 0.75rem; font-family: 'DM Sans', sans-serif; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rs-meta { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.rs-meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; overflow: hidden; }
.rs-meta-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rs-meta-icon { width: 0.875rem; height: 0.875rem; flex-shrink: 0; color: var(--mm-copper); }
.rs-rate { color: var(--mm-cream); font-weight: 600; }
.rs-card-btns { border-top: 1px solid var(--mm-warm-line); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.rs-btn-primary, .rs-btn-outline { width: 100%; padding: 0.5625rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; text-align: center; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }

/* Modals */
.rs-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1.25rem; background: rgba(9,8,12,0.8); backdrop-filter: blur(4px); }
.rs-modal { background: var(--mm-carbon); border: 1px solid var(--mm-warm-line); border-radius: 1.25rem; max-width: 40rem; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.7); }
.rs-modal-sm { max-width: 32rem; }
.rs-modal-hdr { position: sticky; top: 0; background: var(--mm-carbon); border-bottom: 1px solid var(--mm-warm-line); padding: 1.125rem 1.5rem; display: flex; align-items: center; justify-content: space-between; z-index: 1; }
.rs-modal-title { font-size: 1.125rem; font-weight: 700; color: var(--mm-ivory); margin: 0; font-family: 'DM Serif Display', serif; }
.rs-modal-sub { font-size: 0.8125rem; color: var(--mm-stone); margin: 0.2rem 0 0; font-family: 'DM Sans', sans-serif; }
.rs-modal-close { background: none; border: none; color: var(--mm-stone); cursor: pointer; padding: 0.25rem; border-radius: 0.375rem; display: flex; align-items: center; transition: all 0.2s; }
.rs-modal-close:hover { background: var(--mm-mist); color: var(--mm-ivory); }
.rs-modal-loading { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; }
.rs-modal-loading p { color: var(--mm-sand); font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
.rs-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

.rs-profile-top { display: flex; align-items: flex-start; gap: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--mm-warm-line); }
.rs-profile-avatar-wrap { position: relative; flex-shrink: 0; }
.rs-profile-avatar { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, var(--mm-copper), #A06240); display: flex; align-items: center; justify-content: center; }
.rs-profile-img { width: 100%; height: 100%; object-fit: cover; }
.rs-profile-initials { font-size: 1.75rem; font-weight: 700; color: var(--mm-ink); }
.rs-verified-dot { position: absolute; bottom: 0; right: 0; width: 24px; height: 24px; background: var(--mm-emerald); border-radius: 50%; border: 2px solid var(--mm-carbon); display: flex; align-items: center; justify-content: center; color: var(--mm-ink); }
.rs-profile-name { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.375rem; }
.rs-profile-spec { font-size: 0.9375rem; font-weight: 700; color: var(--mm-copper); margin: 0 0 0.625rem; font-family: 'DM Sans', sans-serif; }
.rs-profile-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.rs-chip { display: inline-flex; padding: 0.2rem 0.625rem; border-radius: 2rem; font-size: 0.6875rem; font-weight: 700; border: 1px solid; font-family: 'DM Sans', sans-serif; }
.rs-chip-emerald { background: rgba(56,168,130,0.12); border-color: rgba(56,168,130,0.25); color: var(--mm-emerald); }
.rs-chip-copper  { background: rgba(192,123,80,0.12); border-color: rgba(192,123,80,0.25); color: var(--mm-copper); }

.rs-profile-section { }
.rs-section-lbl { font-size: 0.6875rem; font-weight: 700; color: var(--mm-copper); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 0.375rem; font-family: 'DM Sans', sans-serif; }
.rs-section-val { font-size: 0.875rem; color: var(--mm-sand); line-height: 1.6; margin: 0; font-family: 'DM Sans', sans-serif; }

.rs-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.rs-info-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: rgba(192,123,80,0.06); border: 1px solid rgba(192,123,80,0.12); border-radius: 0.75rem; }
.rs-info-icon { width: 36px; height: 36px; border-radius: 0.5rem; background: rgba(192,123,80,0.12); display: flex; align-items: center; justify-content: center; color: var(--mm-copper); flex-shrink: 0; }
.rs-info-lbl { font-size: 0.6875rem; color: var(--mm-stone); margin: 0; font-family: 'DM Sans', sans-serif; }
.rs-info-val { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); margin: 0; font-family: 'DM Sans', sans-serif; }
.rs-info-overflow { overflow: hidden; }
.rs-info-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.rs-modal-btns { display: flex; gap: 0.75rem; }
.rs-btn-copper { flex: 1; padding: 0.75rem 1.25rem; background: linear-gradient(135deg, var(--mm-copper), #A06240); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.rs-btn-copper:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(192,123,80,0.3); }
.rs-btn-copper:disabled { opacity: 0.6; cursor: not-allowed; }
.rs-btn-ghost { padding: 0.75rem 1.25rem; background: var(--mm-mist); color: var(--mm-sand); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.rs-btn-ghost:hover:not(:disabled) { color: var(--mm-ivory); border-color: var(--mm-stone); }
.rs-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.rs-form { display: flex; flex-direction: column; gap: 1rem; }
.rs-field { display: flex; flex-direction: column; gap: 0.375rem; }
.rs-label { font-size: 0.8125rem; font-weight: 600; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }
.rs-req { color: var(--mm-coral); }
.rs-input { padding: 0.625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; font-size: 0.875rem; color: var(--mm-ivory); outline: none; width: 100%; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.rs-input::placeholder { color: var(--mm-stone); }
.rs-input:focus { border-color: var(--mm-copper); box-shadow: 0 0 0 3px rgba(192,123,80,0.1); }
.rs-textarea { resize: vertical; min-height: 80px; }
.rs-rate-box { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: rgba(192,123,80,0.08); border: 1px solid rgba(192,123,80,0.2); border-radius: 0.625rem; font-size: 0.875rem; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }
.rs-rate-val { font-weight: 700; color: var(--mm-copper); }
.rs-alert-error { padding: 0.625rem 0.875rem; background: rgba(224,112,96,0.1); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.5rem; font-size: 0.875rem; color: var(--mm-coral); font-family: 'DM Sans', sans-serif; }
.rs-form-btns { display: flex; gap: 0.75rem; }
.rs-form-btns .rs-btn-copper { padding: 0.625rem 1.25rem; }
.rs-form-btns .rs-btn-ghost { padding: 0.625rem 1.25rem; }

.rs-success { text-align: center; padding: 1.5rem 0; }
.rs-success-icon { width: 64px; height: 64px; background: rgba(56,168,130,0.12); border: 1px solid rgba(56,168,130,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--mm-emerald); margin: 0 auto 1rem; }
.rs-success-title { font-size: 1.125rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.375rem; }
.rs-success-sub { font-size: 0.875rem; color: var(--mm-sand); margin: 0; font-family: 'DM Sans', sans-serif; }

.rs-footer { margin-top: 5rem; text-align: center; }
.rs-view-all { display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2.5rem; border-radius: 0.875rem; font-size: 1rem; }

@media (max-width: 1024px) { .rs-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .rs-grid { grid-template-columns: 1fr; } .rs-modal-btns, .rs-form-btns { flex-direction: column; } .rs-info-grid { grid-template-columns: 1fr; } }
</style>
