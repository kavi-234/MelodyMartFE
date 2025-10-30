<script setup lang="ts">
interface Benefit {
  id: number
  title: string
  description: string
}

const benefits: Benefit[] = [
  {
    id: 1,
    title: 'Easy Listings',
    description: 'Create and manage your instrument listings effortlessly'
  },
  {
    id: 2,
    title: 'Seller Tools',
    description: 'Access powerful tools to manage your sales effectively'
  },
  {
    id: 3,
    title: 'Payment Safety',
    description: 'Secure payment processing with buyer protection'
  }
]
</script>

<template>
  <section id="benefits" class="benefits">
    <div class="benefits-container">
      <div class="section-header">
        <h2 class="section-title">Managing Everything on One Place</h2>
        <p class="section-subtitle">Streamline your music instrument business with comprehensive tools</p>
      </div>

      <div class="benefits-list">
        <div v-for="benefit in benefits" :key="benefit.id" class="benefit-item">
          <div class="benefit-check">✓</div>
          <div class="benefit-content">
            <h3 class="benefit-title">{{ benefit.title }}</h3>
            <p class="benefit-description">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.benefits {
  padding: 5rem 2rem;
  background-color: white;
}

.benefits-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.benefits-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.benefit-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.benefit-item:hover {
  background-color: #f3f4f6;
  transform: translateX(4px);
}

.benefit-check {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.benefit-content {
  flex: 1;
}

.benefit-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.benefit-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .benefits {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .benefits-list {
    grid-template-columns: 1fr;
  }
}
</style>
