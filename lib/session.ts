import 'server-only'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE } from './auth-cookies'
import { getUserFromAccessToken } from './jwt'
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

  const user = getUserFromAccessToken(accessToken)
  return { isAuthenticated: Boolean(user), user }
}
