<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface CartItem {
  _id: string
  instrument: { _id: string; name: string; brand: string; price: number; stock: number }
  quantity: number
}

const cartItems = ref<CartItem[]>([])
const cartTotal = ref(0)
const loading = ref(false)
const error = ref('')
const checkoutLoading = ref(false)

const fetchCart = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not authenticated')
    const res = await fetch('http://localhost:5000/api/cart', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to fetch cart')
    const data = await res.json()
    cartItems.value = data.items || []; cartTotal.value = data.total || 0
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const updateQuantity = async (instrumentId: string, newQuantity: number) => {
  if (newQuantity < 1) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/cart/update', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ instrumentId, quantity: newQuantity }) })
    if (!res.ok) throw new Error('Failed to update quantity')
    await fetchCart()
  } catch (e: any) { error.value = e.message }
}

const removeItem = async (instrumentId: string) => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/cart/remove/${instrumentId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to remove item')
    await fetchCart()
  } catch (e: any) { error.value = e.message }
}

const clearCart = async () => {
  if (!confirm('Clear your entire cart?')) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/cart/clear', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to clear cart')
    await fetchCart()
  } catch (e: any) { error.value = e.message }
}

const getImageUrl = (instrumentId: string) => `http://localhost:5000/api/instruments/${instrumentId}/image`

const proceedToCheckout = async () => {
  checkoutLoading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Please login before checking out')
    const res = await fetch('http://localhost:5000/api/payments/payhere/initiate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to initialize checkout')
    const form = document.createElement('form')
    form.method = 'POST'; form.action = data.actionUrl; form.target = '_self'
    Object.entries(data.payload).forEach(([key, value]) => {
      const input = document.createElement('input'); input.type = 'hidden'; input.name = key; input.value = String(value); form.appendChild(input)
    })
    document.body.appendChild(form); form.submit(); document.body.removeChild(form)
  } catch (e: any) { error.value = e.message || 'Failed to proceed to checkout' }
  finally { checkoutLoading.value = false }
}

onMounted(fetchCart)
</script>

