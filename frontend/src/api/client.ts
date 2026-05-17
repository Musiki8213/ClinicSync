import axios from 'axios'

/**
 * Dev: `/api` via Vite proxy.
 * Vercel: `/api` via `api/[...path].js` proxy → BACKEND_URL (preferred).
 * Optional override: VITE_API_URL for direct API calls.
 */
const viteApiUrl = import.meta.env.VITE_API_URL as string | undefined
const baseURL = viteApiUrl?.replace(/\/$/, '') || '/api'

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
