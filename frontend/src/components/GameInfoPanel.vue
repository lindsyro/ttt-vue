<template>
  <div class="info-wrapper">
    <transition name="fade">
      <div class="info-backdrop" @click="$emit('close')"></div>
    </transition>

    <transition name="slide-up">
      <div class="info-panel shadow-lg">
        <div class="info-content">
          <div class="info-header">
            <span class="status-badge" :class="statusClass">
              {{ translateStatus(game.state.status) }}
            </span>
          </div>

          <div class="players-grid">
            <div class="player">
              <span class="role">Создатель</span>
              <strong class="name">{{ game.creator.login }}</strong>
              <span class="wr">{{ getWinRate(game.creator.uuid) }}</span>
            </div>

            <div class="vs">VS</div>

            <div class="player">
              <span class="role">Оппонент</span>
              <strong class="name">{{ game.opponent?.login || 'Ожидание...' }}</strong>
              <span class="wr">{{ getWinRate(game.opponent?.uuid) }}</span>
            </div>
          </div>

          <div class="game-meta">
            <code class="uuid">ID: {{ game.uuid }}</code>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import type { GameModel } from '@/models/game.model'

const props = defineProps<{
  game: GameModel
}>()

defineEmits(['close'])

const store = useStore()

onMounted(() => {
  store.dispatch('game/fetchLeaderboard', 20)
})

const getWinRate = (uuid?: string) => {
  if (!uuid) return ''
  const leaderboard = store.getters['game/leaderboard'] || []
  const entry = leaderboard.find((e: any) => e.userUUID === uuid)
  return entry ? `WR: ${(entry.winRate * 100).toFixed(1)}%` : 'WR: 0%'
}

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    WAITING: 'Ожидание игрока',
    PLAYING: 'Идет сражение',
    WON: 'Игра завершена',
    DRAW: 'Ничья',
  }
  return map[status] || status
}

const statusClass = computed(() => ({
  'status-waiting': props.game.state.status === 'WAITING',
  'status-playing': props.game.state.status === 'PLAYING',
  'status-finished': ['WON', 'DRAW'].includes(props.game.state.status),
}))
</script>

<style scoped>
.info-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.info-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.896);

  border-radius: 8px;
  z-index: 101;
  pointer-events: auto;
}

.info-panel {
  position: relative;
  background: white;
  padding: 25px;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  z-index: 102;
  pointer-events: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #eee;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.info-header {
  text-align: center;
  margin-bottom: 20px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.players-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 10px 0;
}

.player {
  display: flex;
  flex-direction: column;
  text-align: center;
  flex: 1;
}

.role {
  font-size: 10px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}
.name {
  font-size: 18px;
  color: #333;
  word-break: break-all;
}
.wr {
  font-size: 13px;
  color: #2078cb;
  font-weight: 600;
  margin-top: 4px;
}
.vs {
  font-weight: 900;
  color: #eee;
  font-style: italic;
  padding: 0 20px;
  font-size: 20px;
}

.game-meta {
  text-align: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 15px;
}
.uuid {
  font-size: 10px;
  color: #ccc;
  font-family: monospace;
}

.status-badge {
  font-size: 12px;
  font-weight: bold;
  padding: 6px 14px;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-waiting {
  background: #fff4e5;
  color: #b7791f;
}
.status-playing {
  background: #e3f2fd;
  color: #1976d2;
}
.status-finished {
  background: #e6f4ea;
  color: #1e7e34;
}
</style>
