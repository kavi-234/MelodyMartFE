<template>
  <div :class="{ 'dark': isDark }" class="min-h-screen">
    <div class="min-h-screen flex flex-col bg-bg-primary dark:bg-bg-dark text-coffee-dark dark:text-coffee-cream transition-colors duration-300">
      <Navbar :is-dark="isDark" @toggle-theme="toggleTheme" />
      <main class="flex-1">
        <RouterView />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

