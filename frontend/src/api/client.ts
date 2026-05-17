import axios from 'axios'

/** Dev: same-origin `/api` (Vite proxy). Prod/preview: set VITE_API_URL e.g. http://localhost:5000/api */
const baseURL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'

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
