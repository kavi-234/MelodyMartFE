<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import FeaturedInstruments from '../components/FeaturedInstruments.vue'
import FeaturedTutors from '../components/FeaturedTutors.vue'
import RepairSpecialists from '../components/RepairSpecialists.vue'
</script>

<template>
  <div class="w-full">
    <HeroSection />
    <FeaturedInstruments />
    <FeaturedTutors />
    <RepairSpecialists />

    <section class="py-20 bg-gradient-to-br from-primary via-purple-900 to-primary">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Your Music Journey?</h2>
        <p class="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">Join thousands of musicians who trust MelodyMart</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/shop" class="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">Start Shopping</RouterLink>
          <RouterLink to="/lessons" class="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary transition-all">Book a Lesson</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
