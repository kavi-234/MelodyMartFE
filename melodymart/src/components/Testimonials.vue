<script setup lang="ts">
interface Testimonial {
  id: number
  name: string
  role: string
  image: string
  feedback: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'John Anderson',
    role: 'Professional Musician',
    image: '👨‍🎤',
    feedback: 'MelodyMart made it incredibly easy to find quality instruments. Highly recommended!'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    role: 'Music Teacher',
    image: '👩‍🏫',
    feedback: 'The platform is intuitive and the sellers are responsive. Great experience overall!'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'Audio Engineer',
    image: '👨‍💼',
    feedback: 'Fantastic selection and competitive prices. Best place to buy music equipment!'
  }
]
</script>

<template>
  <section id="testimonials" class="testimonials">
    <div class="testimonials-container">
      <div class="section-header">
        <h2 class="section-title">Meet Our Expert Tutors</h2>
        <p class="section-subtitle">Trusted by music professionals and enthusiasts worldwide</p>
      </div>

      <div class="testimonials-grid">
        <div v-for="testimonial in testimonials" :key="testimonial.id" class="testimonial-card">
          <div class="testimonial-image">{{ testimonial.image }}</div>
          <h3 class="testimonial-name">{{ testimonial.name }}</h3>
          <p class="testimonial-role">{{ testimonial.role }}</p>
          <p class="testimonial-feedback">"{{ testimonial.feedback }}"</p>
          <button class="btn-connect">Connect</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials {
  padding: 5rem 2rem;
  background-color: white;
}

.testimonials-container {
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

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: #f9fafb;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
}

.testimonial-card:hover {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.1);
  transform: translateY(-4px);
}

.testimonial-image {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  margin: 0 auto 1rem;
}

.testimonial-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.testimonial-role {
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 500;
  margin: 0 0 1rem 0;
}

.testimonial-feedback {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  font-style: italic;
}

.btn-connect {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  width: 100%;
}

.btn-connect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

@media (max-width: 768px) {
  .testimonials {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}
</style>
