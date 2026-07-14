<script setup lang="ts">
// Footer — Melody Mart brand system
</script>

<template>
  <footer class="relative border-t border-mm-line/50 overflow-hidden" style="background: var(--mm-ink);">

    <!-- Ambient glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute bottom-0 left-1/4 w-80 h-80 rounded-full opacity-30"
           style="background: radial-gradient(circle, rgba(212,168,83,0.06), transparent); filter: blur(60px);" />
      <div class="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20"
           style="background: radial-gradient(circle, rgba(56,168,130,0.05), transparent); filter: blur(60px);" />
    </div>

    <!-- Top waveform decoration -->
    <div class="absolute top-0 inset-x-0 h-px" style="background: linear-gradient(90deg, transparent, rgba(212,168,83,0.2) 30%, rgba(212,168,83,0.2) 70%, transparent);" />

    <div class="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-10">

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

        <!-- Brand -->
        <div class="lg:col-span-1 space-y-5">
          <div class="flex items-center gap-3">
            <div class="relative w-9 h-9 flex-shrink-0">
              <div class="absolute inset-0 rounded-full bg-gradient-to-br from-mm-gold via-mm-copper to-mm-gold-dk" />
              <div class="absolute inset-0 rounded-full flex items-center justify-center">
                <div class="w-4 h-4 rounded-full border border-mm-ink/40 flex items-center justify-center">
                  <div class="w-1.5 h-1.5 rounded-full bg-mm-ink/50" />
                </div>
              </div>
            </div>
            <span class="font-serif text-lg text-mm-ivory">Melody Mart</span>
          </div>
          <p class="text-sm text-mm-sand leading-relaxed max-w-xs">
            The music marketplace where players discover instruments, book lessons, and connect with specialists.
          </p>
          <!-- Social links -->
          <div class="flex gap-2">
            <a v-for="social in socials" :key="social.name" href="#"
               class="social-icon" :title="social.name">
              <span v-html="social.icon" />
            </a>
          </div>
        </div>

        <!-- Marketplace -->
        <div>
          <h4 class="footer-heading">Marketplace</h4>
          <ul class="space-y-2.5">
            <li v-for="link in marketplaceLinks" :key="link"><a href="#" class="footer-link">{{ link }}</a></li>
          </ul>
        </div>

        <!-- Services -->
        <div>
          <h4 class="footer-heading">Services</h4>
          <ul class="space-y-2.5">
            <li v-for="link in serviceLinks" :key="link"><a href="#" class="footer-link">{{ link }}</a></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="footer-heading">Stay in Tune</h4>
          <p class="text-sm text-mm-sand mb-4 leading-relaxed">Exclusive deals and music news, monthly.</p>
          <form class="space-y-2.5" @submit.prevent>
            <input
              type="email"
              placeholder="your@email.com"
              class="w-full text-sm"
              style="background: var(--mm-carbon); border-color: var(--mm-warm-line);"
            />
            <button type="submit" class="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <!-- Divider with music note -->
      <div class="music-divider mb-8" />

      <!-- Bottom bar -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-5 text-xs text-mm-stone">
        <p>© 2026 Melody Mart. Crafted for musicians everywhere.</p>
        <div class="flex gap-6">
          <a href="#" class="hover:text-mm-gold transition-colors">Privacy</a>
          <a href="#" class="hover:text-mm-gold transition-colors">Terms</a>
          <a href="#" class="hover:text-mm-gold transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
const marketplaceLinks = ['Shop Instruments', 'Rent Gear', 'Sell Your Instrument', 'Pre-owned Gear', 'Gift Cards']
const serviceLinks     = ['Book Lessons', 'Repair Center', 'Custom Shop', 'Warranty & Support', 'Pro Services']
const socials = [
  { name: 'Facebook',  icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>` },
  { name: 'Instagram', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>` },
  { name: 'Twitter',   icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>` },
  { name: 'YouTube',   icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>` },
]
</script>

<style scoped>
.footer-heading {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mm-ivory);
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 1.1rem;
}
.footer-link {
  display: block;
  font-size: 0.875rem;
  color: var(--mm-sand);
  text-decoration: none;
  transition: color 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.footer-link:hover { color: var(--mm-gold-lt); }

.social-icon {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 0.5rem;
  background: var(--mm-carbon);
  border: 1px solid var(--mm-warm-line);
  color: var(--mm-sand);
  text-decoration: none;
  transition: all 0.2s ease;
}
.social-icon:hover {
  border-color: rgba(212,168,83,0.25);
  color: var(--mm-gold-lt);
  background: rgba(212,168,83,0.06);
}
</style>
