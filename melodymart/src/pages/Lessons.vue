<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-4">Book Music Lessons</h1>
    <p class="text-muted mb-8">Connect with professional music instructors for personalized lessons</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="instructor in instructors"
        :key="instructor.id"
        class="bg-secondary rounded-lg overflow-hidden hover:border-primary border border-border transition"
      >
        <div class="h-40 bg-muted flex items-center justify-center">
          <span class="text-6xl">{{ instructor.avatar }}</span>
        </div>
        <div class="p-4">
          <h3 class="font-bold mb-1">{{ instructor.name }}</h3>
          <p class="text-primary text-sm mb-2">{{ instructor.instrument }}</p>
          <p class="text-muted text-sm mb-3">{{ instructor.bio }}</p>
          
          <div class="flex justify-between items-center mb-4">
            <span class="text-primary font-bold">${{ instructor.hourlyRate }}/hr</span>
            <span class="text-yellow-400">★ {{ instructor.rating }}</span>
          </div>

          <div class="mb-4 space-y-1">
            <p class="text-xs text-muted">{{ instructor.experience }} years experience</p>
            <p class="text-xs text-muted">{{ instructor.students }} students</p>
          </div>

          <button class="w-full bg-primary text-secondary py-2 rounded hover:opacity-90 transition font-semibold">
            Book Lesson
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const instructors = ref([
  { id: 1, name: 'John Smith', instrument: 'Guitar', bio: 'Specialized in rock and blues guitar', avatar: '👨‍🏫', hourlyRate: 50, rating: 4.9, experience: 15, students: 45 },
  { id: 2, name: 'Sarah Johnson', instrument: 'Piano', bio: 'Classical and modern piano teacher', avatar: '👩‍🏫', hourlyRate: 60, rating: 4.8, experience: 12, students: 38 },
  { id: 3, name: 'Mike Davis', instrument: 'Drums', bio: 'Drums for beginners to advanced', avatar: '👨‍🏫', hourlyRate: 45, rating: 5.0, experience: 10, students: 52 },
])
</script>
