<script setup lang="ts">
import { RouterLink } from 'vue-router'

const instruments = [
  { id: 1, name: 'Fender Stratocaster', category: 'Electric Guitar', price: 1299, rating: 4.8, reviews: 324, image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=300&fit=crop', badge: 'POPULAR', condition: 'New' },
  { id: 2, name: 'Yamaha P-125', category: 'Digital Piano', price: 899, rating: 4.9, reviews: 512, image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=300&fit=crop', badge: 'SALE', condition: 'New' },
  { id: 3, name: 'Pearl Export Series', category: 'Drum Set', price: 1499, rating: 4.7, reviews: 234, image: 'https://images.unsplash.com/photo-1543443983-ab5fde6f7f1c?w=400&h=300&fit=crop', badge: null, condition: 'New' },
  { id: 4, name: 'Stentor Student Violin', category: 'Violin', price: 279, rating: 4.6, reviews: 189, image: 'https://images.unsplash.com/photo-1612225330350-def8aa65ebcd?w=400&h=300&fit=crop', badge: 'SALE', condition: 'New' }
]

const instrumentPlaceholder = new URL('../assets/placeholders/instrument-default.svg', import.meta.url).href

const isExternalSource = (source: string) => /^https?:\/\//i.test(source)

const resolveInstrumentImage = (source: string) => {
  if (!source) return instrumentPlaceholder
  return isExternalSource(source) ? source : new URL(`../assets/${source}`, import.meta.url).href
}

const handleInstrumentError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target || target.dataset.fallbackApplied === 'true') return
  target.src = instrumentPlaceholder
  target.dataset.fallbackApplied = 'true'
}
</script>

<template>
  <section class="section-shell bg-white">
    <div class="section-inner">
      <div class="section-heading">
        <div class="heading-text">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">Featured Instruments</h2>
          <p class="text-gray-600">Discover our handpicked collection of premium instruments</p>
        </div>
        <RouterLink to="/shop" class="section-link">
          View All
          <svg class="mm-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="item in instruments" :key="item.id" class="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all">
          <div class="relative overflow-hidden bg-gray-100">
            <img
              :src="resolveInstrumentImage(item.image)"
              :alt="item.name"
              class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
              @error="handleInstrumentError"
            />
            <div v-if="item.badge" class="absolute top-4 left-4">
              <span class="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">{{ item.badge }}</span>
            </div>
            <button class="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg">
              <svg class="mm-icon-sm text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
            <div class="absolute bottom-4 right-4 px-3 py-1 bg-white/90 text-gray-700 text-xs font-semibold rounded-full">{{ item.condition }}</div>
          </div>
          <div class="p-5">
            <p class="text-xs text-purple-600 font-semibold mb-1">{{ item.category }}</p>
            <h3 class="text-lg font-bold text-gray-900 mb-3">{{ item.name }}</h3>
            <div class="flex items-center gap-2 mb-4">
              <svg class="mm-icon-sm text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span class="text-sm font-semibold">{{ item.rating }}</span>
              <span class="text-xs text-gray-500">({{ item.reviews }})</span>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <span class="text-2xl font-bold text-gray-900">${{ item.price }}</span>
              <button class="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>

      <div class="section-cta">
        <RouterLink to="/shop" class="inline-flex items-center gap-2 px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all">
          View All Instruments
          <svg class="mm-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-shell {
  width: 100%;
  padding: 5rem 1.5rem;
}

.section-inner {
  max-width: 1150px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.75rem;
}

.heading-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 640px;
}

.heading-text p {
  margin: 0;
}

.section-link {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  color: #7c3aed;
  transition: color 0.2s ease;
}

.section-link:hover {
  color: #6d28d9;
}

.section-cta {
  text-align: center;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .section-inner {
    gap: 3.5rem;
  }
}

@media (min-width: 1024px) {
  .section-heading {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    text-align: left;
  }

  .section-link {
    display: inline-flex;
    align-self: center;
  }
}

@media (max-width: 640px) {
  .section-shell {
    padding: 3.5rem 1.25rem;
  }
}
</style>
