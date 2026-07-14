<script setup lang="ts">
import FeaturedTutors from './FeaturedTutors.vue'
import PopularLessons from './PopularLessons.vue'
</script>

<template>
  <section id="lessons" class="relative py-24 md:py-32 bg-slate-950 overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl opacity-50"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl opacity-40"></div>
    </div>

    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-20">
        <div class="badge badge-gradient inline-flex mb-6">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
          <span>Expert Learning & Services</span>
        </div>

        <h2 class="text-4xl md:text-5xl font-bold mb-6 text-white">
          Master Your Craft
        </h2>

        <p class="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Beyond instruments, we connect you with expert tutors, personalized lessons, and professional repair services. Grow your musical journey with us.
        </p>
      </div>

      <!-- Featured Tutors Subsection -->
      <FeaturedTutors />

      <!-- Popular Lessons Section -->
      <PopularLessons />
    </div>
  </section>
</template>
