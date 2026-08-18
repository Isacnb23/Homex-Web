import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { login } from '@/lib/auth-api'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
  authCookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/auth-cookies'
import type { LoginCredentials } from '@/lib/auth-types'

export async function POST(request: NextRequest) {
  let credentials: LoginCredentials

  try {
    credentials = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!credentials?.email || !credentials?.password) {
    return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 })
  }

  const result = await login(credentials)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { accessToken, refreshToken, user } = result.data
  const store = await cookies()

  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...authCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE })
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...authCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE })
  store.set(SESSION_USER_COOKIE, JSON.stringify(user), { ...authCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE })

  return NextResponse.json({ user })
}
