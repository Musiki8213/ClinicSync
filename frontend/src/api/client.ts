import axios from 'axios'

/**
 * Dev: `/api` via Vite proxy.
 * Vercel (experimentalServices): `/_/backend/api` hits the Express service directly.
 * External API: set VITE_API_URL e.g. https://your-api.example.com/api
 */
const viteApiUrl = import.meta.env.VITE_API_URL as string | undefined
const baseURL =
  viteApiUrl?.replace(/\/$/, '') || (import.meta.env.PROD ? '/_/backend/api' : '/api')

const api = axios.create({
  baseURL,
  timeout: 45_000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clinicsync_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
