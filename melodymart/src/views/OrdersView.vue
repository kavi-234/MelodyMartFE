<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Orders</h1>
        <p class="page-subtitle">Track your instrument purchases and payment history.</p>
      </div>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading orders...</p></div>
    <div v-else-if="error" class="state-box"><p class="err">{{ error }}</p></div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      </div>
      <h3>No orders yet</h3>
      <p>Your purchase history will appear here after checkout.</p>
      <RouterLink to="/shop" class="shop-link-btn">Browse Shop</RouterLink>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order._id" class="order-card" :class="{ 'order-card-open': expandedOrders.has(order._id) }">
        <!-- Header -->
        <div class="order-head">
          <div>
            <div class="order-id-label">Order ID</div>
            <div class="order-id">{{ order.orderId }}</div>
          </div>
          <div class="head-right">
            <span class="order-badge" :class="orderBadge(order.status)">{{ order.status }}</span>
            <div class="order-date">{{ formatDate(order.createdAt) }}</div>
          </div>
        </div>

        <!-- Summary row -->
        <div class="order-body">
          <div class="order-meta-item">
            <span class="meta-label">Items</span>
            <span class="meta-val">{{ order.itemCount }}</span>
          </div>
          <div class="order-meta-item">
            <span class="meta-label">Currency</span>
            <span class="meta-val">{{ order.currency }}</span>
          </div>
          <div class="order-meta-item">
            <span class="meta-label">Amount</span>
            <span class="meta-val amount">{{ order.currency }} {{ Number(order.amount).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Expanded item details -->
        <div v-if="expandedOrders.has(order._id)" class="order-items-section">
          <div v-if="loadingDetails.has(order._id)" class="items-loading">
            <div class="items-spinner" />
            <span>Loading items...</span>
          </div>
          <template v-else>
            <div v-if="!orderDetails[order._id]?.items?.length" class="items-empty">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              No item details available for this order.
            </div>
            <div v-else class="items-list">
              <div class="items-list-hdr">
                <span>Item</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Subtotal</span>
              </div>
              <div v-for="(item, i) in orderDetails[order._id].items" :key="i" class="item-row">
                <div class="item-info">
                  <div class="item-img-wrap">
                    <img
                      v-if="getItemId(item)"
                      :src="`http://localhost:5000/api/instruments/${getItemId(item)}/image`"
                      :alt="getItemName(item)"
                      class="item-img"
                      @error="(e) => { (e.target as HTMLImageElement).style.display='none' }"
                    />
                    <div v-else class="item-img-placeholder">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                  </div>
                  <div class="item-text">
                    <p class="item-name">{{ getItemName(item) }}</p>
                  </div>
                </div>
                <span class="item-qty">× {{ item.quantity }}</span>
                <span class="item-unit-price">{{ order.currency }} {{ Number(item.price || item.unitPrice || 0).toFixed(2) }}</span>
                <span class="item-subtotal">{{ order.currency }} {{ (Number(item.price || item.unitPrice || 0) * item.quantity).toFixed(2) }}</span>
              </div>
              <div class="items-total-row">
                <span class="items-total-lbl">Order Total</span>
                <span class="items-total-val">{{ order.currency }} {{ Number(order.amount).toFixed(2) }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Toggle button -->
        <button class="order-toggle" @click="toggleOrder(order)">
          <span>{{ expandedOrders.has(order._id) ? 'Hide Details' : 'View Item Details' }}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            :style="{ transform: expandedOrders.has(order._id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
          ><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const orders = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const expandedOrders = ref<Set<string>>(new Set())
const loadingDetails = ref<Set<string>>(new Set())
const orderDetails = reactive<Record<string, any>>({})

const fetchOrders = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not authenticated')
    const res = await fetch('http://localhost:5000/api/payments/orders', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Failed to fetch orders') }
    orders.value = (await res.json()).orders || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const fetchOrderDetails = async (orderId: string, dbId: string) => {
  if (orderDetails[dbId]) return
  loadingDetails.value.add(dbId)
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/payments/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      orderDetails[dbId] = data.order || data
    }
  } catch { /* silently fail — items-empty shown */ }
  finally { loadingDetails.value.delete(dbId) }
}

const toggleOrder = (order: any) => {
  if (expandedOrders.value.has(order._id)) {
    expandedOrders.value.delete(order._id)
  } else {
    expandedOrders.value.add(order._id)
    fetchOrderDetails(order.orderId, order._id)
  }
  // trigger reactivity
  expandedOrders.value = new Set(expandedOrders.value)
}

const getItemId = (item: any): string | null => {
  if (typeof item.instrument === 'string') return item.instrument
  if (item.instrument?._id) return String(item.instrument._id)
  return null
}
const getItemName = (item: any): string => item.name || 'Instrument'

const formatDate = (d: string) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
const orderBadge = (s: string) => ({ 'badge-emerald': s === 'PAID', 'badge-coral': s === 'FAILED', 'badge-gold': !['PAID','FAILED'].includes(s) })
onMounted(() => void fetchOrders())
</script>

<style scoped>
.page { max-width: 900px; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-teal); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.err { color: var(--mm-coral); }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.25rem; gap: 0.875rem; text-align: center; }
.empty-icon-wrap { width: 72px; height: 72px; border-radius: 50%; background: rgba(42,157,159,0.1); color: var(--mm-teal); display: flex; align-items: center; justify-content: center; }
.empty-state h3 { font-size: 1.25rem; font-weight: 700; color: var(--mm-ivory); margin: 0; }
.empty-state p { font-size: 0.875rem; color: var(--mm-sand); margin: 0; }
.shop-link-btn { display: inline-flex; align-items: center; padding: 0.625rem 1.5rem; background: linear-gradient(135deg, var(--mm-teal), #1F8080); color: var(--mm-ink); border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; text-decoration: none; transition: all 0.2s; }
.shop-link-btn:hover { transform: translateY(-1px); }

.orders-list { display: flex; flex-direction: column; gap: 0.875rem; }
.order-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; overflow: hidden; transition: border-color 0.2s; }
.order-card:hover, .order-card-open { border-color: rgba(42,157,159,0.35); }

.order-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.125rem 1.25rem; background: rgba(42,157,159,0.04); border-bottom: 1px solid var(--mm-warm-line); gap: 1rem; }
.order-id-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem; }
.order-id { font-family: 'Courier New', monospace; font-size: 0.9375rem; font-weight: 700; color: var(--mm-teal); letter-spacing: 0.02em; }
.head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.375rem; }
.order-date { font-size: 0.75rem; color: var(--mm-stone); }

