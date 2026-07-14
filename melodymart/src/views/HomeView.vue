<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import FeaturedInstruments from '../components/FeaturedInstruments.vue'
import ServicesLearning from '../components/ServicesLearning.vue'
import RepairSpecialists from '../components/RepairSpecialists.vue'
</script>

<template>
  <div class="w-full">
    <HeroSection />
    <FeaturedInstruments />
    <ServicesLearning />
    <RepairSpecialists />

    <section class="cta-section">
      <div class="cta-glow" aria-hidden="true" />
      <div class="cta-inner">
        <h2 class="cta-title">Ready to Start Your Music Journey?</h2>
        <p class="cta-sub">Join thousands of musicians who trust MelodyMart</p>
        <div class="cta-btns">
          <RouterLink to="/shop" class="cta-btn cta-gold">Start Shopping</RouterLink>
          <RouterLink to="/lessons" class="cta-btn cta-teal">Book a Lesson</RouterLink>
          <RouterLink to="/repairs" class="cta-btn cta-copper">Request Repair</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cta-section {
  position: relative; overflow: hidden;
  padding: 5rem 1.5rem;
  background: linear-gradient(135deg, var(--mm-onyx) 0%, var(--mm-graphite) 100%);
  border-top: 1px solid var(--mm-warm-line);
}
.cta-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 700px; height: 350px;
  background: radial-gradient(ellipse, rgba(212,168,83,0.07) 0%, transparent 65%);
  pointer-events: none; filter: blur(50px);
}
.cta-inner { position: relative; z-index: 1; max-width: 56rem; margin: 0 auto; text-align: center; }
.cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.75rem, 4vw, 2.5rem); color: var(--mm-ivory); margin: 0 0 1rem; letter-spacing: -0.02em; line-height: 1.15; }
.cta-sub { font-size: 1.0625rem; color: var(--mm-sand); margin: 0 0 2.5rem; font-family: 'DM Sans', sans-serif; }
.cta-btns { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
.cta-btn { padding: 0.875rem 2rem; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 700; text-decoration: none; display: inline-block; transition: all 0.2s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
.cta-gold   { background: linear-gradient(135deg, var(--mm-gold), var(--mm-copper)); color: var(--mm-ink); box-shadow: 0 4px 16px rgba(212,168,83,0.25); }
.cta-gold:hover   { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,168,83,0.35); }
.cta-teal   { background: transparent; border: 2px solid var(--mm-teal); color: var(--mm-teal); }
.cta-teal:hover   { background: rgba(42,157,159,0.1); transform: translateY(-2px); }
.cta-copper { background: transparent; border: 2px solid var(--mm-copper); color: var(--mm-copper); }
.cta-copper:hover { background: rgba(192,123,80,0.1); transform: translateY(-2px); }
@media (max-width: 560px) { .cta-btns { flex-direction: column; align-items: center; } .cta-btn { min-width: 200px; text-align: center; } }
</style>
