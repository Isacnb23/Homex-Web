'use client'

import { create } from 'zustand'
import type { SessionState } from './auth-types'

type LoginResult = { ok: true } | { ok: false; error: string }

interface AuthStore extends SessionState {
  login: (credentials: { id: string; password: string }) => Promise<LoginResult>
  logout: () => Promise<void>
  fetchSession: () => Promise<void>
}

async function parseJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      const body = await parseJson(res)

      if (!res.ok) {
        set({ isLoading: false })
        return { ok: false, error: (body?.error as string) ?? 'No se pudo iniciar sesión' }
      }

      set({ user: (body?.user as SessionState['user']) ?? null, isAuthenticated: true, isLoading: false })
      return { ok: true }
    } catch {
      set({ isLoading: false })
      return { ok: false, error: 'No se pudo conectar con el servidor' }
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  fetchSession: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }
      const body = await parseJson(res)
      const user = (body?.user as SessionState['user']) ?? null
      set({ user, isAuthenticated: Boolean(user), isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
