<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Heart, Star, Search, SlidersHorizontal } from 'lucide-vue-next'

interface Instrument {
  _id: string
  name: string
  category: string
  brand: string
  price: number
  stock: number
  description: string
  image?: {
    contentType: string
  }
}

const searchQuery = ref('')
const selectedCategory = ref('All')
const instruments = ref<Instrument[]>([])
const loading = ref(true)

const categories = computed(() => ['All', ...new Set(instruments.value.map(i => i.category))])

const filteredItems = computed(() => {
  return instruments.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All' || item.category === selectedCategory.value
    
    return matchesSearch && matchesCategory
  })
})

const fetchInstruments = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/instruments')
    const data = await response.json()
    instruments.value = data.instruments || []
  } catch (error) {
    console.error('Error fetching instruments:', error)
  } finally {
    loading.value = false
  }
}

const getImageUrl = (id: string) => {
  return `http://localhost:5000/api/instruments/${id}/image`
}

const handleAddToCart = async (instrumentId: string) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) {
    alert('Please login to add items to cart')
    window.location.href = '/auth'
    return
  }

  if (user.role !== 'customer') {
    alert('Only customers can add items to cart')
    return
  }

  try {
    const response = await fetch('http://localhost:5000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ instrumentId, quantity: 1 })
    })

    const data = await response.json()

    if (response.ok) {
      alert('Item added to cart!')
    } else {
      alert(data.message || 'Failed to add to cart')
    }
  } catch (error) {
    alert('Error adding to cart')
  }
}

const handleBuyNow = (instrumentId: string) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) {
    alert('Please login to purchase')
    window.location.href = '/auth'
    return
  }

  if (user.role !== 'customer') {
    alert('Only customers can purchase items')
    return
  }

  // Add to cart and redirect to checkout (implement checkout later)
  handleAddToCart(instrumentId)
}

onMounted(fetchInstruments)
</script>

<template>
  <section id="shop" class="py-16 md:py-24 bg-white dark:bg-slate-900">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <span class="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold uppercase tracking-wider">
          Latest Listings
        </span>

        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white">
          Featured Instruments
        </h2>

        <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
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

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredItems.length === 0" class="text-center py-12">
        <p class="text-slate-500">No instruments found</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <div
          v-for="item in filteredItems"
          :key="item._id"
          class="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-2xl transition-all duration-300"
        >
          <!-- Image -->
          <div class="relative aspect-square overflow-hidden bg-slate-100">
            <img
              v-if="item.image"
              :src="getImageUrl(item._id)"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
              No Image
            </div>

            <span
              v-if="item.stock > 0"
              class="absolute top-4 left-4 px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded shadow-lg"
            >
              In Stock
            </span>
            <span
              v-else
              class="absolute top-4 left-4 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded shadow-lg"
            >
              Out of Stock
            </span>

          </div>

          <!-- Content -->
          <div class="p-4">
            <p class="text-xs text-purple-600 font-semibold mb-1 uppercase tracking-wider">
              {{ item.category }}
            </p>

            <h3 class="text-lg font-bold mb-1 text-black line-clamp-1">
              {{ item.name }}
            </h3>

            <p class="text-xs text-slate-600 mb-2">{{ item.brand }}</p>
            
            <p class="text-xs text-slate-500 mb-3 line-clamp-1">{{ item.description }}</p>

            <div class="flex items-center justify-between border-t border-slate-100 pt-3 mb-3">
              <div>
                <span class="text-xs text-slate-500 block">Price</span>
                <span class="text-xl font-bold text-purple-600">
                  Rs {{ item.price }}
                </span>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-500 block">Stock</span>
                <span class="text-sm font-semibold text-slate-700">{{ item.stock }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button 
                @click="handleAddToCart(item._id)"
                :disabled="item.stock === 0"
                class="flex-1 px-3 py-2 text-xs border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button 
                @click="handleBuyNow(item._id)"
                :disabled="item.stock === 0"
                class="flex-1 px-3 py-2 text-xs bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View All -->
      <div v-if="!loading && filteredItems.length > 0" class="mt-16 text-center">
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

