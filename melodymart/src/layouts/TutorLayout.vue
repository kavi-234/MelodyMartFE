<template>
  <div class="layout-root">
    <Header />
    <TutorSidebar :collapsed="isCollapsed" @compress="isCollapsed = true" @expand="isCollapsed = false" />
    <div class="content-wrap" :class="isCollapsed ? 'md-collapsed' : 'md-expanded'">
      <main class="main-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue'
import TutorSidebar from '../components/TutorSidebar.vue'

const isCollapsed = ref(false)
</script>

<style scoped>
:root {
  --p-900: #28104E;
  --p-700: #6237A0;
  --p-500: #9754CB;
  --p-300: #DEACF5;
  --p-50: #FBF7FF;
  --text-dark: #1b1030;
}

.layout-root {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--p-50) 0%, rgba(222,172,245,0.08) 40%, #f8f5fb 100%);
  color: var(--text-dark);
}

.content-wrap {
  margin-left: 0;
  transition: margin-left 0.2s ease;
}

.main-area {
  padding: 24px 16px;
  min-height: calc(100vh - 64px);
}

@media (min-width: 768px) {
  .content-wrap.md-expanded { margin-left: 250px; }
  .content-wrap.md-collapsed { margin-left: 72px; }
  .main-area { padding: 32px; }
}
</style>