.order-body { display: flex; gap: 0; padding: 0; }
.order-meta-item { flex: 1; display: flex; flex-direction: column; padding: 0.875rem 1.25rem; border-right: 1px solid var(--mm-warm-line); }
.order-meta-item:last-child { border-right: none; }
.meta-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem; }
.meta-val { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); }
.meta-val.amount { color: var(--mm-gold); font-size: 1.125rem; }

.order-badge { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.badge-emerald { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.badge-gold    { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.badge-coral   { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

/* Item details section */
.order-items-section { border-top: 1px solid var(--mm-warm-line); padding: 1rem 1.25rem; background: rgba(9,8,12,0.25); }
.items-loading { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem 0; color: var(--mm-stone); font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
.items-spinner { width: 18px; height: 18px; border: 2px solid var(--mm-warm-line); border-top-color: var(--mm-teal); border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
.items-empty { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 0; color: var(--mm-stone); font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
.items-list { display: flex; flex-direction: column; gap: 0; }
.items-list-hdr { display: grid; grid-template-columns: 1fr 60px 110px 110px; gap: 0.5rem; padding: 0 0 0.5rem; border-bottom: 1px solid var(--mm-warm-line); margin-bottom: 0.5rem; }
.items-list-hdr span { font-size: 0.625rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'DM Sans', sans-serif; }
.items-list-hdr span:not(:first-child) { text-align: right; }
.item-row { display: grid; grid-template-columns: 1fr 60px 110px 110px; gap: 0.5rem; align-items: center; padding: 0.625rem 0; border-bottom: 1px solid rgba(58,52,71,0.5); }
.item-row:last-of-type { border-bottom: none; }
.item-info { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
.item-img-wrap { width: 40px; height: 40px; border-radius: 0.375rem; overflow: hidden; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.item-img { width: 100%; height: 100%; object-fit: cover; }
.item-img-placeholder { color: var(--mm-stone); }
.item-text { min-width: 0; }
.item-name { font-size: 0.875rem; font-weight: 700; color: var(--mm-ivory); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'DM Sans', sans-serif; }
.item-qty { font-size: 0.875rem; font-weight: 700; color: var(--mm-cream); text-align: right; font-family: 'DM Sans', sans-serif; }
.item-unit-price { font-size: 0.8125rem; color: var(--mm-sand); text-align: right; font-family: 'DM Sans', sans-serif; }
.item-subtotal { font-size: 0.875rem; font-weight: 700; color: var(--mm-gold); text-align: right; font-family: 'DM Serif Display', serif; }
.items-total-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0 0; border-top: 1px solid var(--mm-warm-line); margin-top: 0.25rem; }
.items-total-lbl { font-size: 0.75rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'DM Sans', sans-serif; }
.items-total-val { font-family: 'DM Serif Display', serif; font-size: 1.125rem; font-weight: 400; color: var(--mm-gold); }

/* Toggle button */
.order-toggle { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: transparent; border: none; border-top: 1px solid var(--mm-warm-line); color: var(--mm-stone); font-size: 0.8125rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.order-toggle:hover { background: rgba(42,157,159,0.05); color: var(--mm-teal); }

@media (max-width: 600px) {
  .order-body { flex-direction: column; }
  .order-meta-item { border-right: none; border-bottom: 1px solid var(--mm-warm-line); }
  .order-meta-item:last-child { border-bottom: none; }
  .items-list-hdr, .item-row { grid-template-columns: 1fr 40px 90px 90px; }
}
</style>
