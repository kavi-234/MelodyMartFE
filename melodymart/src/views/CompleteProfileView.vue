<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const selectedRole = ref('')
const documents = ref<File[]>([])
const specialization = ref('')
const experience = ref('')
const hourlyRate = ref('')
const bio = ref('')
const serviceTypes = ref('')
const certifications = ref('')
const uploading = ref(false)
const error = ref('')

const roles = [
  { value: 'customer',          label: 'Customer',           description: 'Browse and purchase instruments' },
  { value: 'tutor',             label: 'Music Tutor',        description: 'Teach music lessons' },
  { value: 'repair_specialist', label: 'Repair Specialist',  description: 'Repair and maintain instruments' },
]

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) documents.value = Array.from(target.files)
}

const handleSubmit = async () => {
  if (!selectedRole.value) { error.value = 'Please select a role'; return }
  if ((selectedRole.value === 'tutor' || selectedRole.value === 'repair_specialist') && documents.value.length === 0) {
    error.value = 'Please upload at least one document (license/certificate)'; return
  }

  uploading.value = true; error.value = ''
  const formData = new FormData()
  formData.append('role', selectedRole.value)

  if (selectedRole.value === 'tutor') {
    if (!specialization.value || !experience.value || !hourlyRate.value || !bio.value) {
      error.value = 'Please fill in all tutor fields'; uploading.value = false; return
    }
    formData.append('specialization', specialization.value)
    formData.append('experience', experience.value)
    formData.append('hourlyRate', hourlyRate.value)
    formData.append('bio', bio.value)
  } else if (selectedRole.value === 'repair_specialist') {
    if (!serviceTypes.value) { error.value = 'Please fill in service types'; uploading.value = false; return }
    formData.append('serviceTypes', serviceTypes.value)
    if (certifications.value) formData.append('certifications', certifications.value)
  }

  documents.value.forEach(file => formData.append('documents', file))
  const success = await authStore.completeProfile(formData)

  if (success) {
    const user = authStore.user
    if (user?.role === 'customer') {
      router.push('/dashboard/customer')
    } else if (user?.role === 'tutor' || user?.role === 'repair_specialist') {
      if (user.verificationStatus === 'PENDING_APPROVAL') {
        alert('Profile completed successfully! Your account is pending admin approval. You will be notified once approved.')
        router.push('/')
      } else if (user.verificationStatus === 'APPROVED') {
        router.push(`/dashboard/${user.role}`)
      }
    }
  } else {
    error.value = authStore.error || 'Failed to complete profile'
  }

  uploading.value = false
}
</script>

