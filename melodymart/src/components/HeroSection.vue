<script setup lang="ts">
// No props needed — self-contained hero
</script>

<template>
  <section class="relative overflow-hidden" style="background: var(--mm-graphite);">

    <!-- Ambient background layers -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <!-- Soft radial glows -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
           style="background: radial-gradient(ellipse, rgba(212,168,83,0.18) 0%, transparent 70%); filter: blur(60px);" />
      <div class="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-15"
           style="background: radial-gradient(ellipse, rgba(56,168,130,0.15) 0%, transparent 70%); filter: blur(80px);" />
      <!-- Staff lines — subtle horizontal musical staff -->
      <div class="absolute inset-0 opacity-30" style="
        background-image: repeating-linear-gradient(180deg,
          transparent, transparent 60px,
          rgba(212,168,83,0.04) 60px, rgba(212,168,83,0.04) 61px
        );
      "/>
      <!-- Vinyl circle decoration -->
      <div class="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full opacity-10" style="
        border: 1px solid rgba(212,168,83,0.3);
        box-shadow: inset 0 0 120px rgba(212,168,83,0.06), 0 0 120px rgba(212,168,83,0.04);
      "/>
      <div class="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full opacity-8" style="border: 1px solid rgba(192,123,80,0.2);"/>
      <div class="absolute right-[2%] top-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full opacity-12" style="border: 1px solid rgba(212,168,83,0.15);"/>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
      <div class="max-w-3xl">

        <!-- Category label -->
        <div class="inline-flex items-center gap-2 mb-7">
          <div class="waveform-bars">
            <span /><span /><span /><span /><span />
          </div>
          <span class="text-xs font-semibold tracking-[0.2em] uppercase text-mm-gold font-sans">The Music Marketplace</span>
        </div>

        <!-- Headline -->
        <h1 class="text-[clamp(2.6rem,6vw,5rem)] font-serif text-mm-ivory leading-[1.05] mb-6">
          Where musicians<br />
          <em class="not-italic text-gradient">find everything</em><br />
          they need.
        </h1>

        <!-- Sub-headline -->
        <p class="text-lg text-mm-cream leading-relaxed max-w-xl mb-10">
          Instruments, lessons, repairs, rentals — curated for players at every level.
          One platform, every musical need.
        </p>

        <!-- CTA buttons -->
        <div class="flex flex-wrap gap-4 items-center mb-16">
          <a href="#shop" class="btn-primary px-7 py-3.5 text-sm font-bold flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Browse Instruments
          </a>
          <a href="#lessons" class="btn-outline px-7 py-3.5 text-sm font-bold flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            Book a Lesson
          </a>
        </div>

        <!-- Trust stats -->
        <div class="grid grid-cols-3 gap-6 max-w-lg">
          <div v-for="stat in stats" :key="stat.label" class="flex flex-col">
            <div class="text-2xl font-serif text-mm-gold-lt font-normal">{{ stat.value }}</div>
            <div class="text-xs text-mm-sand mt-1 font-sans">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Service cards row -->
    <div class="relative z-10 border-t border-mm-line/40 bg-mm-carbon/40 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-5 lg:px-8 py-5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            v-for="card in serviceCards"
            :key="card.label"
            :href="card.href"
            class="service-card group"
          >
            <div class="service-icon" :style="{ background: card.bg }">
              <span v-html="card.icon" />
            </div>
            <div>
              <div class="text-sm font-semibold text-mm-ivory group-hover:text-mm-gold-lt transition-colors">{{ card.label }}</div>
              <div class="text-xs text-mm-sand mt-0.5">{{ card.desc }}</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
const stats = [
  { value: '2,400+', label: 'Instruments' },
  { value: '180+',   label: 'Expert Tutors' },
  { value: '98%',    label: 'Satisfaction' },
]

const serviceCards = [
  {
    label: 'Buy Instruments',
    desc:  'New & second-hand gear',
    href:  '#shop',
    bg:    'rgba(212,168,83,0.12)',
    icon:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A853" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  },
  {
    label: 'Rent Gear',
    desc:  'Flexible short-term rental',
    href:  '#rentals',
    bg:    'rgba(42,157,159,0.12)',
    icon:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A9D9F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
  },
  {
    label: 'Take Lessons',
    desc:  'Learn from pros',
    href:  '#lessons',
    bg:    'rgba(56,168,130,0.12)',
    icon:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38A882" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  },
  {
    label: 'Repair Services',
    desc:  'Certified specialists',
    href:  '#repairs',
    bg:    'rgba(192,123,80,0.12)',
    icon:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C07B50" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  },
]
</script>

<style scoped>
.service-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  border-radius: 0.875rem;
  border: 1px solid var(--mm-warm-line);
  background: var(--mm-carbon);
  transition: all 0.25s ease;
  cursor: pointer;
  text-decoration: none;
}
.service-card:hover {
  border-color: rgba(212,168,83,0.2);
  background: var(--mm-onyx);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}
.service-icon {
  width: 40px; height: 40px;
  border-radius: 0.65rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
</style>
