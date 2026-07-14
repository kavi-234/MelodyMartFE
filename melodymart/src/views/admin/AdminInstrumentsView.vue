<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Instrument Management</h1>
        <p class="page-subtitle">Add, edit, and manage instruments for rent and sale</p>
      </div>
      <button class="btn-primary" @click="showAddForm = !showAddForm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Instrument
      </button>
    </div>

    <!-- Add form -->
    <div v-if="showAddForm" class="add-form">
      <h2 class="form-title">Add New Instrument</h2>
      <div class="form-grid">
        <input v-model="newInstrument.name"           class="input" placeholder="Instrument name" />
        <input v-model="newInstrument.category"       class="input" placeholder="Category (e.g. Guitar, Piano)" />
        <input v-model="newInstrument.rentalPrice"    class="input" type="number" placeholder="Rental price / month" />
        <input v-model="newInstrument.salePrice"      class="input" type="number" placeholder="Sale price" />
        <input v-model="newInstrument.rentalQuantity" class="input" type="number" placeholder="Available for rental" />
        <input v-model="newInstrument.saleQuantity"   class="input" type="number" placeholder="Available for sale" />
      </div>
      <textarea v-model="newInstrument.description" class="input textarea" placeholder="Description..."></textarea>
      <div class="form-actions">
        <button class="btn-add" @click="addInstrument">Add Instrument</button>
        <button class="btn-cancel" @click="showAddForm = false">Cancel</button>
      </div>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading instruments...</p></div>
    <div v-else-if="error" class="state-box"><p class="err">{{ error }}</p><button @click="fetchInstruments" class="retry-btn">Retry</button></div>

    <div v-else>
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'all' }]" @click="activeTab = 'all'">All ({{ instruments.length }})</button>
        <button :class="['tab', { active: activeTab === 'rental' }]" @click="activeTab = 'rental'">For Rent ({{ rentalCount }})</button>
        <button :class="['tab', { active: activeTab === 'sale' }]" @click="activeTab = 'sale'">For Sale ({{ saleCount }})</button>
      </div>

      <div v-if="filteredInstruments.length === 0" class="empty-state">
        <p>No instruments found</p>
      </div>

      <div v-else class="instruments-grid">
        <div v-for="instrument in filteredInstruments" :key="instrument._id" class="instrument-card">
          <div class="icard-header">
            <div>
              <h3 class="instrument-name">{{ instrument.name }}</h3>
              <span class="category-badge">{{ instrument.category || 'Uncategorized' }}</span>
            </div>
            <div class="card-actions">
              <button class="icon-btn edit" @click="editInstrument(instrument._id)" title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="icon-btn delete" @click="deleteInstrument(instrument._id)" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </div>
          </div>

          <div class="icard-body">
            <p v-if="instrument.description" class="instrument-desc">{{ instrument.description }}</p>

            <div class="prices-grid">
              <div class="price-box gold">
                <div class="price-label">Rental / mo</div>
                <div class="price-value">Rs {{ instrument.rentalPrice?.toLocaleString() || '—' }}</div>
              </div>
              <div class="price-box teal">
                <div class="price-label">Sale Price</div>
                <div class="price-value">Rs {{ instrument.salePrice?.toLocaleString() || '—' }}</div>
              </div>
            </div>

            <div class="stock-grid">
              <div class="stock-item">
                <div class="stock-label">For Rental</div>
                <div class="stock-value">{{ instrument.rentalQuantity || 0 }} units</div>
              </div>
              <div class="stock-item">
                <div class="stock-label">For Sale</div>
                <div class="stock-value">{{ instrument.saleQuantity || 0 }} units</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const loading = ref(false)
const error = ref('')
const instruments = ref<any[]>([])
const showAddForm = ref(false)
const activeTab = ref('all')

const newInstrument = ref({ name: '', category: '', description: '', rentalPrice: '', salePrice: '', rentalQuantity: '', saleQuantity: '' })

const rentalCount = computed(() => instruments.value.filter(i => i.rentalQuantity > 0).length)
const saleCount   = computed(() => instruments.value.filter(i => i.saleQuantity > 0).length)
const filteredInstruments = computed(() => {
  if (activeTab.value === 'rental') return instruments.value.filter(i => i.rentalQuantity > 0)
  if (activeTab.value === 'sale')   return instruments.value.filter(i => i.saleQuantity > 0)
  return instruments.value
})

const fetchInstruments = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/instruments', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to load instruments')
    const data = await res.json()
    instruments.value = data.instruments || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const addInstrument = async () => {
  if (!newInstrument.value.name) { error.value = 'Please enter instrument name'; return }
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/instruments', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(newInstrument.value) })
    if (!res.ok) throw new Error('Failed to add instrument')
    showAddForm.value = false
    newInstrument.value = { name: '', category: '', description: '', rentalPrice: '', salePrice: '', rentalQuantity: '', saleQuantity: '' }
    fetchInstruments()
  } catch (e: any) { error.value = e.message }
}

