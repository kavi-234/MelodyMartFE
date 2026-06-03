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
  <main class="min-h-screen bg-slate-50">
    <!-- Hero -->
    <div class="bg-gradient-to-br from-purple-900 to-indigo-900 text-white py-20 px-4 text-center">
      <span class="inline-block mb-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">Expert Technicians</span>
      <h1 class="text-4xl md:text-6xl font-bold mb-4">Repair Specialists</h1>
      <p class="text-lg text-purple-200 max-w-xl mx-auto">From tuning to total restoration — our verified technicians keep your instruments sounding their best.</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-14 w-14 border-b-2 border-purple-600"></div>
        <p class="mt-4 text-slate-500">Loading specialists...</p>
      </div>
      <div v-else-if="error" class="text-center py-20 text-red-600">{{ error }}</div>
      <div v-else-if="specialists.length === 0" class="text-center py-20 text-slate-500">No specialists available at the moment.</div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="s in specialists" :key="s._id"
          class="group bg-white rounded-2xl border border-slate-200 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 overflow-hidden">
          <div class="relative aspect-square bg-slate-100 overflow-hidden">
            <div v-if="s.avatar" class="w-full h-full">
              <img :src="getAvatarUrl(s.avatar)" :alt="s.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" @error="onImgError" />
            </div>
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
              <span class="text-5xl font-bold text-white">{{ getInitials(s.name) }}</span>
            </div>
            <span class="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full shadow">✓ Verified</span>
          </div>

          <div class="p-5">
            <h3 class="text-lg font-bold text-slate-900 mb-0.5 truncate">{{ s.name }}</h3>
            <p class="text-sm text-purple-600 font-semibold mb-3 truncate">{{ s.specialization || 'Instrument Repair' }}</p>
            <div class="space-y-1.5 text-sm text-slate-500 mb-4">
              <div v-if="s.experience" class="flex items-center gap-2">⏱️ <span>{{ s.experience }} experience</span></div>
              <div v-if="s.hourlyRate" class="flex items-center gap-2">💵 <span class="font-semibold text-slate-700">Rs {{ s.hourlyRate }}/hr</span></div>
              <div v-if="s.phone" class="flex items-center gap-2">📞 <span>{{ s.phone }}</span></div>
            </div>
            <div class="space-y-2">
              <button @click="handleViewProfile(s._id)" class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors">View Profile</button>
              <button @click="openRequestModal(s)" class="w-full py-2.5 bg-white border-2 border-purple-600 text-purple-600 text-sm font-bold rounded-xl hover:bg-purple-50 transition-colors">Request Service</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <Teleport to="body">
      <div v-if="showProfile" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="closeProfile">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-slate-900">Specialist Profile</h3>
            <button @click="closeProfile" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div v-if="loadingProfile" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
          <div v-else-if="selectedSpecialist" class="p-6">
            <div class="flex items-start gap-5 mb-6">
              <div class="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                <img v-if="selectedSpecialist.avatar" :src="getAvatarUrl(selectedSpecialist.avatar)" class="w-full h-full object-cover" @error="onImgError" />
                <span v-else>{{ getInitials(selectedSpecialist.name) }}</span>
              </div>
              <div>
                <h4 class="text-xl font-bold text-slate-900">{{ selectedSpecialist.name }}</h4>
                <p class="text-purple-600 font-semibold">{{ selectedSpecialist.specialization || 'Instrument Repair' }}</p>
                <div class="flex gap-2 mt-2">
                  <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Verified</span>
                  <span v-if="selectedSpecialist.experience" class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{{ selectedSpecialist.experience }}</span>
                </div>
              </div>
            </div>
            <p v-if="selectedSpecialist.bio" class="text-slate-600 text-sm leading-relaxed mb-4">{{ selectedSpecialist.bio }}</p>
            <div v-if="selectedSpecialist.serviceTypes" class="mb-4">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Services</p>
              <p class="text-sm text-slate-700">{{ selectedSpecialist.serviceTypes }}</p>
            </div>
            <div class="flex gap-3 mt-6">
              <button @click="openRequestModal(selectedSpecialist!)" class="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors">Request Service</button>
              <button @click="closeProfile" class="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Close</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Request Modal -->
    <Teleport to="body">
      <div v-if="showRequestModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="closeRequestModal">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
          <div class="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 class="text-xl font-bold text-slate-900">Request Service</h3>
              <p class="text-sm text-slate-500 mt-0.5">{{ requestingSpecialist?.name }} · {{ requestingSpecialist?.specialization || 'Instrument Repair' }}</p>
            </div>
            <button @click="closeRequestModal" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="p-6">
            <div v-if="submitSuccess" class="text-center py-6">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4 class="text-lg font-bold text-slate-900 mb-1">Request Submitted!</h4>
              <p class="text-slate-500 text-sm">Redirecting to your dashboard...</p>
            </div>
            <form v-else @submit.prevent="submitRequest" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Service Type <span class="text-red-500">*</span></label>
                <select v-model="requestForm.serviceType" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-purple-400 bg-white">
                  <option value="" style="color:#111827;background:#fff;">Select a service type...</option>
                  <option v-for="t in SERVICE_TYPES" :key="t" :value="t" style="color:#111827;background:#fff;">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea v-model="requestForm.description" rows="3" placeholder="Describe the issue or work needed..." class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none bg-white"></textarea>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Date</label>
                <input type="date" v-model="requestForm.preferredDate" :min="new Date().toISOString().split('T')[0]" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-purple-400 bg-white" />
              </div>
              <div v-if="requestingSpecialist?.hourlyRate" class="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 flex justify-between">
                <span class="text-sm text-purple-700 font-medium">Estimated Rate</span>
                <span class="text-sm font-bold text-purple-900">Rs {{ requestingSpecialist.hourlyRate }}/hour</span>
              </div>
              <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{{ submitError }}</div>
              <div class="flex gap-3 pt-1">
                <button type="submit" :disabled="submitting" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors">
                  {{ submitting ? 'Submitting...' : 'Submit Request' }}
                </button>
                <button type="button" @click="closeRequestModal" :disabled="submitting" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>
