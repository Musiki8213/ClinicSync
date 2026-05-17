import axios from 'axios'

/** Dev: same-origin `/api` (Vite proxy). Prod: set VITE_API_URL e.g. https://your-api.onrender.com/api */
const viteApiUrl = import.meta.env.VITE_API_URL as string | undefined
const baseURL = viteApiUrl?.replace(/\/$/, '') || '/api'

if (import.meta.env.PROD && !viteApiUrl) {
  console.warn(
    '[ClinicSync] VITE_API_URL is unset. Auth and data requests will fail on Vercel until you add it and redeploy.'
  )
}

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clinicsync_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
