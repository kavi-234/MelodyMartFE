<template>
	<div class="min-h-screen bg-slate-950">
		<Header />

		<CustomerSidebar :collapsed="isCollapsed" @compress="isCollapsed = true" @expand="isCollapsed = false" />

		<div :class="['ml-0 max-w-full', isCollapsed ? 'md:ml-[72px]' : 'md:ml-[250px]']">
			<main class="px-4 sm:px-6 lg:px-8 py-8">
				<router-view />
			</main>
		</div>

		<Footer v-if="showFooter" />
	</div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import CustomerSidebar from '../components/CustomerSidebar.vue'
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'

const route = useRoute()
// Hide footer on dashboard/sidebar pages (keep it on home and other public pages)
const showFooter = computed(() => !String(route.path || '').startsWith('/dashboard'))

const isCollapsed = ref(false)
</script>

<style scoped>

:root{
	--p-900: #28104E; /* deep purple */
	--p-700: #6237A0; /* mid purple */
	--p-500: #9754CB; /* vibrant */
	--p-300: #DEACF5; /* light */
	--p-50:  #FBF7FF; /* near-white */
	--card-bg: rgba(255,255,255,0.9);
	--text-dark: #1b1030;
}

.min-h-screen{
	background: linear-gradient(180deg, var(--p-50) 0%, rgba(222,172,245,0.08) 40%, #f8f5fb 100%);
	color: var(--text-dark);
}

main { 
	min-height: calc(100vh - 96px);
}

/* Card styles for content to match urplemix palette */
.content-card {
	background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,241,252,0.95));
	border: 1px solid rgba(151,84,203,0.12);
	box-shadow: 0 8px 30px rgba(151,84,203,0.06);
	border-radius: 12px;
	padding: 16px;
	color: var(--text-dark);
}

</style>
