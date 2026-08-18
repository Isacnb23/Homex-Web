import 'server-only'
import { cookies } from 'next/headers'
import { refresh } from './auth-api'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  authCookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from './auth-cookies'

const API_BASE = process.env.MERCASAVIP_API_BASE

// Para endpoints [Authorize] de MercasaVIP (HE_ChangePassword, CreateDirection, UpdateDirection, etc):
// adjunta el Bearer token de la cookie y, si la API responde 401 por token expirado, refresca una vez y reintenta.
export async function fetchProtected(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_BASE) {
    throw new Error('MERCASAVIP_API_BASE no está configurada. Revisá .env.local.')
  }

  const store = await cookies()
  const url = new URL(path, API_BASE)

  const doFetch = (token: string | undefined) =>
    fetch(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token ?? ''}` },
      cache: 'no-store',
    })

  let accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value
  let res = await doFetch(accessToken)

  if (res.status === 401) {
    const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value

    if (refreshToken) {
      const refreshed = await refresh(refreshToken)

      if (refreshed.ok) {
        accessToken = refreshed.data.accessToken
        store.set(ACCESS_TOKEN_COOKIE, accessToken, {
          ...authCookieOptions,
          maxAge: ACCESS_TOKEN_MAX_AGE,
        })
        if (refreshed.data.refreshToken) {
          store.set(REFRESH_TOKEN_COOKIE, refreshed.data.refreshToken, {
            ...authCookieOptions,
            maxAge: REFRESH_TOKEN_MAX_AGE,
          })
        }
        res = await doFetch(accessToken)
      }
    }
  }

  return res
}
