<script setup lang="ts">
defineProps<{
  id: string
  avatar: string
  name: string
  role: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  isSelected: boolean
}>()

defineEmits<{ select: [] }>()

const roleAccent: Record<string, string> = {
  tutor:             'var(--mm-gold)',
  customer:          'var(--mm-teal)',
  repair_specialist: 'var(--mm-copper)',
  admin:             'var(--mm-coral)',
}

const getRoleColor = (role: string) => roleAccent[role] || 'var(--mm-sand)'
</script>

<template>
  <button
    @click="$emit('select')"
    class="conv-item"
    :class="{ 'is-selected': isSelected }"
  >
    <!-- Avatar -->
    <div class="conv-avatar-wrap">
      <div class="conv-avatar" :style="{ '--role-color': getRoleColor(role) }">
        <img v-if="avatar" :src="avatar" :alt="name" class="conv-avatar-img" />
        <span v-else class="conv-avatar-initials">{{ name[0]?.toUpperCase() }}</span>
      </div>
      <div v-if="isOnline" class="conv-online-dot" />
    </div>

    <!-- Body -->
    <div class="conv-body">
      <div class="conv-row">
        <div class="conv-name-group">
          <span class="conv-name">{{ name }}</span>
          <span class="conv-role-tag" :style="{ color: getRoleColor(role) }">{{ role.replace('_', ' ') }}</span>
        </div>
        <span class="conv-time">{{ timestamp }}</span>
      </div>
      <div class="conv-row conv-row-bottom">
        <span class="conv-preview" :class="{ 'conv-preview-unread': unreadCount > 0 }">{{ lastMessage }}</span>
        <div v-if="unreadCount > 0" class="conv-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</div>
      </div>
    </div>
  </button>
</template>

<style scoped>
.conv-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border: none;
  border-bottom: 1px solid var(--mm-warm-line);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease;
  position: relative;
}
.conv-item::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 0;
  background: var(--mm-gold);
  border-radius: 0 2px 2px 0;
  transition: width 0.18s ease;
}
.conv-item:hover { background: rgba(255,255,255,0.03); }
.conv-item.is-selected { background: rgba(212,168,83,0.06); }
.conv-item.is-selected::before { width: 2.5px; }

.conv-avatar-wrap { position: relative; flex-shrink: 0; }
.conv-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, color-mix(in srgb, var(--role-color, #A8832A) 60%, #1A1823), #1A1823);
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid rgba(255,255,255,0.08);
  overflow: hidden;
}
.conv-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.conv-avatar-initials {
  font-size: 1rem; font-weight: 700; color: var(--mm-ink);
  font-family: 'DM Sans', sans-serif;
}
.conv-online-dot {
  position: absolute; bottom: 1px; right: 1px;
  width: 10px; height: 10px;
  background: var(--mm-emerald);
  border-radius: 50%;
  border: 2px solid var(--mm-carbon);
  box-shadow: 0 0 6px rgba(56,168,130,0.5);
}

.conv-body { flex: 1; min-width: 0; }
.conv-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.conv-row-bottom { margin-top: 0.25rem; }
.conv-name-group { display: flex; align-items: baseline; gap: 0.4rem; min-width: 0; }
.conv-name {
  font-size: 0.875rem; font-weight: 600; color: var(--mm-ivory);
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.conv-role-tag {
  font-size: 0.65rem; font-weight: 600;
  text-transform: capitalize; letter-spacing: 0.04em;
  white-space: nowrap; flex-shrink: 0;
}
.conv-time { font-size: 0.68rem; color: var(--mm-stone); flex-shrink: 0; font-family: 'DM Sans', sans-serif; }
.conv-preview {
  font-size: 0.8rem; color: var(--mm-sand);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  flex: 1; font-family: 'DM Sans', sans-serif;
}
.conv-preview-unread { color: var(--mm-cream); font-weight: 500; }
.conv-badge {
  flex-shrink: 0;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--mm-gold); color: var(--mm-ink);
  border-radius: 2rem;
  font-size: 0.6rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
}
</style>
