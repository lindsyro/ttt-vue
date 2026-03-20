import type { Module } from 'vuex'
import type { RootState } from './index'
import api from './api'

export interface AuthState {
  user: {
    uuid: string | null
    login: string | null
  }
  tokens: {
    access: string | null
    refresh: string | null
  }
  isLoading: boolean
}

export const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state: () => ({
    user: {
      uuid: localStorage.getItem('userId') || null,
      login: localStorage.getItem('username') || null,
    },
    tokens: {
      access: null,
      refresh: null,
    },
    isLoading: false,
  }),
  getters: {
    userID: (state) => state.user.uuid,
    username: (state) => state.user.login,
    isLoading: (state) => state.isLoading,
  },
  mutations: {
    SET_USER(state, payload: { id: string; login: string }) {
      state.user.uuid = payload.id
      state.user.login = payload.login
      localStorage.setItem('userId', payload.id)
      localStorage.setItem('username', payload.login)
    },
    SET_LOADING: (state, status: boolean) => {
      state.isLoading = status
    },
    CLEAR_USER(state) {
      state.user.uuid = null
      state.user.login = null
      localStorage.clear()
    },
  },
  actions: {
    async login({ commit }, { login, password }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.post('auth/login', { login, password })
        const { accessToken, refreshToken } = response.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        const user = await api.get('auth/me')

        commit('SET_USER', {
          id: user.data.uuid,
          login: login,
        })

        return response.data
      } catch (e: any) {
        const message = e.response?.data?.message || 'Ошибка авторизации'
        throw new Error(message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async signup({ commit }, { login, password }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.post('auth/signup', { login, password })
        const data = response.data

        if (data.userId) {
          commit('SET_USER', {
            id: data.userId,
            login: login,
          })
        }

        return data
      } catch (e: any) {
        const message = e.response?.data?.message || 'Ошибка регистрации'
        throw new Error(message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },
}
