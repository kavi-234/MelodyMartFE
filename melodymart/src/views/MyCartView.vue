<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Cart</h1>
        <p class="page-subtitle">Review your items and proceed to checkout.</p>
      </div>
    </div>
    <CartView />
  </div>
</template>

<script setup lang="ts">
import CartView from '../components/CartView.vue'
</script>

<style scoped>
.page { max-width: 800px; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }
</style>
