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
  <section id="repairs" class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold uppercase tracking-wider">
          Expert Technicians
        </span>

        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-black">
          Repair Specialists
        </h2>

        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          From tuning to total restoration, our skilled technicians ensure your instruments sound their absolute best.
        </p>
      </div>

      <!-- Specialists Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <div
          v-for="specialist in specialists"
          :key="specialist.id"
          class="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300"
        >
          <div class="relative aspect-square overflow-hidden bg-slate-100">
            <img
              :src="resolveSpecialistImage(specialist.image)"
              :alt="specialist.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              @error="handleSpecialistError"
            />

            <span
              v-if="specialist.verified"
              class="absolute top-4 right-4 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded flex items-center shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 mr-1">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
              Verified
            </span>

            <div class="absolute bottom-4 left-4">
              <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-700 rounded shadow-sm border border-slate-200 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                {{ specialist.responseTime }} response
              </span>
            </div>
          </div>

          <div class="p-6">
            <h3 class="text-xl font-bold mb-1 text-black">
              {{ specialist.name }}
            </h3>

            <p class="text-sm text-purple-600 mb-3">
              {{ specialist.specialty }}
            </p>

            <div class="flex items-center gap-1 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-yellow-500">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span class="font-semibold text-black">{{ specialist.rating }}</span>
              <span class="text-sm text-slate-500">
                ({{ specialist.reviews }} reviews)
              </span>
            </div>

            <div class="space-y-2 mb-4 text-sm text-slate-600">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{{ specialist.experience }} experience</span>
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>{{ specialist.completedJobs }}+ jobs fixed</span>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-4 flex items-center justify-between">
              <RouterLink
                to="/repairs"
                class="w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20"
              >
                Request Service
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- View All Button -->
      <div class="mt-16 text-center">
        <RouterLink
          to="/repairs"
          class="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-purple-500/20"
        >
          View All Specialists
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scoped styles removed in favor of utility classes */
</style>
