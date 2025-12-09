<template>
  <nav class="sticky top-0 z-50 bg-bg-secondary dark:bg-bg-dark-secondary border-b border-coffee-cream dark:border-coffee-dark shadow-lg backdrop-blur-sm">
    <div class="container-custom">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <RouterLink 
          to="/" 
          class="flex items-center gap-2 text-2xl font-bold text-coffee-dark dark:text-coffee-cream hover:text-coffee-medium dark:hover:text-coffee-light transition-all duration-300"
        >
          <span class="text-3xl">🎵</span>
          <span>Melody Mart</span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <RouterLink 
            to="/shop" 
            class="text-coffee-dark dark:text-coffee-cream hover:text-coffee-medium dark:hover:text-coffee-light font-semibold transition-all duration-300 relative group"
          >
            Shop
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-medium group-hover:w-full transition-all duration-300"></span>
          </RouterLink>
          <RouterLink 
            to="/rent" 
            class="text-coffee-dark dark:text-coffee-cream hover:text-coffee-medium dark:hover:text-coffee-light font-semibold transition-all duration-300 relative group"
          >
            Rent
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-medium group-hover:w-full transition-all duration-300"></span>
          </RouterLink>
          <RouterLink 
            to="/sell" 
            class="text-coffee-dark dark:text-coffee-cream hover:text-coffee-medium dark:hover:text-coffee-light font-semibold transition-all duration-300 relative group"
          >
            Sell
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-medium group-hover:w-full transition-all duration-300"></span>
          </RouterLink>
          <RouterLink 
            to="/lessons" 
            class="text-coffee-dark dark:text-coffee-cream hover:text-coffee-medium dark:hover:text-coffee-light font-semibold transition-all duration-300 relative group"
          >
            Lessons
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-coffee-medium group-hover:w-full transition-all duration-300"></span>
          </RouterLink>
        </div>

        <!-- Right Side Icons -->
        <div class="flex items-center gap-4">
          <!-- Dark Mode Toggle -->
          <button 
            @click="$emit('toggle-theme')" 
            class="p-3 rounded-full bg-coffee-cream dark:bg-coffee-dark hover:bg-coffee-light dark:hover:bg-coffee-medium transition-all duration-300 hover:rotate-12 transform"
            title="Toggle dark mode"
          >
            <span v-if="!isDark" class="text-2xl">🌙</span>
            <span v-else class="text-2xl">☀️</span>
          </button>
          
          <RouterLink 
            to="/cart" 
            class="relative p-3 rounded-full hover:bg-coffee-cream dark:hover:bg-coffee-dark transition-all duration-300"
          >
            <span class="text-2xl">🛒</span>
            <span class="absolute -top-1 -right-1 bg-coffee-medium text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              3
            </span>
          </RouterLink>
          
          <RouterLink 
            to="/profile" 
            class="p-3 rounded-full hover:bg-coffee-cream dark:hover:bg-coffee-dark transition-all duration-300"
          >
            <span class="text-2xl">👤</span>
          </RouterLink>

          <!-- Mobile Menu Button -->
          <button class="md:hidden p-2 text-3xl">
            ☰
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-theme'])
</script>

<style scoped>
.router-link-active {
  @apply text-coffee-medium dark:text-coffee-light;
}
</style>

