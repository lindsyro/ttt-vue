import router from '@/router'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://ttt-vue.onrender.com',
})

// Добавляем accessToken к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Обработка 401 ошибки и Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest.url.includes('auth/login')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && originalRequest.url.includes('auth/refresh')) {
      localStorage.clear()
      router.push('/login')

      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken: refreshToken,
        })

        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        router.push('/login')

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
