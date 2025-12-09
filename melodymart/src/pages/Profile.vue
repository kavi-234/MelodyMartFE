<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-8">My Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Profile Info -->
      <div class="lg:col-span-2 bg-secondary rounded-lg p-8">
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Account Information</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-muted text-sm mb-1">Full Name</label>
              <p class="font-semibold">John Doe</p>
            </div>
            <div>
              <label class="block text-muted text-sm mb-1">Email</label>
              <p class="font-semibold">john@example.com</p>
            </div>
            <div>
              <label class="block text-muted text-sm mb-1">Phone</label>
              <p class="font-semibold">(555) 123-4567</p>
            </div>
            <button class="text-primary hover:underline">Edit Profile</button>
          </div>
        </div>

        <hr class="border-border mb-8" />

        <!-- Orders -->
        <div>
          <h2 class="text-2xl font-bold mb-4">Recent Orders</h2>
          <div class="space-y-3">
            <div class="p-3 bg-background rounded border border-border">
              <div class="flex justify-between mb-2">
                <span class="font-semibold">Order #12345</span>
                <span class="text-green-400">Delivered</span>
              </div>
              <p class="text-muted text-sm">Fender Stratocaster - $899</p>
            </div>
            <div class="p-3 bg-background rounded border border-border">
              <div class="flex justify-between mb-2">
                <span class="font-semibold">Order #12344</span>
                <span class="text-blue-400">Processing</span>
              </div>
              <p class="text-muted text-sm">Yamaha Digital Piano - $1,299</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Loyalty Program -->
        <div class="bg-secondary rounded-lg p-6">
          <h3 class="font-bold mb-4">Loyalty Points</h3>
          <div class="mb-4">
            <p class="text-3xl font-bold text-primary">1,245</p>
            <p class="text-muted text-sm">Points earned</p>
          </div>
          <button class="w-full bg-primary text-secondary py-2 rounded hover:opacity-90 transition font-semibold">
            Redeem Points
          </button>
        </div>

        <!-- Quick Links -->
        <div class="bg-secondary rounded-lg p-6">
          <h3 class="font-bold mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-primary hover:underline">Wishlist</a></li>
            <li><a href="#" class="text-primary hover:underline">Saved Items</a></li>
            <li><a href="#" class="text-primary hover:underline">My Listings</a></li>
            <li><a href="#" class="text-primary hover:underline">Settings</a></li>
            <li><a href="#" class="text-primary hover:underline">Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
