<script setup lang="ts">
import { Music, Mail, Phone, Facebook, Instagram, Twitter, Youtube, Send } from 'lucide-vue-next'
</script>

<template>
  <footer class="bg-slate-950 text-slate-300 pt-20 pb-10">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
        <!-- Brand & About -->
        <div class="space-y-6">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Music class="w-6 h-6 text-white" />
            </div>
            <span class="text-2xl font-bold text-white tracking-tight">Melody Mart</span>
          </div>
          <p class="text-slate-400 leading-relaxed max-w-sm">
            The world's premier marketplace for musicians. Whether you're a beginner or a pro, we provide the tools, teachers, and support to fuel your passion.
          </p>
          <div class="flex gap-4">
            <a href="#" class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all">
              <Facebook class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all">
              <Instagram class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all">
              <Twitter class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all">
              <Youtube class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-bold text-white mb-6 uppercase tracking-wider text-sm">Marketplace</h4>
          <ul class="space-y-4">
            <li><a href="#" class="hover:text-purple-400 transition-colors">Shop All Instruments</a></li>
            <li><a href="#" class="hover:text-purple-400 transition-colors">Rentals & Leasing</a></li>
            <li><a href="#" class="hover:text-purple-400 transition-colors">Sell Your Gear</a></li>
            <li><a href="#" class="hover:text-purple-400 transition-colors">Certified Pre-owned</a></li>
            <li><a href="#" class="hover:text-purple-400 transition-colors">Musical Collectibles</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="text-lg font-bold text-white mb-6 uppercase tracking-wider text-sm">Services</h4>
          <ul class="space-y-4">
            <li><a href="#" class="hover:text-purple-400 transition-colors">Book a Lesson</a></li>
            <li><a href="#" class="hover:text-purple-400 transition-colors">Repair Center</a></li>
            <li><a href="#" class="hover:text-purple-400 transition-colors">Custom Shop</a></li>
            <li><a href="#" class="hover:text-purple-400 transition-colors">Gift Cards</a></li>
            <li><a href="#" class="hover:text-purple-400 transition-colors">Warranty & Protection</a></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="text-lg font-bold text-white mb-6 uppercase tracking-wider text-sm">Stay Updated</h4>
          <p class="text-slate-400 mb-6 text-sm">Join 10,000+ musicians and get exclusive deals delivered to your inbox.</p>
          <form class="space-y-3" @submit.prevent>
            <div class="relative">
              <input 
                type="email" 
                placeholder="Email address" 
                class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              />
              <button class="absolute right-2 top-1.5 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                <Send class="w-4 h-4" />
              </button>
            </div>
            <div class="flex items-center gap-4 py-4">
              <div class="flex items-center gap-2">
                <Phone class="w-5 h-5 text-purple-600" />
                <span class="text-sm font-semibold text-white">(555) 123-4567</span>
              </div>
              <div class="flex items-center gap-2">
                <Mail class="w-5 h-5 text-purple-600" />
                <span class="text-sm font-semibold text-white">hello@melodymart.com</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
        <p>&copy; 2026 Melody Mart. All Rights Reserved. Crafted with ❤️ for musicians.</p>
        <div class="flex gap-8">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" class="hover:text-white transition-colors">Cookie Settings</a>
        </div>
      </div>
    </div>
  </footer>
</template>

