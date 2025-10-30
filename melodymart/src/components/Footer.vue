<script setup lang="ts">
interface FooterLink {
  title: string
  links: Array<{ name: string; href: string }>
}

const footerLinks: FooterLink[] = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Security', href: '#security' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' }
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'FAQ', href: '#faq' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '#privacy' },
      { name: 'Terms', href: '#terms' },
      { name: 'Cookies', href: '#cookies' }
    ]
  }
]

const socialLinks = [
  { icon: 'f', name: 'Facebook', href: '#' },
  { icon: 'tw', name: 'Twitter', href: '#' },
  { icon: 'in', name: 'Instagram', href: '#' },
  { icon: 'li', name: 'LinkedIn', href: '#' }
]
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-container">
        <!-- Brand Section -->
        <div class="footer-section brand-section">
          <div class="footer-logo">
            <span class="logo-icon">🎵</span>
            <span class="logo-text">MelodyMart</span>
          </div>
          <p class="footer-description">
            Your ultimate platform for buying, selling, and discovering musical instruments.
          </p>
          <div class="social-links">
            <a v-for="link in socialLinks" :key="link.name" :href="link.href" class="social-link" :title="link.name">
              {{ link.icon }}
            </a>
          </div>
        </div>

        <!-- Links Sections -->
        <div v-for="section in footerLinks" :key="section.title" class="footer-section">
          <h4 class="footer-title">{{ section.title }}</h4>
          <ul class="footer-list">
            <li v-for="link in section.links" :key="link.name">
              <a :href="link.href" class="footer-link">{{ link.name }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="footer-bottom">
        <p class="copyright">
          &copy; 2025 MelodyMart. All rights reserved.
        </p>
        <div class="footer-bottom-links">
          <a href="#privacy" class="bottom-link">Privacy Policy</a>
          <span class="divider">•</span>
          <a href="#terms" class="bottom-link">Terms of Service</a>
          <span class="divider">•</span>
          <a href="#cookies" class="bottom-link">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #e5e7eb;
  padding: 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-container {
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.brand-section {
  gap: 1.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
}

.logo-icon {
  font-size: 1.5rem;
}

.footer-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #9ca3af;
  margin: 0;
}

.social-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.social-link {
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
  font-weight: 600;
}

.social-link:hover {
  background-color: #6366f1;
  transform: translateY(-3px);
}

.footer-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #6366f1;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.bottom-link {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s;
}

.bottom-link:hover {
  color: #6366f1;
}

.divider {
  color: #4b5563;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    padding: 2rem 1rem;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
    justify-content: center;
  }

  .footer-bottom-links {
    justify-content: center;
  }
}
</style>
