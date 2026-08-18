import 'server-only'
import type { AuthUser } from './auth-types'

// Decodifica el payload de un JWT SIN verificar la firma. Esto es seguro acá
// porque el token llega server-to-server directo de MercasaVIP.Api (login_HE /
// RefreshCredentials); solo lo usamos para LEER los claims, nunca para
// autorizar nada por cuenta propia — la verificación real la sigue haciendo
// la API al recibir el Bearer token. NO decodificar en el cliente.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

// Claims reales del access token (ver ClaimTypes en AuthenticationController):
// nameid = AccountNum, unique_name = CustomerName, email = email, jti = id del token.
export function getUserFromAccessToken(token: string): AuthUser | null {
  const claims = decodeJwtPayload(token)
  if (!claims) return null

  return {
    accountNum: String(claims.nameid ?? ''),
    name: String(claims.unique_name ?? ''),
    email: String(claims.email ?? ''),
  }
}
