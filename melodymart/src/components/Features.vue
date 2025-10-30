<script setup lang="ts">
interface Feature {
  id: number
  icon: string
  title: string
  description: string
  color: string
}

const features: Feature[] = [
  {
    id: 1,
    icon: '📱',
    title: 'Easy to Use',
    description: 'Browse and purchase musical instruments with an intuitive, user-friendly interface.',
    color: '#4f46e5'
  },
  {
    id: 2,
    icon: '🔐',
    title: 'Safe & Secure',
    description: 'Your transactions and personal data are protected with industry-leading security standards.',
    color: '#8b5cf6'
  },
  {
    id: 3,
    icon: '🌟',
    title: 'Verified Sellers',
    description: 'Trade confidently with verified sellers and musicians in our trusted community.',
    color: '#f59e0b'
  },
  {
    id: 4,
    icon: '⚡',
    title: 'Fast Delivery',
    description: 'Get your instruments quickly with our efficient delivery and shipping services.',
    color: '#10b981'
  }
]
</script>

<template>
  <section id="features" class="features">
    <div class="features-container">
      <div class="section-header">
        <h2 class="section-title">Complete Music Solutions</h2>
        <p class="section-subtitle">Everything you need to buy, sell, and manage musical instruments</p>
      </div>

      <div class="features-grid">
        <div v-for="feature in features" :key="feature.id" class="feature-card">
          <div class="feature-icon" :style="{ backgroundColor: feature.color }">
            {{ feature.icon }}
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 5rem 2rem;
  background-color: #f8f9fa;
}

.features-container {
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

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.feature-description {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .features {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