const editInstrument   = (id: string) => alert(`Edit ${id} — feature coming soon`)
const deleteInstrument = async (id: string) => {
  if (!confirm('Delete this instrument?')) return
  try {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:5000/api/admin/instruments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchInstruments()
  } catch (e: any) { error.value = e.message }
}

onMounted(fetchInstruments)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.125rem; background: linear-gradient(135deg, var(--mm-coral), #C04A3A); color: #fff; border: none; border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 12px rgba(224,112,96,0.25); transition: all 0.2s; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(224,112,96,0.35); }

/* Add form */
.add-form { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; padding: 1.5rem; margin-bottom: 1.5rem; }
.form-title { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem; }
.input { padding: 0.625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.5rem; color: var(--mm-ivory); font-size: 0.875rem; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; width: 100%; }
.input::placeholder { color: var(--mm-stone); }
.input:focus { border-color: var(--mm-coral); box-shadow: 0 0 0 3px rgba(224,112,96,0.1); }
.textarea { min-height: 80px; resize: vertical; }
.form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.btn-add    { padding: 0.5625rem 1.125rem; background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); border-radius: 0.5rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.btn-add:hover { background: rgba(56,168,130,0.2); }
.btn-cancel { padding: 0.5625rem 1.125rem; background: rgba(224,112,96,0.1); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.25); border-radius: 0.5rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.btn-cancel:hover { background: rgba(224,112,96,0.2); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3.75rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-coral); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.err { color: var(--mm-coral); }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-coral), #C04A3A); color: #fff; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

/* Tabs */
.tabs { display: flex; gap: 0.25rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--mm-warm-line); }
.tab { background: none; border: none; color: var(--mm-stone); padding: 0.625rem 1rem; font-weight: 600; cursor: pointer; font-size: 0.875rem; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.tab:hover { color: var(--mm-sand); }
.tab.active { color: var(--mm-coral); border-bottom-color: var(--mm-coral); }

.empty-state { text-align: center; padding: 4rem 1.25rem; color: var(--mm-stone); font-size: 0.875rem; }

/* Grid */
.instruments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }

.instrument-card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; overflow: hidden; transition: all 0.25s; }
.instrument-card:hover { border-color: rgba(224,112,96,0.35); transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.35); }

.icard-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.125rem; border-bottom: 1px solid var(--mm-warm-line); background: rgba(224,112,96,0.03); }
.instrument-name { font-size: 1rem; font-weight: 700; color: var(--mm-ivory); margin: 0 0 0.375rem; }
.category-badge { display: inline-block; padding: 0.125rem 0.5rem; background: rgba(224,112,96,0.1); color: var(--mm-coral); border: 1px solid rgba(224,112,96,0.2); border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.card-actions { display: flex; gap: 0.25rem; }
.icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; border-radius: 0.375rem; transition: all 0.2s; }
.icon-btn.edit   { color: var(--mm-teal); }
.icon-btn.edit:hover   { background: rgba(42,157,159,0.12); }
.icon-btn.delete { color: var(--mm-coral); }
.icon-btn.delete:hover { background: rgba(224,112,96,0.12); }

.icard-body { padding: 1rem; }
.instrument-desc { font-size: 0.8125rem; color: var(--mm-sand); line-height: 1.5; margin: 0 0 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.prices-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; margin-bottom: 0.625rem; }
.price-box { padding: 0.75rem; border-radius: 0.5rem; }
.price-box.gold  { background: rgba(212,168,83,0.08); border: 1px solid rgba(212,168,83,0.12); }
.price-box.teal  { background: rgba(42,157,159,0.08); border: 1px solid rgba(42,157,159,0.12); }
.price-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem; }
.price-box.gold .price-value { color: var(--mm-gold); }
.price-box.teal .price-value { color: var(--mm-teal); }
.price-value { font-size: 1.0625rem; font-weight: 800; }

.stock-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; }
.stock-item { background: rgba(212,168,83,0.04); border: 1px solid rgba(212,168,83,0.06); border-radius: 0.5rem; padding: 0.625rem 0.75rem; }
.stock-label { font-size: 0.6875rem; font-weight: 700; color: var(--mm-stone); text-transform: uppercase; letter-spacing: 0.04em; }
.stock-value { font-size: 0.9375rem; font-weight: 700; color: var(--mm-ivory); margin-top: 0.25rem; }

@media (max-width: 768px) { .instruments-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } .page-header { flex-direction: column; align-items: flex-start; } .btn-primary { width: 100%; justify-content: center; } }
</style>
