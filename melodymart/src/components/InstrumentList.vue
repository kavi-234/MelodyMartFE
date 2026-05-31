<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

interface Instrument {
  _id: string
  name: string
  category: string
  brand: string
  price: number
  stock: number
  description: string
  imageUrl?: string
}

const instruments = ref<Instrument[]>([])
const loading = ref(true)
const deleting = ref<string | null>(null)

const fetchInstruments = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/instruments')
    const data = await response.json()
    instruments.value = data.instruments || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const deleteInstrument = async (id: string) => {
  if (!confirm('Delete this instrument?')) return
  
  deleting.value = id
  try {
    const response = await fetch(`http://localhost:5000/api/instruments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })

    if (response.ok) {
      instruments.value = instruments.value.filter(i => i._id !== id)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    deleting.value = null
  }
}

onMounted(fetchInstruments)
</script>

<template>
  <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Instruments</h2>
      <button @click="fetchInstruments" 
        class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">
        Refresh
      </button>
    </div>

    <div v-if="loading" class="py-12 text-center text-slate-400">Loading...</div>

    <div v-else-if="instruments.length === 0" class="py-12 text-center text-slate-400">
      No instruments found
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="item in instruments" :key="item._id" 
        class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        
        <img v-if="item.image" :src="`http://localhost:5000/api/instruments/${item._id}/image`" 
          :alt="item.name" class="mb-3 h-40 w-full rounded object-cover" />
        
        <div class="mb-2 flex items-start justify-between">
          <h3 class="font-semibold text-white">{{ item.name }}</h3>
          <span class="rounded bg-purple-600 px-2 py-1 text-xs text-white">{{ item.category }}</span>
        </div>

        <p class="mb-1 text-sm text-slate-400">{{ item.brand }}</p>
        <p class="mb-2 text-sm text-slate-500">{{ item.description }}</p>
        
        <div class="mb-3 flex justify-between text-sm">
          <span class="text-green-400 font-semibold">Rs {{ item.price }}</span>
          <span class="text-slate-400">Stock: {{ item.stock }}</span>
        </div>

        <button @click="deleteInstrument(item._id)" :disabled="deleting === item._id"
          class="w-full rounded-lg bg-red-600/20 py-2 text-sm font-medium text-red-400 hover:bg-red-600/30 disabled:opacity-50">
          {{ deleting === item._id ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>
