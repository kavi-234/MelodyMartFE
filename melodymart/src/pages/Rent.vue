<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-4">Rent Instruments</h1>
    <p class="text-muted mb-8">Try before you buy - Rent quality instruments at affordable rates</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="item in rentalItems"
        :key="item.id"
        class="bg-secondary rounded-lg overflow-hidden hover:border-primary border border-border transition"
      >
        <div class="h-40 bg-muted flex items-center justify-center">
          <span class="text-5xl">{{ item.icon }}</span>
        </div>
        <div class="p-4">
          <h3 class="font-bold mb-1">{{ item.name }}</h3>
          <p class="text-muted text-sm mb-3">{{ item.brand }}</p>
          
          <div class="mb-4 space-y-1">
            <p class="text-sm"><span class="text-primary font-semibold">${{ item.dailyPrice }}</span>/day</p>
            <p class="text-sm text-muted">{{ item.minimumDays }} day minimum</p>
          </div>

          <div class="flex gap-2 mb-3">
            <span class="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded">Beginner</span>
            <span class="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded">Portable</span>
          </div>

          <button class="w-full bg-primary text-secondary py-2 rounded hover:opacity-90 transition font-semibold">
            Rent Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const rentalItems = ref([
  { id: 1, name: 'Acoustic Guitar', brand: 'Yamaha', dailyPrice: 15, minimumDays: 7, icon: '🎸' },
  { id: 2, name: 'Keyboard', brand: 'Korg', dailyPrice: 25, minimumDays: 7, icon: '🎹' },
  { id: 3, name: 'Drum Set', brand: 'Pearl', dailyPrice: 40, minimumDays: 14, icon: '🥁' },
  { id: 4, name: 'Violin', brand: 'Eastman', dailyPrice: 20, minimumDays: 7, icon: '🎻' },
])
</script>
