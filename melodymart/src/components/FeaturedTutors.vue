<template>
  <section id="lessons" class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold uppercase tracking-wider">
          Expert Instructors
        </span>

        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-black">
          Featured Tutors
        </h2>

        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          Learn from the best. Our certified tutors bring years of experience and passion to every lesson.
        </p>
      </div>

      <!-- Tutors Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <div
          v-for="tutor in tutors"
          :key="tutor.id"
          class="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300"
        >
          <div class="relative aspect-square overflow-hidden bg-slate-100">
            <img
              :src="tutor.image"
              :alt="tutor.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              @error="(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'"
            />

            <span
              v-if="tutor.verified"
              class="absolute top-4 right-4 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded flex items-center shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 mr-1">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
              Verified
            </span>
          </div>

          <div class="p-6">
            <h3 class="text-xl font-bold mb-1 text-black">
              {{ tutor.name }}
            </h3>

            <p class="text-sm text-purple-600 mb-3">
              {{ tutor.instrument }}
            </p>

            <div class="flex items-center gap-1 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-yellow-500">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span class="font-semibold text-black">{{ tutor.rating }}</span>
              <span class="text-sm text-slate-500">
                ({{ tutor.reviews }} reviews)
              </span>
            </div>

            <div class="space-y-2 mb-4 text-sm text-slate-600">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{{ tutor.experience }} experience</span>
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>{{ tutor.students }}+ students</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-1 mb-4">
              <span
                v-for="(specialty, index) in tutor.specialties"
                :key="index"
                class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200"
              >
                {{ specialty }}
              </span>
            </div>

            <div class="border-t border-slate-100 pt-4 flex items-center justify-between">
              <div>
                <div class="text-[10px] text-slate-500 uppercase tracking-tighter">Rate</div>
                <div class="text-xl font-bold text-purple-600">
                  ${{ tutor.hourlyRate }}<span class="text-sm text-slate-500">/hr</span>
                </div>
              </div>

              <button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20">
                Book Lesson
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View All Button -->
      <div class="mt-16 text-center">
        <button class="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-purple-500/20">
          Find Your Perfect Tutor
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const tutors = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    instrument: 'Piano & Keyboard',
    rating: 5.0,
    reviews: 89,
    experience: '12 years',
    students: 150,
    hourlyRate: 65,
    image: 'https://images.unsplash.com/photo-1696522732406-065ef560da8c',
    verified: true,
    specialties: ['Classical', 'Jazz', 'Theory']
  },
  {
    id: 2,
    name: 'Marcus Chen',
    instrument: 'Guitar (Acoustic & Electric)',
    rating: 4.9,
    reviews: 124,
    experience: '10 years',
    students: 200,
    hourlyRate: 55,
    image: 'https://images.unsplash.com/photo-1620138546344-7b2c38514edf?w=400&h=400&fit=crop',
    verified: true,
    specialties: ['Rock', 'Blues', 'Fingerstyle']
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    instrument: 'Violin & Viola',
    rating: 5.0,
    reviews: 67,
    experience: '15 years',
    students: 95,
    hourlyRate: 70,
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
    verified: true,
    specialties: ['Classical', 'Orchestra', 'Suzuki Method']
  },
  {
    id: 4,
    name: 'David Thompson',
    instrument: 'Drums & Percussion',
    rating: 4.8,
    reviews: 156,
    experience: '8 years',
    students: 180,
    hourlyRate: 60,
    image: 'https://images.unsplash.com/photo-1543443983-ab5fde6f7f1c?w=400&h=400&fit=crop',
    verified: true,
    specialties: ['Jazz', 'Rock', 'Latin']
  }
]
</script>
