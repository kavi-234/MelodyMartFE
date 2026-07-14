<template>
  <div class="layout-root">
    <Header />
    <CustomerSidebar :collapsed="isCollapsed" @compress="isCollapsed = true" @expand="isCollapsed = false" />
    <div class="layout-body" :class="isCollapsed ? 'sidebar-collapsed' : 'sidebar-full'">
      <main class="layout-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import CustomerSidebar from '../components/CustomerSidebar.vue'
import { ref } from 'vue'

const isCollapsed = ref(false)
</script>

<style scoped>
.layout-root {
  min-height: 100vh;
  background: var(--mm-graphite);
  color: var(--mm-ivory);
}
.layout-body {
  transition: margin-left 0.22s ease;
}
.layout-main {
  min-height: calc(100vh - 57px);
  padding: 1.75rem 2rem;
}
@media (min-width: 768px) {
  .sidebar-full     { margin-left: 250px; }
  .sidebar-collapsed { margin-left: 72px; }
}
</style>
