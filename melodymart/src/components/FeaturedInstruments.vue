<script setup lang="ts">
import { ref, computed } from 'vue'
import { Heart, Star, Search, SlidersHorizontal } from 'lucide-vue-next'

interface Instrument {
  id: number
  name: string
  category: string
  price: number
  rating: number
  reviews: number
  image: string
  featured?: boolean
  condition: string
}

const searchQuery = ref('')
const selectedCategory = ref('All')

const instruments: Instrument[] = [
  {
    id: 1,
    name: 'Fender Stratocaster',
    category: 'Electric Guitar',
    price: 1299,
    rating: 4.8,
    reviews: 124,
    featured: true,
    condition: 'New',
    image:
      'https://images.unsplash.com/photo-1568193755668-aae18714a9f1?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 2,
    name: 'Yamaha P-125',
    category: 'Digital Piano',
    price: 649,
    rating: 4.9,
    reviews: 89,
    condition: 'New',
    image:
      'https://images.unsplash.com/photo-1599494009395-5b43c783a2d5?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 3,
    name: 'Pearl Export Series',
    category: 'Drum Set',
    price: 899,
    rating: 4.7,
    reviews: 56,
    featured: true,
    condition: 'Like New',
    image:
      'https://images.unsplash.com/photo-1588032786045-59cefda005c0?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 4,
    name: 'Gibson Les Paul',
    category: 'Electric Guitar',
    price: 2499,
    rating: 4.9,
    reviews: 88,
    condition: 'New',
    image:
      'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&q=80&w=1200'
  }
]

const categories = ['All', ...new Set(instruments.map(i => i.category))]

const filteredItems = computed(() => {
  return instruments.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All' || item.category === selectedCategory.value
    
    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <section id="shop" class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <span class="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold uppercase tracking-wider">
          Latest Listings
        </span>

        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-black">
          Featured Instruments
        </h2>

        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          Handpicked premium instruments from trusted sellers.
        </p>
      </div>

      <!-- Search and Filter Bar -->
      <div class="max-w-4xl mx-auto mb-12">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search instruments, brands, or categories..."
              class="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
          
          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="selectedCategory = cat"
              :class="[
                'px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all border',
                selectedCategory === cat 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
              ]"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div v-if="filteredItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300"
        >
          <!-- Image -->
          <div class="relative aspect-square overflow-hidden bg-slate-100">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            <span
              v-if="item.featured"
              class="absolute top-4 left-4 px-2 py-1 bg-purple-600 text-white text-[10px] font-bold rounded shadow-lg"
            >
              Featured
            </span>

            <button
              class="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-colors"
            >
              <Heart class="w-4 h-4 text-slate-600" />
            </button>

            <span
              class="absolute bottom-4 right-4 px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-700 rounded shadow-sm border border-slate-200"
            >
              {{ item.condition }}
            </span>
          </div>

          <!-- Content -->
          <div class="p-6">
            <p class="text-xs text-purple-600 font-semibold mb-1 uppercase tracking-wider">
              {{ item.category }}
            </p>

            <h3 class="text-xl font-bold mb-2 text-black">
              {{ item.name }}
            </h3>

            <div class="flex items-center gap-1 mb-4">
              <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span class="font-semibold text-black">{{ item.rating }}</span>
              <span class="text-sm text-slate-500">
                ({{ item.reviews }} reviews)
              </span>
            </div>

            <div class="flex items-center justify-between border-t border-slate-100 pt-4">
              <span class="text-2xl font-bold text-purple-600">
                ${{ item.price }}
              </span>
              <button
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results State -->
      <div v-else class="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
          <Search class="w-8 h-8 text-slate-300" />
        </div>
        <h3 class="text-xl font-bold text-black mb-2">No instruments found</h3>
        <p class="text-slate-500 mb-6">We couldn't find anything matching "{{ searchQuery }}" in {{ selectedCategory }}.</p>
        <button 
          @click="searchQuery = ''; selectedCategory = 'All'"
          class="text-purple-600 font-bold hover:text-purple-700 transition-colors"
        >
          Clear all filters
        </button>
      </div>

      <!-- View All -->
      <div v-if="filteredItems.length > 0" class="mt-16 text-center">
        <button class="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-purple-500/20">
          Browse All Instruments
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

