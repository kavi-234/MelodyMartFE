<script setup lang="ts">
interface CTABenefit {
  id: number
  title: string
  icon: string
  description: string
}

const benefits: CTABenefit[] = [
  {
    id: 1,
    title: 'Wide Selection',
    icon: '📦',
    description: 'Access thousands of instruments from trusted sellers'
  },
  {
    id: 2,
    title: 'Competitive Pricing',
    icon: '💰',
    description: 'Best prices with transparent pricing and no hidden fees'
  },
  {
    id: 3,
    title: 'Expert Support',
    icon: '🤝',
    description: 'Get help from our knowledgeable team 24/7'
  }
]
</script>

<template>
  <section class="cta">
    <div class="cta-container">
      <h2 class="cta-title">Why Choose Our Customers</h2>
      <p class="cta-subtitle">Experience the best music instrument marketplace</p>

      <div class="benefits-grid">
        <div v-for="benefit in benefits" :key="benefit.id" class="benefit-box">
          <div class="benefit-icon">{{ benefit.icon }}</div>
          <h3 class="benefit-title">{{ benefit.title }}</h3>
          <p class="benefit-description">{{ benefit.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.cta-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin: 0 0 1rem 0;
}

.cta-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  text-align: center;
  margin: 0 0 3rem 0;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.benefit-box {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  border: 2px solid #e5e7eb;
  transition: all 0.3s;
}

.benefit-box:hover {
  border-color: #6366f1;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.1);
  transform: translateY(-4px);
}

.benefit-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.benefit-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.benefit-description {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .cta {
    padding: 3rem 1rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
