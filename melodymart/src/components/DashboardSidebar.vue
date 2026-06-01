<template>
  <nav class="sticky top-24 rounded-lg bg-slate-900/60 p-4">
    <ul class="space-y-2">
      <li>
        <RouterLink to="/dashboard/customer" class="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" active-class="bg-slate-800 font-semibold">Overview</RouterLink>
      </li>
      <li>
        <RouterLink to="/dashboard/customer/home" class="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Home</RouterLink>
      </li>
      <li>
        <RouterLink to="/dashboard/customer/cart" class="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">My Cart</RouterLink>
      </li>
      <li>
        <RouterLink to="/dashboard/customer/orders" class="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Orders</RouterLink>
      </li>
      <li>
        <RouterLink to="/dashboard/customer/lessons" class="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Lessons</RouterLink>
      </li>
      <li>
        <RouterLink to="/dashboard/customer/services" class="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Requested Services</RouterLink>
      </li>
      <li>
        <RouterLink to="/settings" class="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Settings</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
nav {
  min-height: 6rem;
}
</style>
