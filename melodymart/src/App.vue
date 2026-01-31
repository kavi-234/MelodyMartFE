<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <Header />
    <main class="w-full">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style>
/* Global styles are loaded from main.css */
</style>
*** End Patch
