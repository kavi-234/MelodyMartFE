<script setup lang="ts">
const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'guitars', label: 'Guitars' },
  { value: 'keyboards', label: 'Keyboards' },
  { value: 'percussion', label: 'Percussion' },
  { value: 'strings', label: 'Strings' },
]

const priceOptions = [
  { value: 'any', label: 'All Prices' },
  { value: '0-500', label: 'Under $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000+', label: '$1,000+' },
]

const stats = [
  { value: '5000+', label: 'Instruments' },
  { value: '200+', label: 'Expert Tutors' },
  { value: '15k+', label: 'Happy Customers' },
]
</script>

<template>
  <section class="hero">
    <div class="hero-container">
      <div class="hero-intro">
        <span class="hero-tag">
          <span class="hero-tag-icon" aria-hidden="true">🎵</span>
          Your Complete Music Solution
        </span>
        <h1 class="hero-title">Feel the Beat. Live the Moment.</h1>
        <p class="hero-subtitle">
          Buy, sell, and rent musical instruments. Book lessons with expert tutors. Get professional repair services.
        </p>
        <div class="hero-actions">
          <button class="hero-action hero-action-primary" type="button">Browse Instruments</button>
          <button class="hero-action hero-action-secondary" type="button">Learn More</button>
        </div>
      </div>

      <form class="hero-search" role="search" @submit.prevent>
        <div class="hero-search-grid">
          <input
            id="hero-keyword"
            class="hero-input"
            type="search"
            placeholder="Search instruments, tutors, or services..."
            name="keyword"
            autocomplete="off"
            aria-label="Search by keyword"
          />

          <select id="hero-category" class="hero-select" name="category" aria-label="Filter by category">
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select id="hero-price" class="hero-select" name="price" aria-label="Filter by price range">
            <option v-for="option in priceOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <button class="hero-submit" type="submit">Search</button>
        </div>
      </form>

      <div class="hero-stats">
        <div v-for="item in stats" :key="item.label" class="hero-stat">
          <span class="hero-stat-value">{{ item.value }}</span>
          <span class="hero-stat-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.92), rgba(147, 51, 234, 0.9));
  color: #fff;
  padding: 4.5rem 1.5rem 3.5rem;
}

.hero-container {
  margin: 0 auto;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  text-align: center;
}

.hero-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 0.9rem;
  font-weight: 600;
}

.hero-tag-icon {
  font-size: 1.1rem;
}

.hero-title {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 700;
  line-height: 1.15;
  margin: 0;
}

.hero-subtitle {
  margin: 0;
  max-width: 680px;
  font-size: 1.125rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.88);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem;
  margin-top: 0.5rem;
}

.hero-action {
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.85rem 2.25rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.hero-action-primary {
  background: #22d3ee;
  color: #0f172a;
  box-shadow: 0 10px 30px rgba(34, 211, 238, 0.2);
}

.hero-action-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(34, 211, 238, 0.28);
}

.hero-action-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.7);
}

.hero-action-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.hero-search {
  width: 100%;
}

.hero-search-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1fr) repeat(2, minmax(0, 170px)) auto;
  padding: 1.1rem;
  background: rgba(15, 23, 42, 0.35);
  border-radius: 1rem;
  backdrop-filter: blur(8px);
  align-items: stretch;
}

.hero-input,
.hero-select {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(15, 23, 42, 0.45);
  color: #fff;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.hero-input::placeholder {
  color: rgba(255, 255, 255, 0.65);
}

.hero-input:focus,
.hero-select:focus {
  outline: none;
  border-color: rgba(34, 211, 238, 0.8);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.25);
}

.hero-select {
  appearance: none;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white"><path d="M4 6l4 4 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>');
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 14px;
  padding-right: 2.5rem;
}

.hero-submit {
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #22d3ee, #8b5cf6);
  color: #0f172a;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.95rem 2.2rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.hero-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.25);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  width: 100%;
  gap: 1rem;
}

.hero-stat {
  background: rgba(15, 23, 42, 0.35);
  border-radius: 1rem;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  backdrop-filter: blur(6px);
}

.hero-stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.hero-stat-label {
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.75);
}

@media (max-width: 960px) {
  .hero-search-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .hero-submit {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .hero-container {
    gap: 2rem;
  }

  .hero-intro {
    gap: 0.85rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-search-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    gap: 0.75rem;
  }
}
</style>
