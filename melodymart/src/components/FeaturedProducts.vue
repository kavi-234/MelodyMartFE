<script setup lang="ts">
interface Product {
  id: number
  name: string
  category: string
  price: number
  image: string
  rating: number
}

const products: Product[] = [
  {
    id: 1,
    name: 'Vintage Vinyl',
    category: 'Vinyl Record',
    price: 45.99,
    image: '🎵',
    rating: 4.8
  },
  {
    id: 2,
    name: 'Classic 76',
    category: 'Keyboard',
    price: 299.99,
    image: '🎹',
    rating: 4.9
  },
  {
    id: 3,
    name: 'Golden Acoustics',
    category: 'Acoustic Guitar',
    price: 149.99,
    image: '🎸',
    rating: 4.7
  },
  {
    id: 4,
    name: 'Beat Master',
    category: 'Headphones',
    price: 89.99,
    image: '🎧',
    rating: 4.6
  }
]
</script>

<template>
  <section id="products" class="featured-products">
    <div class="products-container">
      <div class="section-header">
        <h2 class="section-title">Featured Instruments</h2>
        <p class="section-subtitle">Explore our most popular and best-selling music instruments</p>
      </div>

      <div class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image">{{ product.image }}</div>
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-category">{{ product.category }}</p>

          <div class="product-rating">
            <span class="stars">⭐ {{ product.rating }}</span>
          </div>

          <div class="product-footer">
            <span class="product-price">${{ product.price }}</span>
            <button class="btn-buy">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-products {
  padding: 5rem 2rem;
  background-color: #f8f9fa;
}

.products-container {
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f3e8ff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  padding: 1rem 1rem 0.5rem 1rem;
  margin: 0;
}

.product-category {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0 1rem;
  margin: 0;
}

.product-rating {
  padding: 0.75rem 1rem;
}

.stars {
  font-size: 0.9rem;
  color: #6b7280;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-top: auto;
  border-top: 1px solid #e5e7eb;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
}

.btn-buy {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.btn-buy:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

@media (max-width: 768px) {
  .featured-products {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .product-image {
    height: 120px;
    font-size: 2.5rem;
  }
}
</style>
