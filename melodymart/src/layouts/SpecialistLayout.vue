<template>
  <div class="layout-root">
    <Header />
    <SpecialistSidebar :collapsed="isCollapsed" @compress="isCollapsed = true" @expand="isCollapsed = false" />
    <div class="layout-body" :class="isCollapsed ? 'md-collapsed' : 'md-expanded'">
      <main class="layout-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue'
import SpecialistSidebar from '../components/SpecialistSidebar.vue'

const isCollapsed = ref(false)
</script>

<style scoped>
.layout-root {
  min-height: 100vh;
  background: var(--mm-graphite);
  color: var(--mm-ivory);
}
.layout-body { transition: margin-left 0.22s ease; }
.layout-main { min-height: calc(100vh - 57px); padding: 1.75rem 2rem; }
@media (min-width: 768px) {
  .md-expanded  { margin-left: 250px; }
  .md-collapsed { margin-left: 72px; }
}
</style>
