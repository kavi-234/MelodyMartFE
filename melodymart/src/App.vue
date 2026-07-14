<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const isDashboard = computed(() => route.path.startsWith('/dashboard'))
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <Header v-if="!isDashboard" />
    <main class="w-full">
      <RouterView />
    </main>
    <Footer v-if="!isDashboard" />
  </div>
</template>

<style>
/* Global styles are loaded from main.css */
</style>
*** End Patch
