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

// Claims reales del access token: JwtService.GenerateTokens usa los
// ClaimTypes "clásicos" de .NET (System.Security.Claims.ClaimTypes), que al
// serializarse a JWT quedan como las URIs completas de los esquemas
// xmlsoap/ws-2005, NO las versiones cortas ("nameid"/"unique_name"/"email")
// que usan otras librerías. Confirmado con un token real:
//   .../identity/claims/nameidentifier  -> AccountNum
//   .../identity/claims/name            -> CustomerName
//   .../identity/claims/emailaddress    -> email
const CLAIM_ACCOUNT_NUM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'

export function getUserFromAccessToken(token: string): AuthUser | null {
  const claims = decodeJwtPayload(token)
  if (!claims) return null

  const accountNum = String(claims[CLAIM_ACCOUNT_NUM] ?? '')
  const name = String(claims[CLAIM_NAME] ?? '')
  const email = String(claims[CLAIM_EMAIL] ?? '')

  // Sin accountNum no hay usuario válido (es la clave que usamos para
  // AccountNum en el catálogo/carrito/pedidos).
  if (!accountNum) return null

  return { accountNum, name, email }
}