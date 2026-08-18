import 'server-only'
import { apiFetch } from './api-client'
import type {
  AuthTokens,
  LoginCredentials,
  LoginResponseRaw,
  RegisterData,
} from './auth-types'

const API_BASE = process.env.MERCASAVIP_API_BASE

// HomeX Express es AppId 2 en MercasaVIP.Api (AppId 1 es la app de MercasaVIP).
const APP_ID = 2

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string }

function assertApiBase(): string {
  if (!API_BASE) {
    throw new Error(
      'MERCASAVIP_API_BASE no está configurada. Revisá .env.local.'
    )
  }
  return API_BASE
}

function mapTokens(raw: LoginResponseRaw): AuthTokens {
  return {
    accessToken: raw.tokens?.Token ?? '',
    refreshToken: raw.tokens?.RefreshToken ?? '',
  }
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthResult<AuthTokens>> {
  try {
    const base = assertApiBase()
    const url = new URL('/Authentication/login_HE', base)
    url.searchParams.set('Id', credentials.id)
    // ⚠️ La contraseña viaja en la query string — así está expuesto el
    // endpoint real, no es una elección nuestra. Este fetch corre siempre
    // server-to-server desde el BFF, nunca desde el navegador del cliente,
    // así que al menos no queda expuesta en la red del usuario final.
    url.searchParams.set('password', credentials.password)
    url.searchParams.set('AppId', String(APP_ID))

    const res = await apiFetch(url, { method: 'GET' })

    if (!res.ok) {
      return {
        ok: false,
        status: 502,
        error: `MercasaVIP API respondió ${res.status} ${res.statusText}`,
      }
    }

    const raw = (await res.json()) as LoginResponseRaw

    if (raw.result !== 'SUCCESS' || !raw.IsCorrect || !raw.tokens) {
      return { ok: false, status: 401, error: 'Credenciales inválidas' }
    }

    return { ok: true, data: mapTokens(raw) }
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : 'Error desconocido llamando a MercasaVIP API',
    }
  }
}

export async function register(
  data: RegisterData
): Promise<AuthResult<{ message: string }>> {
  try {
    const base = assertApiBase()
    const url = new URL('/Authentication/UserRegisterHE', base)
    url.searchParams.set('Id', data.id)
    url.searchParams.set('password', data.password)

    const res = await apiFetch(url, { method: 'GET' })

    if (!res.ok) {
      return {
        ok: false,
        status: 502,
        error: `MercasaVIP API respondió ${res.status} ${res.statusText}`,
      }
    }

    // UserRegisterHE devuelve un string plano de resultado, no un objeto JSON.
    const message = await res.text()
    return { ok: true, data: { message } }
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : 'Error desconocido llamando a MercasaVIP API',
    }
  }
}

export async function refresh(
  customerId: string,
  refreshToken: string
): Promise<AuthResult<AuthTokens>> {
  try {
    const base = assertApiBase()
    const url = new URL('/Authentication/RefreshCredentials', base)

    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        CustomerId: customerId,
        RefreshToken: refreshToken,
        AppId: APP_ID,
      }),
    })

    if (!res.ok) {
      return {
        ok: false,
        status: 502,
        error: `MercasaVIP API respondió ${res.status} ${res.statusText}`,
      }
    }

    const raw = (await res.json()) as LoginResponseRaw

    if (!raw.IsCorrect || !raw.tokens) {
      return { ok: false, status: 401, error: 'Refresh token inválido o expirado' }
    }

    return { ok: true, data: mapTokens(raw) }
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : 'Error desconocido llamando a MercasaVIP API',
    }
  }
}
