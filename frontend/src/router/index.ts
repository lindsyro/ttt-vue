import { createRouter, createWebHashHistory } from 'vue-router'

import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
import GameCreate from '@/components/GameCreate.vue'
import ActiveGame from '@/components/ActiveGame.vue'
import Games from '@/components/Games.vue'
import store from '@/store'
import History from '@/components/History.vue'
import Leaderboard from '@/components/Leaderboard.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/games',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: 'Авторизация' },
    },
    {
      path: '/signup',
      name: 'signup',
      component: Register,
      meta: { title: 'Регистрация' },
    },
    {
      path: '/games',
      name: 'games',
      meta: { requiresAuth: true },
      component: Games,
    },
    {
      path: '/create',
      name: 'create',
      meta: { requiresAuth: true },
      component: GameCreate,
    },
    {
      path: '/games/history',
      name: 'history',
      meta: { requiresAuth: true },
      component: History,
    },
    {
      path: '/users/leaderboard',
      name: 'leaderboard',
      meta: { requiresAuth: true },
      component: Leaderboard,
    },
    {
      path: '/games/:uuid',
      name: 'current-game',
      meta: { requiresAuth: true },
      component: ActiveGame,
    },
  ],
})

router.beforeEach((to) => {
  const isLoggedIn = !!store.getters['auth/userID']
  const isPublicPage = ['/login', '/signup'].includes(to.path)

  if (!isPublicPage && !isLoggedIn) {
    return '/login'
  }
})

export default router
