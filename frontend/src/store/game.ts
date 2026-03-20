import type { Module } from 'vuex'
import type { RootState } from './index'
import api from './api'
import type { GameModel } from '@/models/game.model'
import type { UserModel } from '@/models/user.model'

export interface GameState {
  users: UserModel[]
  games: GameModel[]
  currentGame: GameModel | null
  completedGames: GameModel[]
  leaderboard: UserModel[]
  isLoading: boolean
}

export const game: Module<GameState, RootState> = {
  namespaced: true,
  state: () => ({
    users: [],
    games: [],
    currentGame: null,
    completedGames: [],
    leaderboard: JSON.parse(localStorage.getItem('leaderboard_cache') || '[]'),
    isLoading: false,
  }),
  getters: {
    users: (state) => state.users,
    availableGames: (state) => state.games,
    completedGames: (state) => state.completedGames,
    leaderboard: (state) => state.leaderboard,
    isLoading: (state) => state.isLoading,
    currentGame: (state) => state.currentGame,
  },

  mutations: {
    SET_USERS: (state, users: UserModel[]) => {
      state.users = users
    },
    SET_GAMES: (state, games: GameModel[]) => {
      state.games = games
    },
    SET_CURRENT_GAME: (state, game: GameModel) => {
      state.currentGame = game
    },
    SET_COMPLETED_GAMES: (state, completedGames: GameModel[]) => {
      state.completedGames = completedGames
    },
    SET_LEADERBOARD: (state, leaderboard: UserModel[]) => {
      state.leaderboard = leaderboard
    },
    SET_LOADING: (state, status: boolean) => {
      state.isLoading = status
    },
  },

  actions: {
    async request(
      { commit },
      { url, method = 'GET', data = null, params = null, showLoading = true },
    ) {
      if (showLoading) commit('SET_LOADING', true)
      try {
        const response = await api({
          url,
          method,
          data,
          params,
        })
        return response.data
      } catch (e: any) {
        const message = e.response?.data?.message || e.message || 'Ошибка сервера'
        throw new Error(message)
      } finally {
        if (showLoading) commit('SET_LOADING', false)
      }
    },

    async fetchUsers({ dispatch, commit }) {
      const data = await dispatch('request', {
        url: 'web/users',
      })
      commit('SET_USERS', data)
    },

    async fetchGames({ dispatch, commit }) {
      const data = await dispatch('request', { url: 'web/games' })
      commit('SET_GAMES', data)
    },

    async createGame({ dispatch }, mode: 'AI' | 'PVP') {
      return await dispatch('request', {
        url: 'web/games',
        method: 'POST',
        data: { mode },
      })
    },

    async clearData({ dispatch, commit }) {
      await dispatch('request', { url: 'web/games', method: 'DELETE' })
      commit('auth/CLEAR_USER', null, { root: true })
    },

    async joinGame({ dispatch, commit }, uuid: string) {
      const data = await dispatch('request', {
        url: `web/games/${uuid}/join`,
        method: 'POST',
      })
      commit('SET_CURRENT_GAME', data)
      return data
    },

    async getGameById({ dispatch, commit }, { uuid, background = false }) {
      const data = await dispatch('request', {
        url: `web/games/${uuid}`,
        method: 'GET',
        showLoading: !background,
      })
      commit('SET_CURRENT_GAME', data)
      return data
    },

    async updateGameById({ dispatch, commit }, { uuid, coords }) {
      const data = await dispatch('request', {
        url: `web/games/${uuid}`,
        method: 'POST',
        data: {
          row: coords.row,
          col: coords.col,
        },
      })
      commit('SET_CURRENT_GAME', data)
      return data
    },

    async fetchCompleted({ dispatch, commit }) {
      const data = await dispatch('request', {
        url: `web/games/completed`,
      })
      commit('SET_COMPLETED_GAMES', data)
    },

    async fetchLeaderboard({ dispatch, commit }, count = 20) {
      try {
        const data = await dispatch('request', {
          url: `web/users/leaderboard`,
          method: 'GET',
          params: { count },
        })

        commit('SET_LEADERBOARD', data)
        localStorage.setItem('leaderboard_cache', JSON.stringify(data))
        return data
      } catch (e) {
        commit('SET_LEADERBOARD', [])
        localStorage.removeItem('leaderboard_cache')
      }
    },
  },
}
