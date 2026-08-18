import 'server-only'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, SESSION_USER_COOKIE } from './auth-cookies'
import type { AuthUser } from './auth-types'

export interface ServerSession {
  isAuthenticated: boolean
  user: AuthUser | null
}

export async function getServerSession(): Promise<ServerSession> {
  const store = await cookies()
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value

  if (!accessToken) {
    return { isAuthenticated: false, user: null }
  }

  const rawUser = store.get(SESSION_USER_COOKIE)?.value
  let user: AuthUser | null = null

  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as AuthUser
    } catch {
      user = null
    }
  }

  return { isAuthenticated: true, user }
}
