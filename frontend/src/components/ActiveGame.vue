<template>
  <div class="container">
    <div v-if="isLoading && !game && !errorMessage" class="loader">Загрузка...</div>

    <div v-if="errorMessage" class="error">
      <h1>{{ errorMessage }}</h1>
      <p>Вы будете перенаправлены к списку игр...</p>
    </div>

    <div v-if="game" class="game-wrapper">
      <button @click="showInfo = true" class="btn-info-absolute" title="Информация">ℹ️</button>

      <Game
        :game="game"
        @move-start="isWaitingForMove = true"
        @move-end="isWaitingForMove = false"
      />

      <GameInfoPanel v-if="showInfo" :game="game" @close="showInfo = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApp } from '@/composables/useApp'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { GameModel } from '@/models/game.model'
import Game from './Game.vue'
import GameInfoPanel from './GameInfoPanel.vue'

const showInfo = ref(false)

const { store, router, route, errorMessage } = useApp()
let timer: ReturnType<typeof setInterval> | null = null
const isRedirecting = ref(false)
const isWaitingForMove = ref(false)

const game = computed(() => {
  const rawGame = store.getters['game/currentGame']
  return rawGame ? new GameModel(rawGame) : null
})

const isLoading = computed(() => store.getters['game/isLoading'])

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const handleCriticalError = (msg: string) => {
  stopTimer()
  if (!isRedirecting.value) {
    isRedirecting.value = true
    errorMessage.value = msg

    setTimeout(() => {
      router.replace('/games')
      isRedirecting.value = false
      errorMessage.value = ''
    }, 3000)
  }
}

const update = async () => {
  if (isRedirecting.value || isWaitingForMove.value) return

  const uuid = route.params.uuid as string
  try {
    await store.dispatch('game/getGameById', { uuid, background: true })
    if (game.value && !['WAITING', 'PLAYING'].includes(game.value.state.status)) {
      stopTimer()
    }
  } catch (e: any) {
    handleCriticalError(e.message || 'Игра удалена')
  }
}

onMounted(async () => {
  const uuid = route.params.uuid as string
  store.commit('game/SET_CURRENT_GAME', null)

  try {
    await store.dispatch('game/getGameById', { uuid, background: false })
    if (game.value && ['WAITING', 'PLAYING'].includes(game.value.state.status)) {
      timer = setInterval(update, 1000)
    }
  } catch (e: any) {
    handleCriticalError(e.message || 'Игра недоступна')
  }
})

onUnmounted(() => stopTimer())
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 20px;
}

.btn-history {
  padding: 10px 20px;
  background-color: #2078cb;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 20px;
  font-size: 16px;
}

.btn-history:hover {
  background-color: #144f85;
}

.loader,
.error {
  text-align: center;
  margin-top: 50px;
}

.game-wrapper {
  position: relative;
  display: block;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-wrapper :deep(> *) {
  margin-left: auto;
  margin-right: auto;
}

.btn-info-absolute {
  position: absolute;
  top: 20px;
  left: 52%;
  transform: translateX(80px);

  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background-color: rgba(248, 249, 250, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.btn-info-absolute:hover {
  background-color: #fff;
  transform: translateX(80px) scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
