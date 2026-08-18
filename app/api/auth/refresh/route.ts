import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { refresh } from '@/lib/auth-api'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  CUSTOMER_ID_COOKIE,
  authCookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/auth-cookies'

export async function POST() {
  const store = await cookies()
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value
  const customerId = store.get(CUSTOMER_ID_COOKIE)?.value

  if (!refreshToken || !customerId) {
    return NextResponse.json({ error: 'No hay refresh token' }, { status: 401 })
  }

  const result = await refresh(customerId, refreshToken)

  if (!result.ok) {
    store.delete(ACCESS_TOKEN_COOKIE)
    store.delete(REFRESH_TOKEN_COOKIE)
    store.delete(CUSTOMER_ID_COOKIE)
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  store.set(ACCESS_TOKEN_COOKIE, result.data.accessToken, { ...authCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE })
  if (result.data.refreshToken) {
    store.set(REFRESH_TOKEN_COOKIE, result.data.refreshToken, { ...authCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE })
  }

  return NextResponse.json({ ok: true })
}
