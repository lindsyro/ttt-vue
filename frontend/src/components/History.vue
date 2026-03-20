<template>
  <div class="container">
    <div class="games-wrapper">
      <h1>Завершенные игры</h1>

      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="loader">Загрузка...</div>

      <ul id="gameList" v-else>
        <li v-for="game in completedGames" :key="game.uuid" class="game-item shadow-sm">
          <div class="game-info">
            <span class="game-id"> ID: {{ game.uuid.substring(0, 8) }} </span>
            <span class="opponent">
              Соперник: <strong>{{ getOpponentLogin(game) }}</strong>
            </span>
          </div>

          <div class="game-result">
            <span :class="['status-badge', getStatusClass(game)]">
              {{ getGameStatus(game) }}
            </span>
          </div>
        </li>
      </ul>

      <div v-if="!isLoading && completedGames.length === 0" class="status-message">
        У вас нет завершенных игр
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '@/composables/useApp'
import { onMounted } from 'vue'
import type { GameModel } from '@/models/game.model'

const { store, errorMessage, setError } = useApp()

const isLoading = computed(() => store.getters['game/isLoading'])
const sessionUserId = computed(() => store.getters['auth/userID'])
const completedGames = computed(() => store.getters['game/completedGames'])

const loadGames = async () => {
  try {
    await store.dispatch('game/fetchCompleted')
  } catch (error: any) {
    setError('Ошибка загрузки истории')
  }
}

onMounted(loadGames)

const getGameStatus = (game: GameModel) => {
  if (game.state.status === 'DRAW') return 'НИЧЬЯ'
  if (game.state.status === 'WON') {
    return game.state.playerUUID === sessionUserId.value ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ'
  }
}

const getStatusClass = (game: GameModel) => {
  const status = getGameStatus(game)
  if (status === 'ПОБЕДА') return 'win'
  if (status === 'ПОРАЖЕНИЕ') return 'loss'
  return 'draw'
}

const getOpponentLogin = (game: GameModel) => {
  return game.creator.uuid === sessionUserId.value ? game.opponent?.login : game.creator.login
}
</script>

<style scoped>
.games-wrapper {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  width: 500px;
  max-width: 95vh;
  margin: 40px auto;
}

#gameList {
  list-style-type: none;
  padding: 0;
  margin: 20px 0;
  border: 1px solid #eee;
  border-radius: 4px;
  max-height: 75vh;
  overflow-y: scroll;
}

#gameList li {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#gameList li:last-child {
  border-bottom: none;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
}

.game-id {
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

#gameList::-webkit-scrollbar {
  width: 8px;
  display: block;
}

#gameList::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

#gameList::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

#gameList::-webkit-scrollbar-thumb:hover {
  background: #808284;
}
</style>
