<script setup lang="ts">
import FeaturedTutors from './FeaturedTutors.vue'
import PopularLessons from './PopularLessons.vue'
</script>

<template>
  <section id="lessons" class="py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold uppercase tracking-wider">
          Services & Learning
        </span>

        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white">
          More Than Just Instruments
        </h2>

        <p class="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          At Melody Mart, we don't just sell instruments—we help you master them. 
          Connect with expert tutors, book personalized lessons, and get professional repair services 
          to keep your instruments in perfect condition.
        </p>
      </div>

      <!-- Featured Tutors Subsection -->
      <FeaturedTutors />

      <!-- Popular Lessons Section -->
      <PopularLessons />
    </div>
  </section>
</template>
