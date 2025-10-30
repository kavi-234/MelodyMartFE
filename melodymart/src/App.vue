<script setup lang="ts">
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import Features from './components/Features.vue'
import Services from './components/Services.vue'
import FeaturedProducts from './components/FeaturedProducts.vue'
import Testimonials from './components/Testimonials.vue'
import CTA from './components/CTA.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app">
    <Header />
    <Hero />
    <Features />
    <Services />
    <FeaturedProducts />
    <Testimonials />
    <CTA />
    <Footer />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
}
</style>
