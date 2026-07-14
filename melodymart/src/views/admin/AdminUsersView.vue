<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Manage customers, tutors, and specialists</p>
      </div>
      <div class="header-controls">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="Search users..." />
        </div>
        <select v-model="filterRole" class="filter-select">
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="tutor">Tutors</option>
          <option value="repair_specialist">Specialists</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="state-box"><div class="spinner"></div><p>Loading users...</p></div>
    <div v-else-if="error" class="state-box"><p class="err">{{ error }}</p><button @click="fetchUsers" class="retry-btn">Retry</button></div>

    <div v-else>
      <div class="card">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user._id" class="table-row">
                <td>
                  <div class="user-cell">
                    <div class="avatar">{{ getInitials(user.name) }}</div>
                    <div class="user-name">{{ user.name }}</div>
                  </div>
                </td>
                <td class="email-cell">{{ user.email }}</td>
                <td><span class="badge" :class="`role-${user.role}`">{{ user.role }}</span></td>
                <td><span class="badge" :class="getStatusClass(user)">{{ getStatusBadge(user) }}</span></td>
                <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="actions-cell">
                    <button v-if="(user.role === 'tutor' || user.role === 'repair_specialist') && user.verificationStatus === 'PENDING_APPROVAL'" class="action-btn approve" @click="approveUser(user._id)" title="Approve">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button class="action-btn view" @click="viewUser(user._id)" title="View">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="action-btn delete" @click="deleteUser(user._id)" title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="empty-row">No users found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const loading = ref(false)
const error = ref('')
const users = ref<any[]>([])
const searchQuery = ref('')
const filterRole = ref('')

const filteredUsers = computed(() => users.value.filter(u => {
  const matchSearch = !searchQuery.value || u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  const matchRole = !filterRole.value || u.role === filterRole.value
  return matchSearch && matchRole
}))

const fetchUsers = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed to load users')
    const data = await res.json()
    users.value = data.users || []
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const approveUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:5000/api/admin/verify-user/${userId}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'APPROVED' }) })
    fetchUsers()
  } catch (e: any) { error.value = e.message }
}

const viewUser   = (id: string) => alert(`View user ${id} — feature coming soon`)
const deleteUser = async (userId: string) => {
  if (!confirm('Delete this user?')) return
  try {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:5000/api/admin/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchUsers()
  } catch (e: any) { error.value = e.message }
}

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate  = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'
const getStatusBadge = (user: any) => { if (user.role === 'customer') return 'Active'; if (user.verificationStatus === 'APPROVED') return 'Approved'; if (user.verificationStatus === 'REJECTED') return 'Rejected'; return 'Pending' }
const getStatusClass = (user: any) => { if (user.role === 'customer' || user.verificationStatus === 'APPROVED') return 'status-approved'; if (user.verificationStatus === 'REJECTED') return 'status-rejected'; return 'status-pending' }
onMounted(fetchUsers)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.875rem; font-weight: 400; color: var(--mm-ivory); margin: 0 0 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { font-size: 0.9375rem; color: var(--mm-sand); margin: 0; }

.header-controls { display: flex; gap: 0.75rem; flex-shrink: 0; }
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--mm-stone); pointer-events: none; }
.search-input { padding: 0.5625rem 0.875rem 0.5625rem 2.25rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; width: 220px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.search-input::placeholder { color: var(--mm-stone); }
.search-input:focus { border-color: var(--mm-coral); }
.filter-select { padding: 0.5625rem 0.875rem; background: var(--mm-mist); border: 1px solid var(--mm-warm-line); border-radius: 0.625rem; color: var(--mm-ivory); font-size: 0.875rem; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
.filter-select:focus { border-color: var(--mm-coral); }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 3.75rem 1.25rem; gap: 0.75rem; text-align: center; }
.spinner { width: 42px; height: 42px; border: 3px solid var(--mm-warm-line); border-top-color: var(--mm-coral); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-box p { color: var(--mm-sand); font-size: 0.875rem; margin: 0; }
.err { color: var(--mm-coral); }
.retry-btn { padding: 0.5625rem 1.25rem; background: linear-gradient(135deg, var(--mm-coral), #C04A3A); color: #fff; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.card { background: var(--mm-onyx); border: 1px solid var(--mm-warm-line); border-radius: 0.875rem; overflow: hidden; }
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.table thead { background: rgba(224,112,96,0.06); border-bottom: 1px solid var(--mm-warm-line); }
.table th { padding: 0.75rem 1rem; color: var(--mm-coral); font-weight: 700; text-align: left; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.table-row { border-bottom: 1px solid var(--mm-warm-line); transition: background 0.15s; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(224,112,96,0.03); }
.table td { padding: 0.75rem 1rem; color: var(--mm-ivory); vertical-align: middle; }

.user-cell { display: flex; align-items: center; gap: 0.625rem; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--mm-coral), #C04A3A); color: #fff; font-size: 0.6875rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name { font-weight: 700; color: var(--mm-ivory); }
.email-cell { font-size: 0.75rem; color: var(--mm-sand); }
.date-cell { font-size: 0.75rem; color: var(--mm-sand); white-space: nowrap; }
.empty-row { text-align: center; padding: 3rem; color: var(--mm-stone); font-size: 0.875rem; }

.badge { display: inline-flex; align-items: center; padding: 0.2rem 0.5625rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 700; }
.role-customer         { background: rgba(42,157,159,0.12);  color: var(--mm-teal);    border: 1px solid rgba(42,157,159,0.25); }
.role-tutor            { background: rgba(212,168,83,0.12);  color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.role-repair_specialist{ background: rgba(192,123,80,0.12);  color: var(--mm-copper);  border: 1px solid rgba(192,123,80,0.25); }
.status-approved { background: rgba(56,168,130,0.12); color: var(--mm-emerald); border: 1px solid rgba(56,168,130,0.25); }
.status-pending  { background: rgba(212,168,83,0.12); color: var(--mm-gold);    border: 1px solid rgba(212,168,83,0.25); }
.status-rejected { background: rgba(224,112,96,0.12); color: var(--mm-coral);   border: 1px solid rgba(224,112,96,0.25); }

.actions-cell { display: flex; gap: 0.375rem; }
.action-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; border-radius: 0.375rem; transition: all 0.2s; }
.action-btn.approve { color: var(--mm-emerald); }
.action-btn.approve:hover { background: rgba(56,168,130,0.12); }
.action-btn.view { color: var(--mm-teal); }
.action-btn.view:hover { background: rgba(42,157,159,0.12); }
.action-btn.delete { color: var(--mm-coral); }
.action-btn.delete:hover { background: rgba(224,112,96,0.12); }

@media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; } .header-controls { width: 100%; flex-wrap: wrap; } .search-input { width: 100%; } }
</style>
