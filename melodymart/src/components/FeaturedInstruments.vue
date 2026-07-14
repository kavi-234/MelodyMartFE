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
  imageUrl?: string
  image?: { contentType: string }
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

const getImageUrl = (instrument: Instrument) => {
  // Use Cloudinary URL directly if available (new uploads), fall back to the image endpoint (legacy)
  return instrument.imageUrl || `http://localhost:5000/api/instruments/${instrument._id}/image`
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
  <section id="shop" class="fi-section">
    <div class="fi-glows" aria-hidden="true">
      <div class="fi-glow fi-glow-right" />
      <div class="fi-glow fi-glow-left" />
    </div>

    <div class="fi-container">
      <div class="fi-header">
        <div class="badge badge-gradient inline-flex mb-6">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4.5-9 3 6 2.5-5 4 8z"/>
          </svg>
          <span>Featured Collection</span>
        </div>
        <h2 class="fi-title">Premium Instruments</h2>
        <p class="fi-sub">Handpicked instruments from world-class makers. Discover your next musical companion.</p>
      </div>

      <div class="fi-filter-bar">
        <div class="fi-search-wrap">
          <Search class="fi-search-icon" />
          <input v-model="searchQuery" type="text" placeholder="Search instruments, brands, or categories..." class="fi-search" />
        </div>
        <div class="fi-cats">
          <button
            v-for="cat in categories" :key="cat"
            @click="selectedCategory = cat"
            :class="['fi-cat-btn', selectedCategory === cat ? 'fi-cat-active' : 'fi-cat-inactive']"
          >{{ cat }}</button>
        </div>
      </div>

      <div v-if="loading" class="fi-state">
        <div class="fi-spinner" />
      </div>
      <div v-else-if="filteredItems.length === 0" class="fi-state">
        <p class="fi-empty-text">No instruments found</p>
      </div>

      <div v-else class="fi-grid">
        <div v-for="item in filteredItems" :key="item._id" class="fi-card card-modern group overflow-hidden">
          <div class="fi-img-wrap">
            <img v-if="item.imageUrl || item.image" :src="getImageUrl(item)" :alt="item.name" class="fi-img" />
            <div v-else class="fi-img-placeholder">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="absolute top-4 left-4">
              <span v-if="item.stock > 0" class="badge inline-flex text-emerald-400 border-emerald-500/50 bg-emerald-500/20">In Stock</span>
              <span v-else class="badge inline-flex text-red-400 border-red-500/50 bg-red-500/20">Out of Stock</span>
            </div>
          </div>

          <div class="fi-card-body">
            <p class="fi-category">{{ item.category }}</p>
            <h3 class="fi-name">{{ item.name }}</h3>
            <p class="fi-brand">{{ item.brand }}</p>
            <div class="fi-price-row">
              <div>
                <span class="fi-price-lbl">Price</span>
                <span class="fi-price">Rs {{ item.price }}</span>
              </div>
              <div class="fi-price-right">
                <span class="fi-price-lbl">Stock</span>
                <span class="fi-stock">{{ item.stock }}</span>
              </div>
            </div>
            <div class="fi-btns">
              <button @click="handleAddToCart(item._id)" :disabled="item.stock === 0" class="flex-1 px-3 py-2 text-xs btn-outline rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Add to Cart</button>
              <button @click="handleBuyNow(item._id)" :disabled="item.stock === 0" class="flex-1 px-3 py-2 text-xs btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Buy Now</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && filteredItems.length > 0" class="fi-footer">
        <button class="btn-primary px-10 py-4 inline-flex items-center gap-3 rounded-xl">
          <span>Browse All Instruments</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fi-section { position: relative; padding: 6rem 0 8rem; background: var(--mm-graphite); overflow: hidden; }
.fi-glows { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.fi-glow { position: absolute; width: 24rem; height: 24rem; border-radius: 50%; filter: blur(64px); }
.fi-glow-right { top: 0;    right: 0;  background: rgba(212,168,83,0.08); opacity: 0.6; }
.fi-glow-left  { bottom: 0; left: 25%; background: rgba(192,123,80,0.07); opacity: 0.5; }
.fi-container { position: relative; z-index: 10; max-width: 90rem; margin: 0 auto; padding: 0 1.5rem; }
.fi-header { text-align: center; margin-bottom: 4rem; }
.fi-title { font-family: 'DM Serif Display', serif; font-size: clamp(2rem,5vw,3.25rem); font-weight: 400; color: var(--mm-ivory); margin: 0 0 1.25rem; letter-spacing: -0.02em; }
.fi-sub { font-size: 1.0625rem; color: var(--mm-sand); max-width: 40rem; margin: 0 auto; line-height: 1.65; font-family: 'DM Sans', sans-serif; }
.fi-filter-bar { max-width: 80rem; margin: 0 auto 4rem; display: flex; flex-direction: column; gap: 1rem; }
@media (min-width: 1024px) { .fi-filter-bar { flex-direction: row; } }
.fi-search-wrap { position: relative; flex: 1; }
.fi-search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 1.25rem; height: 1.25rem; color: var(--mm-stone); pointer-events: none; }
.fi-search { width: 100%; padding: 0.875rem 1rem 0.875rem 3rem; border-radius: 0.75rem; background: rgba(26,24,35,0.6); border: 1px solid var(--mm-warm-line); color: var(--mm-ivory); font-size: 0.875rem; outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.fi-search::placeholder { color: var(--mm-stone); }
.fi-search:focus { border-color: rgba(212,168,83,0.5); box-shadow: 0 0 0 3px rgba(212,168,83,0.08); }
.fi-cats { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
@media (min-width: 1024px) { .fi-cats { padding-bottom: 0; } }
.fi-cat-btn { padding: 0.75rem 1.25rem; border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; white-space: nowrap; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; border: none; }
.fi-cat-active { background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); box-shadow: 0 4px 16px rgba(212,168,83,0.25); }
.fi-cat-inactive { background: rgba(26,24,35,0.6); color: var(--mm-sand); border: 1px solid var(--mm-warm-line); }
.fi-cat-inactive:hover { border-color: rgba(212,168,83,0.4); color: var(--mm-cream); }
.fi-state { display: flex; justify-content: center; align-items: center; padding: 4rem 1rem; }
.fi-spinner { width: 48px; height: 48px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-gold); border-radius: 50%; animation: fi-spin 1s linear infinite; }
@keyframes fi-spin { to { transform: rotate(360deg); } }
.fi-empty-text { color: var(--mm-sand); font-size: 1.0625rem; font-family: 'DM Sans', sans-serif; }
.fi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
@media (max-width: 1024px) { .fi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .fi-grid { grid-template-columns: 1fr; } }
.fi-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; background: var(--mm-mist); border-radius: 0.875rem 0.875rem 0 0; }
.fi-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.fi-card:hover .fi-img { transform: scale(1.08); }
.fi-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--mm-stone); }
.fi-card-body { padding: 1.25rem; background: transparent; }
.fi-category { font-size: 0.6875rem; color: var(--mm-gold); font-weight: 700; margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'DM Sans', sans-serif; }
.fi-name { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.25rem; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; transition: color 0.2s; }
.fi-card:hover .fi-name { color: var(--mm-gold); }
.fi-brand { font-size: 0.75rem; color: var(--mm-stone); margin: 0 0 0.75rem; font-family: 'DM Sans', sans-serif; }
.fi-price-row { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--mm-warm-line); padding-top: 0.75rem; margin-bottom: 1rem; }
.fi-price-lbl { display: block; font-size: 0.6875rem; color: var(--mm-stone); margin-bottom: 0.25rem; font-family: 'DM Sans', sans-serif; }
.fi-price { font-family: 'DM Serif Display', serif; font-size: 1.125rem; font-weight: 400; color: var(--mm-gold); }
.fi-price-right { text-align: right; }
.fi-stock { font-size: 0.875rem; font-weight: 700; color: var(--mm-cream); font-family: 'DM Sans', sans-serif; }
.fi-btns { display: flex; gap: 0.5rem; }
.fi-footer { margin-top: 5rem; text-align: center; }
</style>

