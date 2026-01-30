<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (event: 'get-started'): void
}>()

const searchQuery = ref('')
const selectedCategory = ref('all')
const priceRange = ref('all')

const priceRanges = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under $500', value: '0-500' },
  { label: '$500 - $1000', value: '500-1000' },
  { label: 'Over $1000', value: '1000+' }
]

const backgroundImage = ref(
  'https://images.unsplash.com/photo-1685603084426-2fdb03be0931?auto=format&fit=crop&w=1600&q=80'
)

const backgroundFallback = new URL('../assets/placeholders/instrument-default.svg', import.meta.url).href

const handleSearch = () => {
  console.log('Searching:', searchQuery.value, selectedCategory.value, priceRange.value)
}

const handleGetStarted = () => {
  emit('get-started')
}

const handleBackgroundError = () => {
  if (backgroundImage.value !== backgroundFallback) {
    backgroundImage.value = backgroundFallback
  }
}
</script>

<template>
  <section class="relative overflow-hidden bg-slate-950 text-slate-100">
    <div class="absolute inset-0" aria-hidden="true">
      <img :src="backgroundImage" alt="Musical instruments background" class="h-full w-full object-cover opacity-40" @error="handleBackgroundError" />
      <div class="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-950/60 to-black/80"></div>
    </div>

    <div class="relative mx-auto flex max-w-screen-xl flex-col items-center gap-12 px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
      <div class="flex max-w-3xl flex-col items-center gap-6">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-purple-200 backdrop-blur">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 9l10.5-3m-6.5 13.5V8m6.5-2.5L18 21m-8.25-12l-1.5 9.75A2.25 2.25 0 006.26 20h-.01a2.25 2.25 0 01-2.23-1.95l-1.26-8.2A2.25 2.25 0 004.99 7.5z" />
          </svg>
          Your Complete Music Solution
        </span>

        <h1 class="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Feel the Beat.
          <span class="block bg-gradient-to-r from-purple-400 via-sky-300 to-pink-300 bg-clip-text text-transparent">
            Live the Moment.
          </span>
        </h1>

        <p class="max-w-xl text-balance text-base text-slate-200 sm:text-lg">
          Buy, sell, and rent musical instruments. Book lessons with expert tutors. Get professional repair services — all in one marketplace.
        </p>

        <div class="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-300 px-6 py-3 text-base font-semibold text-slate-900 shadow-md shadow-purple-500/30 transition hover:scale-[1.02] hover:shadow-purple-500/50"
            type="button"
            @click="handleGetStarted"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M10 3H5a2 2 0 00-2 2v2a2 2 0 002 2h5m4-6h5a2 2 0 012 2v2a2 2 0 01-2 2h-5m-4 0h4m-4 0H5m9 0l1.5 9.5A2 2 0 0113.52 21h-3.04a2 2 0 01-1.98-1.5L9 11" />
            </svg>
            Start Shopping
          </button>

          <button
            class="inline-flex items-center justify-center gap-2 rounded-full border border-purple-400/60 px-6 py-3 text-base font-semibold text-purple-200 transition hover:border-purple-300 hover:bg-purple-900/40"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 5v14l11-7z" />
            </svg>
            Watch Demo
          </button>
        </div>
      </div>

      <form class="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl sm:p-6" role="search" @submit.prevent="handleSearch">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(2,minmax(0,1fr))_auto] lg:items-end">
          <label class="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/30 px-3 py-3 text-left shadow-inner">
            <svg class="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-5.2-5.2M10.8 17a6.2 6.2 0 110-12.4 6.2 6.2 0 010 12.4z" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search instruments, tutors, or services..."
              name="keyword"
              autocomplete="off"
              aria-label="Search by keyword"
              class="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
          </label>

          <label class="flex flex-col gap-2 rounded-2xl border border-white/15 bg-black/30 p-3 text-left">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-300">Category</span>
            <select
              id="hero-category"
              v-model="selectedCategory"
              name="category"
              aria-label="Filter by category"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-100 focus:border-cyan-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="guitars">Guitars</option>
              <option value="pianos">Pianos</option>
              <option value="drums">Drums</option>
            </select>
          </label>

          <label class="flex flex-col gap-2 rounded-2xl border border-white/15 bg-black/30 p-3 text-left">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-300">Price Range</span>
            <select
              id="hero-price"
              v-model="priceRange"
              name="price"
              aria-label="Filter by price range"
              class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-100 focus:border-cyan-300 focus:outline-none"
            >
              <option v-for="range in priceRanges" :key="range.value" :value="range.value">{{ range.label }}</option>
            </select>
          </label>

          <button
            class="flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-300/30 transition hover:scale-[1.02] hover:shadow-cyan-300/50"
            type="submit"
          >
            Search
          </button>
        </div>
      </form>

      <dl class="grid w-full max-w-3xl gap-4 text-center sm:grid-cols-3">
        <div class="rounded-2xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur">
          <dt class="text-3xl font-semibold">5000+</dt>
          <dd class="text-sm text-slate-300">Instruments</dd>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur">
          <dt class="text-3xl font-semibold">200+</dt>
          <dd class="text-sm text-slate-300">Expert Tutors</dd>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur">
          <dt class="text-3xl font-semibold">15k+</dt>
          <dd class="text-sm text-slate-300">Happy Customers</dd>
        </div>
      </dl>
    </div>

    <div class="absolute inset-x-0 bottom-0" aria-hidden="true">
      <svg class="h-16 w-full fill-white/95" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,60 C300,100 600,20 900,60 C1050,80 1150,80 1200,60 L1200,120 L0,120 Z" />
      </svg>
    </div>
  </section>
</template>
