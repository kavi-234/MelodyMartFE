<script setup lang="ts">
import { RouterLink } from 'vue-router'

const specialists = [
  { id: 1, name: 'John Smith', specialty: 'Guitar & Strings', rating: 4.9, reviews: 412, completedJobs: 1250, experience: '18 years', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', responseTime: '2-4 hours', verified: true },
  { id: 2, name: 'Lisa Anderson', specialty: 'Piano & Keyboard', rating: 5.0, reviews: 389, completedJobs: 980, experience: '22 years', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', responseTime: '1-3 hours', verified: true },
  { id: 3, name: 'Michael Brown', specialty: 'Brass & Woodwind', rating: 4.8, reviews: 267, completedJobs: 720, experience: '14 years', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', responseTime: '3-5 hours', verified: true },
  { id: 4, name: 'Emma Wilson', specialty: 'Drum Maintenance', rating: 4.9, reviews: 198, completedJobs: 550, experience: '11 years', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', responseTime: '2-4 hours', verified: true }
]

const avatarPlaceholder = new URL('../assets/placeholders/avatar-default.svg', import.meta.url).href

const resolveSpecialistImage = (source: string) => {
  if (!source) return avatarPlaceholder
  return /^https?:\/\//i.test(source) ? source : new URL(`../assets/${source}`, import.meta.url).href
}

const handleSpecialistError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target || target.dataset.fallbackApplied === 'true') return
  target.src = avatarPlaceholder
  target.dataset.fallbackApplied = 'true'
}
</script>

<template>
  <section class="section-shell bg-white">
    <div class="section-inner">
      <div class="section-heading">
        <div class="heading-text">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">Repair Specialists</h2>
          <p class="text-gray-600">Expert technicians for your instruments</p>
        </div>
        <RouterLink to="/repairs" class="section-link">
          View All
          <svg class="mm-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="specialist in specialists" :key="specialist.id" class="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all">
          <div class="relative">
            <div class="h-48 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <img
                :src="resolveSpecialistImage(specialist.image)"
                :alt="specialist.name"
                class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-110 transition-transform"
                @error="handleSpecialistError"
              />
            </div>
            <div v-if="specialist.verified" class="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg class="mm-icon-sm text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white/90 rounded-full shadow-lg">
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-xs font-semibold text-gray-700">{{ specialist.responseTime }}</span>
              </div>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-1">{{ specialist.name }}</h3>
            <p class="text-sm text-purple-600 font-semibold mb-4">{{ specialist.specialty }}</p>
            <div class="space-y-2 mb-4 pb-4 border-b border-gray-100">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Experience</span>
                <span class="font-semibold">{{ specialist.experience }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Jobs Done</span>
                <span class="font-semibold">{{ specialist.completedJobs }}+</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Rating</span>
                <span class="font-semibold">⭐ {{ specialist.rating }}</span>
              </div>
            </div>
            <button class="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md">Request Service</button>
          </div>
        </div>
      </div>

      <div class="section-cta">
        <RouterLink to="/repairs" class="inline-flex items-center gap-2 px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all">
          View All Specialists
          <svg class="mm-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-shell {
  width: 100%;
  padding: 5rem 1.5rem;
}

.section-inner {
  max-width: 1150px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.75rem;
}

.heading-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 640px;
}

.heading-text p {
  margin: 0;
}

.section-link {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  color: #7c3aed;
  transition: color 0.2s ease;
}

.section-link:hover {
  color: #6d28d9;
}

.section-cta {
  text-align: center;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .section-inner {
    gap: 3.5rem;
  }
}

@media (min-width: 1024px) {
  .section-heading {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    text-align: left;
  }

  .section-link {
    display: inline-flex;
    align-self: center;
  }
}

@media (max-width: 640px) {
  .section-shell {
    padding: 3.5rem 1.25rem;
  }
}
</style>
