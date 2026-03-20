<template>
  <header class="header">
    <div class="header-container">
      <span class="page-title">{{ title }}</span>

      <nav class="nav-menu" v-if="currentUserId">
        <router-link to="/games" class="menu-btn">Список игр</router-link>
        <router-link to="/create" class="menu-btn">Создать игру</router-link>
        <router-link to="/games/history" class="menu-btn">История игр</router-link>
        <router-link to="/users/leaderboard" class="menu-btn">Рейтинг игроков</router-link>
      </nav>
    </div>
    <div class="user-controls" v-if="currentUserId">
      <div class="user-badge">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org">
          <rect width="24" height="24" rx="7" fill="#808284" />
          <path
            d="M12 12C13.933 12 15.5 10.433 15.5 8.5C15.5 6.567 13.933 5 12 5C10.067 5 8.5 6.567 8.5 8.5C8.5 10.433 10.067 12 12 12ZM12 13.5C9 13.5 4.5 15 4.5 18V20H19.5V18C19.5 15 15 13.5 12 13.5Z"
            fill="white"
          />
        </svg>
      </div>
      <span
        >Игрок: <strong>{{ username }}</strong></span
      >
      <button @click="handleLogout" id="logoutBtn" class="logout-btn">Выход</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useApp } from '@/composables/useApp'
import { computed } from 'vue'

const { store, router } = useApp()

defineProps<{
  title?: string
}>()

const currentUserId = computed(() => store.getters['auth/userID'])
const username = computed(() => store.getters['auth/username'])

const handleLogout = () => {
  store.commit('auth/CLEAR_USER')
  store.commit('game/SET_CURRENT_GAME', null)
  router.push('/login')
}
</script>

<style scoped>
.page-title {
  color: #666;
}

.header-container {
  display: flex;
  align-items: center;
  gap: 30px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: #e0e0e0;
  padding: 15px 20px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.nav-menu {
  display: flex;
  gap: 15px;
}

.menu-btn {
  cursor: pointer;
  text-decoration: none;
  color: #666;
}

.menu-btn:hover {
  color: black;
  text-decoration: underline;
}

.router-link-active {
  text-decoration: underline;
}

.user-controls {
  display: flex;
  align-items: center;
  color: #666;
}

.user-badge {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.user-badge svg {
  width: 100%;
  height: 100%;
}

.logout-btn {
  background-color: #d9534f;
  padding: 10px 20px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 16px;
}

.logout-btn:hover {
  background-color: #c9302c;
}
</style>
