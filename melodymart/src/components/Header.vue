<script setup lang="ts">
import { ref } from 'vue'

const menuOpen = ref(false)
</script>

<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <span class="logo-icon">🎵</span>
        <span class="logo-text">MelodyMart</span>
      </div>

      <nav class="nav-menu">
        <a href="#features" class="nav-link">Features</a>
        <a href="#benefits" class="nav-link">Benefits</a>
        <a href="#products" class="nav-link">Products</a>
        <a href="#testimonials" class="nav-link">Testimonials</a>
      </nav>

      <div class="header-actions">
        <button class="btn btn-secondary">Sign In</button>
        <button class="btn btn-primary">Get Started</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 1.25rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.5rem;
  color: white;
}

.logo-icon {
  font-size: 1.75rem;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .header-actions {
    gap: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
