import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { login } from '@/lib/auth-api'
import { getUserFromAccessToken } from '@/lib/jwt'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  CUSTOMER_ID_COOKIE,
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

  if (!credentials?.id || !credentials?.password) {
    return NextResponse.json({ error: 'Id y contraseña son obligatorios' }, { status: 400 })
  }

  const result = await login(credentials)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { accessToken, refreshToken } = result.data
  const user = getUserFromAccessToken(accessToken)

  if (!user) {
    return NextResponse.json({ error: 'No se pudo leer el usuario del token' }, { status: 502 })
  }

  const store = await cookies()

  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...authCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE })
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...authCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE })
  // Guardamos el Id de login aparte porque RefreshCredentials lo pide como
  // CustomerId, y para cuando haga falta refrescar el access token ya pudo
  // haber expirado (no se puede derivar del claim nameid en ese momento).
  store.set(CUSTOMER_ID_COOKIE, credentials.id, { ...authCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE })

  return NextResponse.json({ user })
}
