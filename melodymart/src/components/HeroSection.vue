<script setup lang="ts">
import { ref } from 'vue'

interface HeroProps {
  onGetStarted?: () => void
}

const props = defineProps<HeroProps>()

// Using a slightly more reliable Unsplash URL format
const heroImageUrl = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1600'
const figmaUrl = 'https://images.unsplash.com/photo-1685603084426-2fdb03be0931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBwaWFubyUyMGluc3RydW1lbnRzfGVufDF8fHx8MTc2ODc0MzAxNHww&ixlib=rb-4.1.0&q=80&w=1080'

const currentImage = ref(figmaUrl)

const handleImageError = () => {
  if (currentImage.value !== heroImageUrl) {
    currentImage.value = heroImageUrl
  }
}
</script>

<template>
  <section class="relative overflow-hidden bg-primary text-white">
    <!-- Gradient Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-primary/70 to-black/80 z-0"></div>

    <!-- Background Image -->
    <div class="absolute inset-0 z-0 opacity-30">
      <img
        :src="currentImage"
        alt="Musical instruments background"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-purple-400">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <span class="text-sm">Your Complete Music Solution</span>
        </div>

        <!-- Main Heading -->
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Feel the Beat.
          <br />
          <span class="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Live the Moment.
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Buy, sell, rent musical instruments. Book lessons with expert tutors. 
          Get professional repair services. All in one marketplace.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            class="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-purple-600 text-white hover:bg-purple-700 w-full sm:w-auto transition-all shadow-lg shadow-purple-900/20 font-semibold"
            type="button"
            @click="props.onGetStarted?.()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2">
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
            Start Shopping
          </button>
          <button 
            class="inline-flex items-center justify-center h-12 px-8 rounded-xl border-2 border-purple-500/50 text-purple-300 hover:bg-purple-950/50 w-full sm:w-auto transition-all font-semibold"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Watch Demo
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-white mb-1">5000+</div>
            <div class="text-sm text-purple-200">Instruments</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-white mb-1">200+</div>
            <div class="text-sm text-purple-200">Expert Tutors</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-white mb-1">15k+</div>
            <div class="text-sm text-purple-200">Happy Customers</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Wave -->
    <div class="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      <svg class="w-full h-12 md:h-20 fill-gray-50 dark:fill-bg-dark" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,60 C300,100 600,20 900,60 C1050,80 1150,80 1200,60 L1200,120 L0,120 Z" />
      </svg>
    </div>
  </section>
</template>
