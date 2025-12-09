<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-4">Sell Your Instruments</h1>
    <p class="text-muted mb-8">List your instruments and connect with buyers in our marketplace</p>

    <div class="bg-secondary rounded-lg p-8 max-w-2xl">
      <h2 class="text-2xl font-bold mb-6">Create a New Listing</h2>

      <form class="space-y-6">
        <div>
          <label class="block font-semibold mb-2">Instrument Type</label>
          <select class="w-full px-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary">
            <option>Select an instrument</option>
            <option>Guitar</option>
            <option>Keyboard</option>
            <option>Drums</option>
            <option>Violin</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-2">Instrument Name</label>
          <input type="text" placeholder="e.g., Fender Stratocaster" class="w-full px-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label class="block font-semibold mb-2">Brand</label>
          <input type="text" placeholder="Brand name" class="w-full px-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label class="block font-semibold mb-2">Condition</label>
          <select class="w-full px-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary">
            <option>Like New</option>
            <option>Good</option>
            <option>Fair</option>
            <option>For Parts</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-2">Price</label>
          <input type="number" placeholder="0.00" class="w-full px-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label class="block font-semibold mb-2">Description</label>
          <textarea placeholder="Describe your instrument..." rows="4" class="w-full px-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"></textarea>
        </div>

        <button type="submit" class="w-full bg-primary text-secondary py-3 rounded font-bold hover:opacity-90 transition">
          Create Listing
        </button>
      </form>
    </div>
  </div>
</template>
