import 'server-only'
import type { AuthTokens, AuthUser, LoginCredentials, RegisterData } from './auth-types'

const API_BASE = process.env.MERCASAVIP_API_BASE

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

function mapRawToUser(raw: unknown): AuthUser {
  // TODO(Luis): confirmar qué datos de usuario devuelve realmente la API y mapear los campos reales.
  const obj = (raw ?? {}) as Record<string, unknown>
  return {
    id: String(obj.id ?? obj.userId ?? obj.accountNum ?? ''),
    name: String(obj.name ?? obj.fullName ?? obj.userName ?? ''),
    email: String(obj.email ?? obj.userEmail ?? ''),
  }
}

function mapLoginResponse(raw: unknown): AuthTokens & { user: AuthUser } {
  const obj = (raw ?? {}) as Record<string, unknown>
  return {
    // TODO(Luis): confirmar nombres reales de campos del access/refresh token en la respuesta del login
    accessToken: String(obj.accessToken ?? obj.access_token ?? obj.token ?? ''),
    refreshToken: String(obj.refreshToken ?? obj.refresh_token ?? ''),
    user: mapRawToUser(obj.user ?? obj),
  }
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthResult<AuthTokens & { user: AuthUser }>> {
  try {
    const base = assertApiBase()
    // TODO(Luis): confirmar ruta exacta del endpoint de login dentro de /Authentication
    const url = new URL('/Authentication/HE_Login', base)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials), // TODO(Luis): confirmar shape exacto del body de login
      cache: 'no-store',
    })

    if (res.status === 401 || res.status === 400) {
      return { ok: false, status: 401, error: 'Credenciales inválidas' }
    }
    if (!res.ok) {
      return {
        ok: false,
        status: 502,
        error: `MercasaVIP API respondió ${res.status} ${res.statusText}`,
      }
    }

    const raw = await res.json()
    return { ok: true, data: mapLoginResponse(raw) }
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
): Promise<AuthResult<{ user: AuthUser }>> {
  try {
    const base = assertApiBase()
    // TODO(Luis): confirmar ruta exacta del endpoint de registro dentro de /Authentication
    const url = new URL('/Authentication/HE_Register', base)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), // TODO(Luis): confirmar shape exacto del body de registro
      cache: 'no-store',
    })

    if (res.status === 400) {
      return { ok: false, status: 400, error: 'Datos de registro inválidos' }
    }
    if (!res.ok) {
      return {
        ok: false,
        status: 502,
        error: `MercasaVIP API respondió ${res.status} ${res.statusText}`,
      }
    }

    const raw = await res.json()
    // TODO(Luis): mapear campos reales de la respuesta de registro a AuthUser
    return { ok: true, data: { user: mapRawToUser(raw) } }
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : 'Error desconocido llamando a MercasaVIP API',
    }
  }
}

export async function refresh(refreshToken: string): Promise<AuthResult<AuthTokens>> {
  try {
    const base = assertApiBase()
    // TODO(Luis): confirmar si existe endpoint de refresh y su ruta exacta dentro de /Authentication
    const url = new URL('/Authentication/HE_RefreshToken', base)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }), // TODO(Luis): confirmar nombre del campo esperado
      cache: 'no-store',
    })

    if (res.status === 401) {
      return { ok: false, status: 401, error: 'Refresh token inválido o expirado' }
    }
    if (!res.ok) {
      return {
        ok: false,
        status: 502,
        error: `MercasaVIP API respondió ${res.status} ${res.statusText}`,
      }
    }

    const raw = await res.json()
    const mapped = mapLoginResponse(raw)
    return { ok: true, data: { accessToken: mapped.accessToken, refreshToken: mapped.refreshToken } }
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : 'Error desconocido llamando a MercasaVIP API',
    }
  }
}
