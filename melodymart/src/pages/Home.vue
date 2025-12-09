<template>
  <div>
    <!-- Hero Section -->
    <section class="gradient-coffee py-20 md:py-32">
      <div class="container-custom text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-coffee-dark dark:text-coffee-cream mb-6">
          Your Complete Music Journey Starts Here
        </h1>
        <p class="text-xl md:text-2xl text-coffee-medium dark:text-coffee-light mb-8 max-w-3xl mx-auto">
          Buy, rent, sell, and learn - everything for musicians in one place
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button class="btn-primary text-lg">Browse Instruments</button>
          <button class="btn-secondary text-lg">Get Started</button>
        </div>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto">
          <div class="flex gap-2">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search instruments, brands, or types..." 
              class="flex-1 px-6 py-4 rounded-xl bg-white dark:bg-bg-dark-secondary border-2 border-coffee-cream dark:border-coffee-dark focus:outline-none focus:border-coffee-medium dark:focus:border-coffee-light text-coffee-dark dark:text-coffee-cream transition-all"
            />
            <button class="btn-primary px-8"> Search</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 md:py-24 bg-bg-primary dark:bg-bg-dark">
      <div class="container-custom">
        <h2 class="text-3xl md:text-5xl font-bold text-center text-coffee-dark dark:text-coffee-cream mb-4">
          Complete Music Solutions
        </h2>
        <p class="text-center text-coffee-light dark:text-coffee-accent mb-12 max-w-2xl mx-auto">
          Everything you need for your musical journey, all in one convenient platform
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="category in categories" :key="category.id" class="category-card group">
            <div class="text-5xl mb-4">{{ category.icon }}</div>
            <h3 class="text-xl font-bold text-coffee-dark dark:text-coffee-cream mb-2">{{ category.name }}</h3>
            <p class="text-coffee-light dark:text-coffee-accent">{{ category.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 md:py-24 bg-bg-secondary dark:bg-bg-dark-secondary">
      <div class="container-custom">
        <h2 class="text-3xl md:text-5xl font-bold text-center text-coffee-dark dark:text-coffee-cream mb-12">
          Managing Everything on One Platform
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.id" class="feature-card group">
            <div class="w-14 h-14 bg-coffee-light dark:bg-coffee-medium rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              {{ feature.icon }}
            </div>
            <h4 class="text-xl font-bold text-coffee-dark dark:text-coffee-cream mb-2">{{ feature.title }}</h4>
            <p class="text-coffee-light dark:text-coffee-accent mb-4">{{ feature.description }}</p>
            <a href="#" class="text-coffee-medium dark:text-coffee-light font-semibold hover:underline inline-flex items-center gap-2 group">
              Learn more <span class="transform group-hover:translate-x-1 transition-transform"></span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16 md:py-24 bg-bg-primary dark:bg-bg-dark">
      <div class="container-custom">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl md:text-5xl font-bold text-coffee-dark dark:text-coffee-cream">Featured Instruments</h2>
          <a href="/shop" class="text-coffee-medium dark:text-coffee-light font-semibold hover:underline hidden md:inline-flex items-center gap-2">
            View All Products <span></span>
          </a>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="product in featuredProducts" :key="product.id" class="product-card group">
            <div class="product-image">
              <span class="text-6xl">{{ product.icon }}</span>
            </div>
            <div class="p-5">
              <h3 class="text-lg font-bold text-coffee-dark dark:text-coffee-cream mb-1">{{ product.name }}</h3>
              <p class="text-sm text-coffee-light dark:text-coffee-accent mb-3">{{ product.brand }}</p>
              <div class="flex justify-between items-center mb-4">
                <span class="text-2xl font-bold text-coffee-medium dark:text-coffee-light">${{ product.price }}</span>
                <span class="text-yellow-500 dark:text-yellow-400"> {{ product.rating }}</span>
              </div>
              <button class="btn-primary w-full">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-16 md:py-24 bg-bg-secondary dark:bg-bg-dark-secondary">
      <div class="container-custom">
        <h2 class="text-3xl md:text-5xl font-bold text-center text-coffee-dark dark:text-coffee-cream mb-4">
          Meet Our Expert Tutors
        </h2>
        <p class="text-center text-coffee-light dark:text-coffee-accent mb-12 max-w-2xl mx-auto">
          Learn from experienced professionals who are passionate about music education
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="tutor in tutors" :key="tutor.id" class="tutor-card group">
            <div class="tutor-avatar">{{ tutor.avatar }}</div>
            <h4 class="text-xl font-bold text-coffee-dark dark:text-coffee-cream mb-1">{{ tutor.name }}</h4>
            <p class="text-coffee-medium dark:text-coffee-light font-semibold mb-2">{{ tutor.specialty }}</p>
            <p class="text-sm text-coffee-light dark:text-coffee-accent mb-6">{{ tutor.experience }}</p>
            <button class="btn-primary w-full">Book Now</button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-24 bg-bg-primary dark:bg-bg-dark">
      <div class="container-custom text-center">
        <h2 class="text-3xl md:text-5xl font-bold text-coffee-dark dark:text-coffee-cream mb-6">
          Ready to Start Your Musical Journey?
        </h2>
        <p class="text-xl text-coffee-medium dark:text-coffee-light mb-8 max-w-2xl mx-auto">
          Join thousands of musicians who trust Melody Mart for their musical needs
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="btn-primary text-lg">Create Account</button>
          <button class="btn-secondary text-lg">Explore Catalog</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

const categories = [
  { id: 1, name: 'Buy Instruments', icon: '', description: 'Explore our wide selection of quality instruments' },
  { id: 2, name: 'Rent Equipment', icon: '', description: 'Flexible rental options for all skill levels' },
  { id: 3, name: 'Sell Your Items', icon: '', description: 'Easy marketplace to sell your instruments' },
  { id: 4, name: 'Book Lessons', icon: '', description: 'Connect with professional music teachers' },
]

const features = [
  { id: 1, icon: '', title: 'Curated Lessons', description: 'Expert-designed courses for all skill levels' },
  { id: 2, icon: '', title: 'On-Site Visits', description: 'Try instruments before you buy' },
  { id: 3, icon: '', title: 'Repair Offered', description: 'Professional maintenance services' },
]

const featuredProducts = [
  { id: 1, name: 'Fender Stratocaster', brand: 'Fender', price: 899, rating: 4.8, icon: '' },
  { id: 2, name: 'Yamaha Piano P-125', brand: 'Yamaha', price: 1299, rating: 4.9, icon: '' },
  { id: 3, name: 'Ludwig Drum Kit', brand: 'Ludwig', price: 2499, rating: 4.7, icon: '' },
  { id: 4, name: 'Fender P-Bass', brand: 'Fender', price: 799, rating: 4.6, icon: '' },
]

const tutors = [
  { id: 1, name: 'James Williams', avatar: '', specialty: 'Guitar Instructor', experience: '15+ Years Experience' },
  { id: 2, name: 'Emma Thompson', avatar: '', specialty: 'Piano Teacher', experience: '12+ Years Experience' },
  { id: 3, name: 'Michael Chen', avatar: '', specialty: 'Drum Instructor', experience: '10+ Years Experience' },
]
</script>

<style scoped>
.gradient-coffee {
  background: linear-gradient(135deg, #F5E6D3 0%, #D7CCC8 100%);
}

.dark .gradient-coffee {
  background: linear-gradient(135deg, #2C1F1A 0%, #1A1412 100%);
}

.category-card {
  @apply bg-white dark:bg-bg-dark-secondary rounded-2xl p-8 text-center border-2 border-coffee-cream dark:border-coffee-dark transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-coffee-medium dark:hover:border-coffee-light cursor-pointer;
}

.feature-card {
  @apply bg-white dark:bg-bg-dark rounded-2xl p-8 border border-coffee-cream dark:border-coffee-dark transition-all duration-300 hover:shadow-xl;
}

.product-card {
  @apply bg-white dark:bg-bg-dark-secondary rounded-2xl overflow-hidden border border-coffee-cream dark:border-coffee-dark transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer;
}

.product-image {
  @apply h-56 flex items-center justify-center;
  background: linear-gradient(135deg, #F5E6D3 0%, #D7CCC8 100%);
}

.dark .product-image {
  background: linear-gradient(135deg, #3E2723 0%, #2C1F1A 100%);
}

.tutor-card {
  @apply bg-white dark:bg-bg-dark rounded-2xl p-8 text-center border border-coffee-cream dark:border-coffee-dark transition-all duration-300 hover:shadow-xl;
}

.tutor-avatar {
  @apply w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl;
  background: linear-gradient(135deg, #5D4037 0%, #3E2723 100%);
}
</style>
