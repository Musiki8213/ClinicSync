import { isAxiosError } from 'axios'

export function apiErrorMessage(err: unknown, fallback = 'Try again'): string {
  if (isAxiosError(err)) {
    if (!err.response) {
      if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
        return 'API not configured. In Vercel, set VITE_API_URL to your deployed backend (e.g. https://your-api.onrender.com/api), then redeploy.'
      }
      return 'Cannot reach the API. Deploy the backend, set VITE_API_URL on Vercel, and add your Vercel URL to CLIENT_URL on the API.'
    }
    const data = err.response.data
    if (typeof data === 'object' && data !== null && 'message' in data) {
      return String((data as { message: unknown }).message)
    }
    if (typeof data === 'string' && data.trim().startsWith('<!')) {
      return 'Received HTML instead of JSON — check VITE_API_URL points to your API (…/api), not the Vercel site.'
    }
  }
  return fallback
}