<template>
  <div class="cp-page">
    <div class="cp-inner">
      <div class="cp-top">
        <h1 class="cp-title">Complete Your Profile</h1>
        <p class="cp-sub">Choose your role to get started with Melody Mart</p>
      </div>

      <div class="cp-card">
        <!-- Role Selection -->
        <div class="cp-section">
          <label class="cp-section-label">Select Your Role</label>
          <div class="cp-role-grid">
            <button
              v-for="role in roles"
              :key="role.value"
              type="button"
              @click="selectedRole = role.value"
              :class="['cp-role-btn', selectedRole === role.value ? 'cp-role-active' : '']"
            >
              <div class="cp-role-icon" v-if="role.value === 'customer'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              </div>
              <div class="cp-role-icon" v-else-if="role.value === 'tutor'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
              <div class="cp-role-icon" v-else>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <div class="cp-role-label">{{ role.label }}</div>
              <div class="cp-role-desc">{{ role.description }}</div>
            </button>
          </div>
        </div>

        <!-- Tutor Fields -->
        <div v-if="selectedRole === 'tutor'" class="cp-section">
          <div class="cp-field">
            <label class="cp-label">Specialization</label>
            <input v-model="specialization" type="text" placeholder="e.g., Piano, Guitar, Violin" class="cp-input" />
          </div>
          <div class="cp-field">
            <label class="cp-label">Years of Experience</label>
            <input v-model="experience" type="number" placeholder="5" class="cp-input" />
          </div>
          <div class="cp-field">
            <label class="cp-label">Hourly Rate (Rs)</label>
            <input v-model="hourlyRate" type="number" placeholder="1500" class="cp-input" />
          </div>
          <div class="cp-field">
            <label class="cp-label">Bio</label>
            <textarea v-model="bio" rows="4" placeholder="Tell us about your teaching experience..." class="cp-input cp-textarea"></textarea>
          </div>
        </div>

        <!-- Repair Specialist Fields -->
        <div v-if="selectedRole === 'repair_specialist'" class="cp-section">
          <div class="cp-field">
            <label class="cp-label">Service Types</label>
            <input v-model="serviceTypes" type="text" placeholder="e.g., String Instruments, Wind Instruments" class="cp-input" />
          </div>
          <div class="cp-field">
            <label class="cp-label">Certifications</label>
            <input v-model="certifications" type="text" placeholder="e.g., Certified Luthier, Guitar Repair Certification" class="cp-input" />
          </div>
        </div>

        <!-- Document Upload -->
        <div v-if="selectedRole === 'tutor' || selectedRole === 'repair_specialist'" class="cp-section">
          <label class="cp-label">
            Upload Documents (License / Certificates)
            <span class="cp-req">*</span>
          </label>
          <div class="cp-upload-zone">
            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" @change="handleFileChange" class="cp-file-input" id="cp-file-upload" />
            <label for="cp-file-upload" class="cp-upload-label">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mm-stone); margin-bottom: 0.5rem;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div class="cp-upload-text">Click to upload or drag and drop</div>
              <div class="cp-upload-hint">PDF, DOC, DOCX, JPG, PNG (max 5MB each)</div>
            </label>
            <div v-if="documents.length > 0" class="cp-file-list">
              <div v-for="(file, index) in documents" :key="index" class="cp-file-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {{ file.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="cp-error">{{ error }}</div>

        <!-- Submit -->
        <button
          @click="handleSubmit"
          :disabled="uploading || !selectedRole"
          class="cp-submit-btn"
        >
          {{ uploading ? 'Setting up your account...' : 'Complete Profile' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cp-page { min-height: 100vh; background: var(--mm-graphite); padding: 3rem 1rem; }
.cp-inner { max-width: 48rem; margin: 0 auto; }
.cp-top { text-align: center; margin-bottom: 2rem; }
.cp-title { font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.5rem; letter-spacing: -0.02em; }
.cp-sub { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; font-family: 'DM Sans', sans-serif; }

.cp-card { background: var(--mm-carbon); border: 1px solid var(--mm-warm-line); border-radius: 1.25rem; padding: 2rem; display: flex; flex-direction: column; gap: 1.75rem; }
.cp-section { display: flex; flex-direction: column; gap: 1rem; }
.cp-section-label { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); font-family: 'DM Sans', sans-serif; margin-bottom: 0.25rem; }

.cp-role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.875rem; }
.cp-role-btn {
  display: flex; flex-direction: column; align-items: flex-start; gap: 0.375rem;
  padding: 1.125rem; border-radius: 0.875rem; border: 2px solid var(--mm-warm-line);
  background: var(--mm-onyx); cursor: pointer; text-align: left; transition: all 0.2s;
}
.cp-role-btn:hover { border-color: var(--mm-stone); }
.cp-role-active { border-color: var(--mm-teal) !important; background: rgba(42,157,159,0.07) !important; }
.cp-role-icon { width: 40px; height: 40px; border-radius: 0.625rem; background: rgba(42,157,159,0.1); color: var(--mm-teal); display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem; }
.cp-role-active .cp-role-icon { background: rgba(42,157,159,0.15); }
.cp-role-label { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); font-family: 'DM Sans', sans-serif; }
.cp-role-desc { font-size: 0.75rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }

.cp-field { display: flex; flex-direction: column; gap: 0.375rem; }
.cp-label { font-size: 0.8125rem; font-weight: 600; color: var(--mm-sand); font-family: 'DM Sans', sans-serif; }
.cp-req { color: var(--mm-coral); margin-left: 0.125rem; }
.cp-input { padding: 0.625rem 0.875rem; background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; font-size: 0.875rem; color: var(--mm-ivory); outline: none; width: 100%; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.cp-input::placeholder { color: var(--mm-stone); }
.cp-input:focus { border-color: var(--mm-teal); box-shadow: 0 0 0 3px rgba(42,157,159,0.1); }
.cp-textarea { resize: vertical; min-height: 100px; }

.cp-upload-zone { border: 2px dashed var(--mm-warm-line); border-radius: 0.875rem; background: var(--mm-onyx); padding: 1.5rem; transition: border-color 0.2s; }
.cp-upload-zone:hover { border-color: var(--mm-teal); }
.cp-file-input { display: none; }
.cp-upload-label { display: flex; flex-direction: column; align-items: center; cursor: pointer; text-align: center; }
.cp-upload-text { font-size: 0.875rem; font-weight: 600; color: var(--mm-ivory); margin-bottom: 0.25rem; font-family: 'DM Sans', sans-serif; }
.cp-upload-hint { font-size: 0.75rem; color: var(--mm-stone); font-family: 'DM Sans', sans-serif; }
.cp-file-list { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.375rem; }
.cp-file-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--mm-emerald); font-family: 'DM Sans', sans-serif; }

.cp-error { padding: 0.75rem 1rem; background: rgba(224,112,96,0.1); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.625rem; font-size: 0.875rem; color: var(--mm-coral); font-family: 'DM Sans', sans-serif; }

.cp-submit-btn {
  padding: 0.875rem; width: 100%;
  background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink);
  border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 16px rgba(42,157,159,0.2);
}
.cp-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(42,157,159,0.3); }
.cp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

@media (max-width: 640px) { .cp-role-grid { grid-template-columns: 1fr; } .cp-card { padding: 1.25rem; } }
</style>
