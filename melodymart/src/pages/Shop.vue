<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-8">Shop Instruments</h1>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Filters Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-secondary rounded-lg p-6 sticky top-20">
          <h3 class="font-bold text-lg mb-4">Filters</h3>

          <!-- Category Filter -->
          <div class="mb-6">
            <h4 class="font-semibold mb-3">Category</h4>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="filters.categories" value="guitars" />
                <span>Guitars</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="filters.categories" value="keyboards" />
                <span>Keyboards</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="filters.categories" value="drums" />
                <span>Drums</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="filters.categories" value="strings" />
                <span>Strings</span>
              </label>
            </div>
          </div>

          <!-- Price Filter -->
          <div class="mb-6">
            <h4 class="font-semibold mb-3">Price Range</h4>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="filters.priceRange" value="0-500" />
                <span>$0 - $500</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="filters.priceRange" value="500-1500" />
                <span>$500 - $1,500</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="filters.priceRange" value="1500-5000" />
                <span>$1,500 - $5,000</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="filters.priceRange" value="5000+" />
                <span>$5,000+</span>
              </label>
            </div>
          </div>

          <!-- Rating Filter -->
          <div class="mb-6">
            <h4 class="font-semibold mb-3">Rating</h4>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer" v-for="star in [4.5, 4, 3]" :key="star">
                <input type="radio" v-model="filters.rating" :value="star" />
                <span>{{ star }}★ & up</span>
              </label>
            </div>
          </div>

          <button class="w-full bg-primary text-secondary py-2 rounded font-semibold hover:opacity-90 transition">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="lg:col-span-3">
        <!-- Sort Options -->
        <div class="flex justify-between items-center mb-6">
          <span class="text-muted">Showing 48 products</span>
          <select v-model="sortBy" class="px-4 py-2 bg-secondary rounded border border-border focus:outline-none focus:border-primary">
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <!-- Product Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-secondary rounded-lg overflow-hidden hover:border-primary border border-border transition"
          >
            <div class="h-48 bg-muted flex items-center justify-center">
              <span class="text-6xl">{{ product.icon }}</span>
            </div>
            <div class="p-4">
              <span class="text-xs bg-primary text-secondary px-2 py-1 rounded">{{ product.condition }}</span>
              <h3 class="font-bold mt-2 mb-1">{{ product.name }}</h3>
              <p class="text-muted text-sm mb-2">{{ product.brand }}</p>
              <p class="text-xs text-muted mb-3">By {{ product.seller }}</p>
              
              <div class="flex justify-between items-center mb-3">
                <span class="text-primary font-bold text-lg">${{ product.price }}</span>
                <span class="text-yellow-400">★ {{ product.rating }}</span>
              </div>
              
              <button class="w-full bg-primary text-secondary py-2 rounded hover:opacity-90 transition font-semibold">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filters = ref({
  categories: [],
  priceRange: '',
  rating: '',
})

const sortBy = ref('popular')

const products = [
  { id: 1, name: 'Fender Stratocaster', brand: 'Fender', price: 899, rating: 4.8, seller: 'Music Store Pro', condition: 'New', icon: '🎸' },
  { id: 2, name: 'Yamaha Digital Piano', brand: 'Yamaha', price: 1299, rating: 4.9, seller: 'Keyboard Experts', condition: 'New', icon: '🎹' },
  { id: 3, name: 'Ludwig Drum Kit', brand: 'Ludwig', price: 2499, rating: 4.7, seller: 'Drum Central', condition: 'New', icon: '🥁' },
  { id: 4, name: 'Violin Pro', brand: 'Stradivarius', price: 3999, rating: 5.0, seller: 'String Masters', condition: 'Used', icon: '🎻' },
  { id: 5, name: 'Gibson Les Paul', brand: 'Gibson', price: 1299, rating: 4.6, seller: 'Guitar World', condition: 'New', icon: '🎸' },
  { id: 6, name: 'Shure Microphone', brand: 'Shure', price: 199, rating: 4.9, seller: 'Audio Pro', condition: 'New', icon: '🎤' },
]

const filteredProducts = computed(() => {
  return products.filter(product => {
    if (filters.value.categories.length > 0) {
      // Category filter logic
    }
    if (filters.value.priceRange) {
      // Price filter logic
    }
    if (filters.value.rating) {
      // Rating filter logic
    }
    return true
  })
})
</script>
