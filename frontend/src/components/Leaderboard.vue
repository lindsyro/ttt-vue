<template>
  <div class="container">
    <div class="users-wrapper">
      <h1>Рейтинг игроков</h1>

      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="loader">Загрузка рейтинга...</div>

      <ul id="userList" v-else>
        <li
          v-for="entity in leaderboard"
          :key="entity.userUUID"
          class="user-item"
          :class="{ me: entity.userUUID === sessionUserId }"
        >
          <div class="user-info">
            <span class="user-id">ID: {{ entity.userUUID.substring(0, 8) }}</span>
            <span class="username">
              Игрок: <strong>{{ getUserLogin(entity.userUUID) }}</strong>
            </span>
          </div>
          <div class="user-stats">
            <span :class="['status-badge', getWinRateClass(entity.winRate)]">
              WR: {{ (entity.winRate * 100).toFixed(1) }}%
            </span>
          </div>
        </li>
      </ul>

      <div v-if="!isLoading && leaderboard.length === 0" class="status-message">
        Рейтинг пока пуст
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useApp } from '@/composables/useApp'

const { store, errorMessage, setError } = useApp()

const isLoading = computed(() => store.getters['game/isLoading'])
const leaderboard = computed(() => store.getters['game/leaderboard'] || [])
const allUsers = computed(() => store.getters['game/users'] || [])
const sessionUserId = computed(() => store.getters['auth/userID'])

const getUserLogin = (uuid: string): string => {
  const found = allUsers.value.find((u: any) => u.uuid === uuid)
  return found ? found.login : 'Загрузка...'
}

const loadLeaderboard = async () => {
  try {
    await Promise.all([
      store.dispatch('game/fetchUsers'),
      store.dispatch('game/fetchLeaderboard', 20),
    ])
  } catch (error: any) {
    setError('Ошибка загрузки рейтинга')
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'F5') {
    event.preventDefault()
    loadLeaderboard()
  }
}

onMounted(() => {
  loadLeaderboard()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const getWinRateClass = (rate: number) => {
  if (rate >= 0.6) return 'win' // WR > 60%
  if (rate <= 0.4 && rate > 0) return 'loss' // WR < 40%
  return 'draw'
}
</script>

<style scoped>
.users-wrapper {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  width: 500px;
  max-width: 95vh;
  margin: 40px auto;
}

#userList {
  list-style-type: none;
  padding: 0;
  margin: 20px 0;
  border: 1px solid #eee;
  border-radius: 4px;
  max-height: 75vh;
  overflow-y: scroll;
}

#userList li {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#userList li:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
}

.user-id {
  color: #999;
  width: 100px;
}

.status-message {
  text-align: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  min-width: 90px;
  text-align: center;
  display: inline-block;
}

.win {
  background-color: #e6f4ea;
  color: #1e7e34;
}
.loss {
  background-color: #fce8e6;
  color: #c53929;
}
.draw {
  background-color: #f1f3f4;
  color: #5f6368;
}

h1 {
  font-size: 22px;
  text-align: center;
  margin-bottom: 10px;
  color: #444;
}

#userList::-webkit-scrollbar {
  width: 8px;
  display: block;
}

#userList::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

#userList::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

#userList::-webkit-scrollbar-thumb:hover {
  background: #808284;
}

#userList li.me {
  background-color: #e3f2fd;
}
</style>
