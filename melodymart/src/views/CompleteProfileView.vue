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
  { value: 'customer', label: 'Customer', icon: '🛒', description: 'Browse and purchase instruments' },
  { value: 'tutor', label: 'Music Tutor', icon: '🎵', description: 'Teach music lessons' },
  { value: 'repair_specialist', label: 'Repair Specialist', icon: '🔧', description: 'Repair and maintain instruments' }
]

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    documents.value = Array.from(target.files)
  }
}

const handleSubmit = async () => {
  if (!selectedRole.value) {
    error.value = 'Please select a role'
    return
  }

  if ((selectedRole.value === 'tutor' || selectedRole.value === 'repair_specialist') && documents.value.length === 0) {
    error.value = 'Please upload at least one document (license/certificate)'
    return
  }

  uploading.value = true
  error.value = ''

  const formData = new FormData()
  formData.append('role', selectedRole.value)

  if (selectedRole.value === 'tutor') {
    if (!specialization.value || !experience.value || !hourlyRate.value || !bio.value) {
      error.value = 'Please fill in all tutor fields'
      uploading.value = false
      return
    }
    formData.append('specialization', specialization.value)
    formData.append('experience', experience.value)
    formData.append('hourlyRate', hourlyRate.value)
    formData.append('bio', bio.value)
  } else if (selectedRole.value === 'repair_specialist') {
    if (!serviceTypes.value) {
      error.value = 'Please fill in service types'
      uploading.value = false
      return
    }
    formData.append('serviceTypes', serviceTypes.value)
    if (certifications.value) {
      formData.append('certifications', certifications.value)
    }
  }

  documents.value.forEach(file => {
    formData.append('documents', file)
  })

  const success = await authStore.completeProfile(formData)

  if (success) {
    // Check user status after profile completion
    const user = authStore.user
    
    if (user?.role === 'customer') {
      // Customer can directly access dashboard
      router.push('/dashboard/customer')
    } else if (user?.role === 'tutor' || user?.role === 'repair_specialist') {
      // Show pending approval message
      if (user.verificationStatus === 'PENDING_APPROVAL') {
        alert('Profile completed successfully! Your account is pending admin approval. You will be notified once approved.')
        router.push('/')
      } else if (user.verificationStatus === 'APPROVED') {
        // In case they were already approved
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
  <div class="min-h-screen bg-slate-950 py-12 px-4">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-3xl font-bold text-white">Complete Your Profile</h1>
        <p class="text-slate-400">Choose your role to get started with Melody Mart</p>
      </div>

      <div class="rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <!-- Role Selection -->
        <div class="mb-8">
          <label class="mb-4 block text-lg font-semibold text-white">Select Your Role</label>
          <div class="grid gap-4 md:grid-cols-3">
            <button
              v-for="role in roles"
              :key="role.value"
              type="button"
              @click="selectedRole = role.value"
              :class="[
                'rounded-xl border-2 p-6 text-left transition-all',
                selectedRole === role.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              ]"
            >
              <div class="mb-2 text-3xl">{{ role.icon }}</div>
              <div class="mb-1 font-semibold text-white">{{ role.label }}</div>
              <div class="text-sm text-slate-400">{{ role.description }}</div>
            </button>
          </div>
        </div>

        <!-- Tutor Fields -->
        <div v-if="selectedRole === 'tutor'" class="mb-6 space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Specialization</label>
            <input
              v-model="specialization"
              type="text"
              placeholder="e.g., Piano, Guitar, Violin"
              class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Years of Experience</label>
            <input
              v-model="experience"
              type="number"
              placeholder="5"
              class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Hourly Rate ($)</label>
            <input
              v-model="hourlyRate"
              type="number"
              placeholder="50"
              class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Bio</label>
            <textarea
              v-model="bio"
              rows="4"
              placeholder="Tell us about your teaching experience..."
              class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <!-- Repair Specialist Fields -->
        <div v-if="selectedRole === 'repair_specialist'" class="mb-6 space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Service Types</label>
            <input
              v-model="serviceTypes"
              type="text"
              placeholder="e.g., String Instruments, Wind Instruments"
              class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Certifications</label>
            <input
              v-model="certifications"
              type="text"
              placeholder="e.g., Certified Luthier, Guitar Repair Certification"
              class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Document Upload for Tutor/Repair Specialist -->
        <div v-if="selectedRole === 'tutor' || selectedRole === 'repair_specialist'" class="mb-6">
          <label class="mb-2 block text-sm font-medium text-slate-300">
            Upload Documents (License/Certificates)
            <span class="text-red-400">*</span>
          </label>
          <div class="rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 p-6 text-center">
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              @change="handleFileChange"
              class="hidden"
              id="file-upload"
            />
            <label for="file-upload" class="cursor-pointer">
              <div class="mb-2 text-4xl">📄</div>
              <div class="mb-1 text-sm font-medium text-white">
                Click to upload or drag and drop
              </div>
              <div class="text-xs text-slate-500">
                PDF, DOC, DOCX, JPG, PNG (max 5MB each)
              </div>
            </label>
            <div v-if="documents.length > 0" class="mt-4">
              <div v-for="(file, index) in documents" :key="index" class="text-sm text-slate-300">
                ✓ {{ file.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button
          @click="handleSubmit"
          :disabled="uploading || !selectedRole"
          class="w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ uploading ? 'Setting up your account...' : 'Complete Profile' }}
        </button>
      </div>
    </div>
  </div>
</template>
