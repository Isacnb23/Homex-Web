import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, CUSTOMER_ID_COOKIE } from '@/lib/auth-cookies'

export async function POST() {
  const store = await cookies()

  store.delete(ACCESS_TOKEN_COOKIE)
  store.delete(REFRESH_TOKEN_COOKIE)
  store.delete(CUSTOMER_ID_COOKIE)

  return NextResponse.json({ ok: true })
}
