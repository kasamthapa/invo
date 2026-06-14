import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
  apiFetch,
  setTokens,
  clearTokens,
  getRefreshToken,
  STORAGE_KEYS,
} from '../lib/api'

interface AuthUser {
  id: string
  name: string
  role: string
}

interface AuthStore {
  id: string
  name: string
  slug: string
}

interface LoginInput {
  phone: string
  password: string
  storeSlug: string
}

interface RegisterInput {
  storeName: string
  storeSlug: string
  name: string
  phone: string
  password: string
}

interface AuthResponse {
  user: { id: string; name: string; role: string }
  store: { id: string; name: string; slug: string }
  tokens: { accessToken: string; refreshToken: string }
}

interface AuthContextValue {
  user: AuthUser | null
  store: AuthStore | null
  isAuthenticated: boolean
  login(input: LoginInput): Promise<void>
  register(input: RegisterInput): Promise<void>
  logout(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function readStoredStore(): AuthStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE)
    return raw ? (JSON.parse(raw) as AuthStore) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [store, setStore] = useState<AuthStore | null>(() => readStoredStore())

  const isAuthenticated = user !== null

  const applyAuthResponse = useCallback((data: AuthResponse) => {
    setTokens(data.tokens.accessToken, data.tokens.refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(data.store))
    setUser(data.user)
    setStore(data.store)
  }, [])

  const login = useCallback(
    async (input: LoginInput) => {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          phone: input.phone,
          password: input.password,
          storeSlug: input.storeSlug,
        }),
      })
      applyAuthResponse(data)
    },
    [applyAuthResponse],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      const data = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          storeName: input.storeName,
          storeSlug: input.storeSlug,
          ownerName: input.name,
          phone: input.phone,
          password: input.password,
        }),
      })
      applyAuthResponse(data)
    },
    [applyAuthResponse],
  )

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        })
      } catch {
        // best effort
      }
    }
    clearTokens()
    setUser(null)
    setStore(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, store, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
