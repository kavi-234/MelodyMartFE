<script setup lang="ts">
import { RouterLink } from 'vue-router'

const tutors = [
  { id: 1, name: 'Sarah Johnson', specialty: 'Piano', rating: 4.9, reviews: 287, students: 450, experience: '15 years', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', hourlyRate: 75, verified: true },
  { id: 2, name: 'Marcus Chen', specialty: 'Guitar', rating: 4.8, reviews: 195, students: 320, experience: '12 years', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', hourlyRate: 65, verified: true },
  { id: 3, name: 'Elena Rodriguez', specialty: 'Violin', rating: 5.0, reviews: 342, students: 520, experience: '20 years', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', hourlyRate: 85, verified: true },
  { id: 4, name: 'David Park', specialty: 'Drums', rating: 4.7, reviews: 156, students: 280, experience: '10 years', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', hourlyRate: 60, verified: true }
]

const avatarPlaceholder = new URL('../assets/placeholders/avatar-default.svg', import.meta.url).href

const resolveTutorImage = (source: string) => {
  if (!source) return avatarPlaceholder
  return /^https?:\/\//i.test(source) ? source : new URL(`../assets/${source}`, import.meta.url).href
}

const handleTutorError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target || target.dataset.fallbackApplied === 'true') return
  target.src = avatarPlaceholder
  target.dataset.fallbackApplied = 'true'
}
</script>

<template>
  <section class="section-shell bg-gradient-to-br from-purple-50 to-pink-50">
    <div class="section-inner">
      <div class="section-heading">
        <div class="heading-text">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">Featured Tutors</h2>
          <p class="text-gray-600">Learn from the best music instructors</p>
        </div>
        <RouterLink to="/lessons" class="section-link">
          View All
          <svg class="mm-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="tutor in tutors" :key="tutor.id" class="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all">
          <div class="relative">
            <div class="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <img
                :src="resolveTutorImage(tutor.image)"
                :alt="tutor.name"
                class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-110 transition-transform"
                @error="handleTutorError"
              />
            </div>
            <div v-if="tutor.verified" class="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <svg class="mm-icon-sm text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-1">{{ tutor.name }}</h3>
            <p class="text-sm text-purple-600 font-semibold mb-4">{{ tutor.specialty }}</p>
            <div class="space-y-2 mb-4 pb-4 border-b border-gray-100">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Experience</span>
                <span class="font-semibold">{{ tutor.experience }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Rating</span>
                <span class="font-semibold">⭐ {{ tutor.rating }} ({{ tutor.reviews }})</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-2xl font-bold">${{ tutor.hourlyRate }}<span class="text-sm text-gray-500 font-normal">/hr</span></div>
              <button class="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md">Book</button>
            </div>
          </div>
        </div>
      </div>

      <div class="section-cta">
        <RouterLink to="/lessons" class="inline-flex items-center gap-2 px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all">
          View All Tutors
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
  padding: clamp(3.5rem, 6vw, 5rem) clamp(1rem, 6vw, 3rem);
}

.section-inner {
  width: min(100%, 1280px);
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
