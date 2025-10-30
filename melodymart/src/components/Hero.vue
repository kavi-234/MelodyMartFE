<script setup lang="ts"></script>

<template>
  <section class="hero">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">Your Complete Music Journey Starts Here</h1>
        <p class="hero-subtitle">
          Buy, sell, and manage musical instruments easily. Connect with music lovers and professionals in one vibrant community.
        </p>
        <div class="hero-buttons">
          <button class="btn btn-primary">Browse Instruments</button>
          <button class="btn btn-secondary">Learn More</button>
        </div>
      </div>

      <div class="hero-image">
        <div class="image-placeholder">
          <span class="emoji">🎸</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 5rem 2rem;
  color: white;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.hero-subtitle {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.95;
  margin: 0;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.875rem 2rem;
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

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-placeholder {
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.emoji {
  font-size: 6rem;
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .image-placeholder {
    max-width: 250px;
  }

  .emoji {
    font-size: 4rem;
  }
}
</style>
