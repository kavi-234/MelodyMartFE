<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Manage customers, tutors, and specialists</p>
      </div>
      <div class="header-controls">
        <input v-model="searchQuery" type="text" class="search-input" placeholder="Search users..." />
        <select v-model="filterRole" class="filter-select">
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="tutor">Tutors</option>
          <option value="specialist">Specialists</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Loading users...</p></div>
    <div v-else-if="error" class="error-state"><span>⚠️</span><p>{{ error }}</p><button @click="fetchUsers" class="retry-btn">Retry</button></div>

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
                <td>
                  <span class="badge" :class="`badge-${user.role}`">{{ user.role }}</span>
                </td>
                <td>
                  <span class="badge" :class="`badge-${user.isApproved ? 'approved' : 'pending'}`">
                    {{ user.isApproved ? '✓ Approved' : '⏳ Pending' }}
                  </span>
                </td>
                <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
                <td class="actions-cell">
                  <button v-if="!user.isApproved && (user.role === 'tutor' || user.role === 'specialist')" class="action-btn approve" @click="approveUser(user._id)" title="Approve">✓</button>
                  <button class="action-btn view" @click="viewUser(user._id)" title="View Details">👁</button>
                  <button class="action-btn delete" @click="deleteUser(user._id)" title="Delete">🗑</button>
                </td>
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

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchSearch = !searchQuery.value || u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchRole = !filterRole.value || u.role === filterRole.value
    return matchSearch && matchRole
  })
})

const fetchUsers = async () => {
  loading.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load users')
    const data = await res.json()
    users.value = data.users || []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const approveUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to approve')
    fetchUsers()
  } catch (e: any) { error.value = e.message }
}

const viewUser = (userId: string) => {
  alert(`View user ${userId} - feature coming soon`)
}

const deleteUser = async (userId: string) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to delete')
    fetchUsers()
  } catch (e: any) { error.value = e.message }
}

const getInitials = (n: string) => (n || '?').split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'

onMounted(fetchUsers)
</script>

<style scoped>
.page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 30px; font-weight: 800; color: #ffffff; margin: 0 0 4px; }
.page-subtitle { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0; }

.header-controls { display: flex; gap: 12px; flex: 1; max-width: 400px; }
.search-input, .filter-select {
  flex: 1; padding: 9px 12px; border: 2px solid #DEACF5; border-radius: 8px;
  background: white; color: #1b1030; font-size: 13px;
}
.search-input::placeholder { color: rgba(40,16,60,0.4); }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.spinner { width: 44px; height: 44px; border: 4px solid rgba(151,84,203,0.1); border-top-color: #9754CB; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; text-align: center; }
.error-state p { color: rgba(255,255,255,0.8); font-size: 14px; }
.retry-btn { padding: 9px 20px; background: #9754CB; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.card { background: white; border: 2px solid #DEACF5; border-radius: 14px; padding: 0; box-shadow: 0 4px 12px rgba(151,84,203,0.07); overflow: hidden; }
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table thead { background: linear-gradient(90deg,#9754CB,#DEACF5); }
.table th { padding: 12px 14px; color: white; font-weight: 700; text-align: left; font-size: 11px; text-transform: uppercase; white-space: nowrap; }
.table-row { border-bottom: 1px solid #E5D9F0; }
.table-row:hover { background: #F8F4FF; }
.table td { padding: 12px 14px; color: #28104E; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#9754CB,#DEACF5); color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name { font-weight: 700; }

.email-cell { font-size: 12px; color: rgba(40,16,60,0.7); }
.date-cell { font-size: 12px; color: rgba(40,16,60,0.65); white-space: nowrap; }

.badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.badge-customer { background: #dbeafe; color: #0c4a6e; }
.badge-tutor { background: #e0e7ff; color: #3730a3; }
.badge-specialist { background: #fce7f3; color: #831843; }
.badge-approved { background: #d1fae5; color: #065f46; }
.badge-pending { background: #fef3c7; color: #b45309; }

.actions-cell { display: flex; gap: 6px; }
.action-btn { border: none; background: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; transition: all 0.2s; }
.action-btn.approve:hover { background: #d1fae5; }
.action-btn.view:hover { background: #dbeafe; }
.action-btn.delete:hover { background: #fee2e2; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: start; }
  .header-controls { width: 100%; max-width: none; }
  .table { font-size: 12px; }
  .table th, .table td { padding: 8px 10px; }
}
</style>
