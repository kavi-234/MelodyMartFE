<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const form = ref({
  name: '',
  category: '',
  brand: '',
  price: '',
  stock: '',
  description: ''
})

const image = ref<File | null>(null)
const loading = ref(false)
const message = ref('')

const categories = ['Guitar', 'Piano', 'Violin', 'Drums', 'Flute', 'Saxophone', 'Other']

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    image.value = target.files[0]
  }
}

const handleSubmit = async () => {
  loading.value = true
  message.value = ''

  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('category', form.value.category)
  formData.append('brand', form.value.brand)
  formData.append('price', form.value.price)
  formData.append('stock', form.value.stock)
  formData.append('description', form.value.description)
  if (image.value) formData.append('image', image.value)

  try {
    const response = await fetch('http://localhost:5000/api/instruments', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    })

    const data = await response.json()
    
    if (response.ok) {
      message.value = 'Instrument added successfully!'
      // Reset form
      form.value = { name: '', category: '', brand: '', price: '', stock: '', description: '' }
      image.value = null
    } else {
      message.value = data.message || 'Failed to add instrument'
    }
  } catch (error) {
    message.value = 'Error adding instrument'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
    <h2 class="mb-6 text-2xl font-bold text-white">Add New Instrument</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">Name</label>
          <input v-model="form.name" required type="text" 
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">Category</label>
          <select v-model="form.category" required 
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white">
            <option value="">Select category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">Brand</label>
          <input v-model="form.brand" required type="text" 
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">Price (Rs)</label>
          <input v-model="form.price" required type="number" step="0.01" 
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">Stock</label>
          <input v-model="form.stock" required type="number" 
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">Image</label>
          <input @change="handleImageChange" type="file" accept="image/*" 
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white file:mr-4 file:rounded file:border-0 file:bg-purple-600 file:px-4 file:py-1 file:text-white" />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-300">Description</label>
        <textarea v-model="form.description" required rows="3" 
          class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"></textarea>
      </div>

      <div v-if="message" :class="message.includes('success') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'" 
        class="rounded-lg p-3 text-sm">
        {{ message }}
      </div>

      <button type="submit" :disabled="loading" 
        class="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-500 disabled:opacity-50">
        {{ loading ? 'Adding...' : 'Add Instrument' }}
      </button>
    </form>
  </div>
</template>
