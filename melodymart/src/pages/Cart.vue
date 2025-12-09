<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="bg-secondary rounded-lg">
          <div v-if="cartItems.length === 0" class="p-8 text-center">
            <p class="text-muted text-lg mb-4">Your cart is empty</p>
            <router-link to="/shop" class="text-primary hover:underline font-semibold">Continue shopping</router-link>
          </div>
          
          <div v-else class="divide-y divide-border">
            <div v-for="item in cartItems" :key="item.id" class="p-4 flex gap-4">
              <div class="text-4xl">{{ item.icon }}</div>
              <div class="flex-1">
                <h3 class="font-bold">{{ item.name }}</h3>
                <p class="text-muted text-sm">{{ item.brand }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-primary">${{ item.price }}</p>
                <button class="text-red-400 hover:text-red-300 text-sm mt-2">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-secondary rounded-lg p-6 h-fit sticky top-20">
        <h2 class="text-xl font-bold mb-6">Order Summary</h2>
        
        <div class="space-y-3 mb-6 pb-6 border-b border-border">
          <div class="flex justify-between">
            <span class="text-muted">Subtotal</span>
            <span>${{ subtotal }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Shipping</span>
            <span>${{ shipping }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Tax</span>
            <span>${{ tax }}</span>
          </div>
        </div>

        <div class="flex justify-between text-lg font-bold mb-6">
          <span>Total</span>
          <span class="text-primary">${{ total }}</span>
        </div>

        <button class="w-full bg-primary text-secondary py-3 rounded font-bold hover:opacity-90 transition mb-3">
          Checkout
        </button>
        <router-link to="/shop" class="block text-center text-primary hover:underline">Continue Shopping</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const cartItems = ref([
  { id: 1, name: 'Fender Stratocaster', brand: 'Fender', price: 899, icon: '🎸' },
  { id: 2, name: 'Yamaha Digital Piano', brand: 'Yamaha', price: 1299, icon: '🎹' },
  { id: 3, name: 'Microphone Stand', brand: 'Generic', price: 45, icon: '🎤' },
])

const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.price, 0))
const shipping = computed(() => subtotal.value > 1000 ? 0 : 15)
const tax = computed(() => Math.round(subtotal.value * 0.08 * 100) / 100)
const total = computed(() => subtotal.value + shipping.value + tax.value)
</script>
