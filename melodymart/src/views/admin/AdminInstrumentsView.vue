<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Instrument Management</h1>
        <p class="page-subtitle">Add, edit, and manage instruments for rent and sale</p>
      </div>
      <button class="btn-primary" @click="showAddForm = !showAddForm">+ Add Instrument</button>
    </div>

    <div v-if="showAddForm" class="add-form">
      <h2>Add New Instrument</h2>
      <div class="form-grid">
        <input v-model="newInstrument.name" class="form-input" placeholder="Instrument name" />
        <input v-model="newInstrument.category" class="form-input" placeholder="Category (e.g., Guitar, Piano)" />
        <input v-model="newInstrument.rentalPrice" type="number" class="form-input" placeholder="Rental price (per month)" />
        <input v-model="newInstrument.salePrice" type="number" class="form-input" placeholder="Sale price" />
        <input v-model="newInstrument.rentalQuantity" type="number" class="form-input" placeholder="Available for rental" />
        <input v-model="newInstrument.saleQuantity" type="number" class="form-input" placeholder="Available for sale" />
      </div>
      <textarea v-model="newInstrument.description" class="form-textarea" placeholder="Description..."></textarea>
      <div class="form-actions">
        <button class="btn btn-success" @click="addInstrument">Add Instrument</button>
        <button class="btn btn-cancel" @click="showAddForm = false">Cancel</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading instruments...</p></div>
    <div v-else-if="error" class="error-state"><span>⚠️</span><p>{{ error }}</p><button @click="fetchInstruments" class="retry-btn">Retry</button></div>

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
          <div class="card-header">
            <h3 class="instrument-name">{{ instrument.name }}</h3>
            <div class="card-actions">
              <button class="icon-btn edit" @click="editInstrument(instrument._id)" title="Edit">✏️</button>
              <button class="icon-btn delete" @click="deleteInstrument(instrument._id)" title="Delete">🗑️</button>
            </div>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Category:</span>
              <span class="value">{{ instrument.category || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Description:</span>
              <span class="value">{{ instrument.description || '—' }}</span>
            </div>

            <div class="prices-grid">
              <div class="price-box">
                <div class="price-label">Rental Price</div>
                <div class="price-value">Rs {{ instrument.rentalPrice?.toLocaleString() || '—' }}</div>
                <div class="price-sub">/month</div>
              </div>
              <div class="price-box">
                <div class="price-label">Sale Price</div>
                <div class="price-value">Rs {{ instrument.salePrice?.toLocaleString() || '—' }}</div>
                <div class="price-sub">one-time</div>
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

const newInstrument = ref({
  name: '',
  category: '',
  description: '',
  rentalPrice: '',
  salePrice: '',
  rentalQuantity: '',
  saleQuantity: '',
})

const rentalCount = computed(() => instruments.value.filter(i => i.rentalQuantity > 0).length)
const saleCount = computed(() => instruments.value.filter(i => i.saleQuantity > 0).length)

const filteredInstruments = computed(() => {
  if (activeTab.value === 'rental') return instruments.value.filter(i => i.rentalQuantity > 0)
  if (activeTab.value === 'sale') return instruments.value.filter(i => i.saleQuantity > 0)
  return instruments.value
})

const fetchInstruments = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/instruments', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load instruments')
    const data = await res.json()
    instruments.value = data.instruments || []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const addInstrument = async () => {
  if (!newInstrument.value.name) { error.value = 'Please enter instrument name'; return }
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/instruments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newInstrument.value)
    })
    if (!res.ok) throw new Error('Failed to add instrument')
    showAddForm.value = false
    newInstrument.value = { name: '', category: '', description: '', rentalPrice: '', salePrice: '', rentalQuantity: '', saleQuantity: '' }
    fetchInstruments()
  } catch (e: any) { error.value = e.message }
}

const editInstrument = (id: string) => {
  alert(`Edit ${id} - feature coming soon`)
}

const deleteInstrument = async (id: string) => {
  if (!confirm('Are you sure?')) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/admin/instruments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to delete')
    fetchInstruments()
  } catch (e: any) { error.value = e.message }
}

onMounted(fetchInstruments)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 30px; font-weight: 800; color: #ffffff; margin: 0 0 4px; }
.page-subtitle { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; }

.btn-primary {
  padding: 10px 18px; background: linear-gradient(90deg,#9754CB,#DEACF5);
  color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 12px rgba(151,84,203,0.2);
}

.add-form {
  background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 24px; margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(151,84,203,0.07);
}
.add-form h2 { color: #1b1030; margin: 0 0 16px; font-size: 18px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px; }
.form-input, .form-textarea {
  border: 2px solid #DEACF5; border-radius: 8px; padding: 10px 12px;
  font-size: 13px; color: #1b1030; font-family: inherit;
}
.form-textarea { grid-column: 1 / -1; min-height: 80px; resize: vertical; }
.form-actions { display: flex; gap: 12px; margin-top: 16px; }
.btn { padding: 10px 18px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-success { background: #d1fae5; color: #065f46; }
.btn-cancel { background: #fee2e2; color: #7f1d1d; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.spinner { width: 44px; height: 44px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.error-state p { color: rgba(255,255,255,0.8); font-size: 14px; }
.retry-btn { padding: 9px 20px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.1); }
.tab { background: none; border: none; color: rgba(255,255,255,0.6); padding: 10px 14px; font-weight: 600; cursor: pointer; font-size: 13px; border-bottom: 3px solid transparent; transition: all 0.2s; }
.tab.active { color: white; border-bottom-color: #9754CB; }

.empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5); }

.instruments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }

.instrument-card {
  background: white; border: 2px solid #DEACF5; border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 12px rgba(151,84,203,0.07); transition: transform 0.2s, box-shadow 0.2s;
}
.instrument-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(151,84,203,0.15); }

.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #DEACF5; background: linear-gradient(90deg, rgba(151,84,203,0.05), rgba(222,172,245,0.03)); }
.instrument-name { color: #1b1030; font-size: 16px; font-weight: 700; margin: 0; }
.card-actions { display: flex; gap: 6px; }
.icon-btn { border: none; background: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; transition: all 0.2s; }
.icon-btn.edit:hover { background: #dbeafe; }
.icon-btn.delete:hover { background: #fee2e2; }

.card-body { padding: 16px; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
.label { font-weight: 600; color: rgba(40,16,60,0.65); }
.value { color: #1b1030; }

.prices-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
.price-box { background: linear-gradient(135deg, rgba(151,84,203,0.08), rgba(222,172,245,0.04)); border-radius: 8px; padding: 12px; border: 1px solid rgba(151,84,203,0.1); }
.price-label { font-size: 11px; font-weight: 700; color: rgba(40,16,60,0.65); text-transform: uppercase; }
.price-value { font-size: 18px; font-weight: 800; color: #9754CB; margin: 4px 0; }
.price-sub { font-size: 11px; color: rgba(40,16,60,0.55); }

.stock-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stock-item { background: rgba(151,84,203,0.04); border-radius: 8px; padding: 12px; border: 1px solid rgba(151,84,203,0.1); }
.stock-label { font-size: 11px; font-weight: 700; color: rgba(40,16,60,0.65); }
.stock-value { font-size: 16px; font-weight: 700; color: #1b1030; margin-top: 4px; }

@media (max-width: 768px) {
  .instruments-grid { grid-template-columns: 1fr; }
  .prices-grid, .stock-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: start; }
  .btn-primary { width: 100%; }
}
</style>