<template>
  <div class="cart-wrap">
    <div class="cart-header">
      <h2 class="cart-title">My Cart</h2>
      <button v-if="cartItems.length > 0" @click="clearCart" class="clear-btn">Clear Cart</button>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading cart...</p></div>

    <div v-else-if="error" class="alert-err">{{ error }}</div>

    <div v-else-if="cartItems.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      </div>
      <h3>Your cart is empty</h3>
      <p>Browse the shop and add instruments to your cart.</p>
      <a href="/shop" class="shop-link">Browse Shop</a>
    </div>

    <div v-else>
      <div class="items-list">
        <div v-for="item in cartItems" :key="item._id" class="cart-item">
          <img :src="getImageUrl(item.instrument._id)" :alt="item.instrument.name" class="item-img" @error="(e) => { (e.target as HTMLImageElement).style.display='none' }" />
          <div class="item-info">
            <div class="item-name">{{ item.instrument.name }}</div>
            <div class="item-brand">{{ item.instrument.brand }}</div>
            <div class="item-price">Rs {{ item.instrument.price.toFixed(2) }}</div>
            <div class="item-stock">{{ item.instrument.stock }} in stock</div>
          </div>
          <div class="item-actions">
            <button @click="removeItem(item.instrument._id)" class="remove-btn" title="Remove">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="qty-ctrl">
              <button @click="updateQuantity(item.instrument._id, item.quantity - 1)" :disabled="item.quantity <= 1" class="qty-btn">−</button>
              <span class="qty-val">{{ item.quantity }}</span>
              <button @click="updateQuantity(item.instrument._id, item.quantity + 1)" :disabled="item.quantity >= item.instrument.stock" class="qty-btn">+</button>
            </div>
            <div class="item-subtotal">Rs {{ (item.instrument.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <div class="checkout-box">
        <div class="total-row">
          <span class="total-label">Total</span>
          <span class="total-amount">Rs {{ cartTotal.toFixed(2) }}</span>
        </div>
        <button @click="proceedToCheckout" :disabled="checkoutLoading" class="checkout-btn">
          <svg v-if="!checkoutLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          {{ checkoutLoading ? 'Redirecting to PayHere...' : 'Proceed to Checkout' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-wrap { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.5rem; }
.cart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.cart-title { font-family: 'DM Serif Display', serif; font-size: 1.375rem; font-weight: 400; color: var(--mm-ivory); margin: 0; }
.clear-btn { background: none; border: 1px solid rgba(224,112,96,0.25); border-radius: 0.375rem; color: var(--mm-coral); font-size: 0.8125rem; font-weight: 600; padding: 0.375rem 0.75rem; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.clear-btn:hover { background: rgba(224,112,96,0.08); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 36px; height: 36px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-teal); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.alert-err { background: rgba(224,112,96,0.08); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.5rem; padding: 0.875rem; color: var(--mm-coral); font-size: 0.875rem; margin-bottom: 1rem; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 3.5rem 1.25rem; gap: 0.75rem; text-align: center; }
.empty-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(42,157,159,0.1); color: var(--mm-teal); display: flex; align-items: center; justify-content: center; }
.empty-state h3 { font-size: 1.125rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.empty-state p { font-size: 0.875rem; color: var(--mm-sand); margin: 0; }
.shop-link { color: var(--mm-teal); font-weight: 600; text-decoration: none; font-size: 0.875rem; margin-top: 0.25rem; }
.shop-link:hover { text-decoration: underline; }

.items-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
.cart-item { display: flex; gap: 1rem; padding: 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.75rem; align-items: center; }
.item-img { width: 80px; height: 80px; border-radius: 0.5rem; object-fit: cover; flex-shrink: 0; background: var(--mm-carbon); }
.item-info { flex: 1; min-width: 0; }
.item-name { font-weight: 700; color: var(--mm-ivory); font-size: 0.9375rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-brand { font-size: 0.8125rem; color: var(--mm-stone); margin-top: 2px; }
.item-price { font-weight: 700; color: var(--mm-gold); font-size: 0.9375rem; margin-top: 0.375rem; }
.item-stock { font-size: 0.75rem; color: var(--mm-stone); margin-top: 2px; }
.item-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0; }
.remove-btn { background: rgba(224,112,96,0.1); border: 1px solid rgba(224,112,96,0.2); border-radius: 0.375rem; color: var(--mm-coral); cursor: pointer; padding: 0.3125rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.remove-btn:hover { background: rgba(224,112,96,0.2); }
.qty-ctrl { display: flex; align-items: center; gap: 0.375rem; }
.qty-btn { width: 28px; height: 28px; background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.375rem; color: var(--mm-ivory); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.qty-btn:hover:not(:disabled) { border-color: var(--mm-teal); color: var(--mm-teal); }
.qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.qty-val { width: 36px; text-align: center; font-weight: 700; color: var(--mm-ivory); font-size: 0.9375rem; }
.item-subtotal { font-weight: 700; color: var(--mm-ivory); font-size: 0.875rem; }

.checkout-box { background: rgba(42,157,159,0.04); border: 1px solid rgba(42,157,159,0.15); border-radius: 0.75rem; padding: 1.125rem 1.25rem; }
.total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.total-label { font-size: 1rem; font-weight: 600; color: var(--mm-sand); }
.total-amount { font-family: 'DM Serif Display', serif; font-size: 1.75rem; font-weight: 400; color: var(--mm-gold); }
.checkout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border: none; border-radius: 0.625rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 12px rgba(42,157,159,0.25); }
.checkout-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(42,157,159,0.35); }
.checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

@media (max-width: 480px) { .cart-item { flex-wrap: wrap; } .item-img { width: 64px; height: 64px; } .item-actions { flex-direction: row; width: 100%; justify-content: space-between; align-items: center; } }
</style>
