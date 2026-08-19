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
export const APP_ID = 2

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

// La cédula/VATNUM en AX (ARCustTable) se guarda con guiones: X-XXXX-XXXX
// (física, 9 dígitos) o formatos similares para jurídica/DIMEX. La API la
// busca tal cual está en ese formato — si se manda sin guiones, GetCustomerInfo
// no encuentra el cliente y login_HE revienta con NullReference (bug real de
// la API, no validación nuestra: no hay try/catch ahí). Normalizamos acá para
// que el usuario pueda escribir la cédula con o sin guiones y funcione igual.
export function normalizeId(rawId: string): string {
  const digits = rawId.replace(/\D/g, '') // solo dígitos

  // Física (9 dígitos): 1-2345-6789
  if (digits.length === 9) {
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 9)}`
  }

  // Jurídica (10 dígitos): 3-101-123456
  if (digits.length === 10) {
    return `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4, 10)}`
  }

  // Formato no reconocido (DIMEX u otro): devolvemos tal cual vino, sin
  // inventar guiones que podrían quedar mal puestos.
  return rawId.trim()
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
    url.searchParams.set('Id', normalizeId(credentials.id))
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
    url.searchParams.set('Id', normalizeId(data.id))
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
        CustomerId: normalizeId(customerId),
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