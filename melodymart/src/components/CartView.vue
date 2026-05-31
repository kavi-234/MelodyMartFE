<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface CartItem {
  _id: string
  instrument: {
    _id: string
    name: string
    brand: string
    price: number
    stock: number
  }
  quantity: number
}

const cartItems = ref<CartItem[]>([])
const cartTotal = ref(0)
const loading = ref(false)
const error = ref('')

const fetchCart = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('http://localhost:5000/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch cart')
    }

    const data = await response.json()
    cartItems.value = data.items || []
    cartTotal.value = data.total || 0
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (instrumentId: string, newQuantity: number) => {
  if (newQuantity < 1) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/cart/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ instrumentId, quantity: newQuantity })
    })

    if (!response.ok) {
      throw new Error('Failed to update quantity')
    }

    await fetchCart()
  } catch (err: any) {
    error.value = err.message
  }
}

const removeItem = async (instrumentId: string) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/cart/remove/${instrumentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to remove item')
    }

    await fetchCart()
  } catch (err: any) {
    error.value = err.message
  }
}

const clearCart = async () => {
  if (!confirm('Are you sure you want to clear your cart?')) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/cart/clear', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to clear cart')
    }

    await fetchCart()
  } catch (err: any) {
    error.value = err.message
  }
}

const getImageUrl = (instrumentId: string) => {
  return `http://localhost:5000/api/instruments/${instrumentId}/image`
}

onMounted(() => {
  fetchCart()
})
</script>

<template>
  <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">🛒 My Cart</h2>
      <button
        v-if="cartItems.length > 0"
        @click="clearCart"
        class="text-sm text-red-400 hover:text-red-300"
      >
        Clear Cart
      </button>
    </div>

    <div v-if="loading" class="text-center text-slate-400">
      Loading cart...
    </div>

    <div v-else-if="error" class="rounded-lg bg-red-900/20 border border-red-800 p-4 text-red-400">
      {{ error }}
    </div>

    <div v-else-if="cartItems.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🛒</div>
      <p class="text-slate-400 mb-4">Your cart is empty</p>
      <a href="/" class="text-purple-400 hover:text-purple-300">Continue Shopping</a>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in cartItems"
        :key="item._id"
        class="flex gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4"
      >
        <img
          :src="getImageUrl(item.instrument._id)"
          :alt="item.instrument.name"
          class="h-24 w-24 rounded-lg object-cover"
        />
        
        <div class="flex-1">
          <h3 class="font-semibold text-white">{{ item.instrument.name }}</h3>
          <p class="text-sm text-slate-400">{{ item.instrument.brand }}</p>
          <p class="mt-2 text-lg font-bold text-purple-400">
            Rs {{ item.instrument.price.toFixed(2) }}
          </p>
          <p class="text-xs text-slate-500">
            Stock: {{ item.instrument.stock }} available
          </p>
        </div>

        <div class="flex flex-col items-end justify-between">
          <button
            @click="removeItem(item.instrument._id)"
            class="text-red-400 hover:text-red-300"
            title="Remove item"
          >
            ✕
          </button>

          <div class="flex items-center gap-2">
            <button
              @click="updateQuantity(item.instrument._id, item.quantity - 1)"
              :disabled="item.quantity <= 1"
              class="h-8 w-8 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              −
            </button>
            <span class="w-12 text-center text-white">{{ item.quantity }}</span>
            <button
              @click="updateQuantity(item.instrument._id, item.quantity + 1)"
              :disabled="item.quantity >= item.instrument.stock"
              class="h-8 w-8 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              +
            </button>
          </div>

          <p class="mt-2 font-semibold text-white">
            Rs {{ (item.instrument.price * item.quantity).toFixed(2) }}
          </p>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-purple-800 bg-purple-900/20 p-4">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold text-white">Total:</span>
          <span class="text-2xl font-bold text-purple-400">
            Rs {{ cartTotal.toFixed(2) }}
          </span>
        </div>
        <button
          class="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white hover:from-purple-700 hover:to-indigo-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
</template>
