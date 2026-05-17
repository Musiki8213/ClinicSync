import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '@/api/client'
import { toast } from '@/hooks/use-toast'

export type Role = 'admin' | 'doctor' | 'patient'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthUserResponse {
  id?: unknown
  _id?: unknown
  name: string
  email: string
  role: Role
}

function mapAuthUser(raw: AuthUserResponse): AuthUser {
  const id = raw.id ?? raw._id
  if (id === undefined || id === null || id === '') {
    throw new Error('Invalid user payload from server')
  }
  return {
    id: typeof id === 'string' ? id : String(id),
    name: raw.name,
    email: raw.email,
    role: raw.role,
  }
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  signingOut: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (data: { name: string; email: string; password: string; age?: number; gender?: string }) => Promise<void>
  logout: () => void
  clearSession: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'clinicsync_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get<{ user: AuthUserResponse }>('/auth/me')
      setUser(mapAuthUser(data.user))
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  useEffect(() => {
    if (signingOut && location.pathname === '/') {
      setSigningOut(false)
    }
  }, [signingOut, location.pathname])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: AuthUserResponse }>('/auth/login', { email, password })
    if (!data?.token || !data?.user) {
      throw new Error('Invalid response from server — check BACKEND_URL on Vercel points to your API.')
    }
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    const mapped = mapAuthUser(data.user)
    setUser(mapped)
    return mapped
  }, [])

  const register = useCallback(
    async (form: { name: string; email: string; password: string; age?: number; gender?: string }) => {
      const { data } = await api.post<{ token: string; user: AuthUserResponse }>('/auth/register', form)
      if (!data?.token || !data?.user) {
        throw new Error('Invalid response from server — check BACKEND_URL on Vercel points to your API.')
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(mapAuthUser(data.user))
      toast({ title: 'Account created', description: 'You can now book appointments.', variant: 'success' })
    },
    []
  )

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const logout = useCallback(() => {
    setSigningOut(true)
    navigate('/', { replace: true })
    clearSession()
    toast({ title: 'Signed out' })
  }, [navigate, clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      signingOut,
      login,
      register,
      logout,
      clearSession,
      refreshUser,
    }),
    [user, token, loading, signingOut, login, register, logout, clearSession, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
