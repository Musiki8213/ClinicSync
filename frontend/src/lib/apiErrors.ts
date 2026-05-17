import { isAxiosError } from 'axios'

export function apiErrorMessage(err: unknown, fallback = 'Try again'): string {
  if (isAxiosError(err)) {
    if (!err.response) {
      if (err.code === 'ECONNABORTED') {
        return 'API timed out — the server may be waking up (Render free tier). Wait 30s and try again.'
      }
      return 'Cannot reach the API. On Vercel set BACKEND_URL to your Render API URL, redeploy, and ensure MongoDB + Render are running.'
    }

    const { status, data } = err.response

    if (typeof data === 'object' && data !== null && 'message' in data) {
      return String((data as { message: unknown }).message)
    }

    if (typeof data === 'string') {
      if (data.trim().startsWith('<!')) {
        return 'Received a web page instead of API data — redeploy Vercel with BACKEND_URL set, or remove a wrong VITE_API_URL.'
      }
      if (data.trim()) return data.trim().slice(0, 200)
    }

    if (status === 401) return 'Invalid email or password (demo accounts must exist in the database).'
    if (status === 502 || status === 503) {
      return 'API not reachable from Vercel. Set BACKEND_URL to your Render service URL and redeploy.'
    }

    return `Request failed (${status})`
  }

  if (err instanceof Error && err.message) {
    return err.message
  }

  return fallback
}
