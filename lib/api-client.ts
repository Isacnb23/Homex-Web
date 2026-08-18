import 'server-only'

const API_KEY = process.env.MERCASAVIP_API_KEY

function assertApiKey(): string {
  if (!API_KEY) {
    throw new Error('MERCASAVIP_API_KEY no está configurada. Revisá .env.local.')
  }
  return API_KEY
}

// TODAS las llamadas a MercasaVIP.Api (auth, inventario, todo) requieren este
// header, confirmado viendo el tráfico del sitio oficial. Centralizado acá
// para no repetirlo en cada fetch. Server-only: la key nunca llega al cliente.
export function apiFetch(url: string | URL, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { ...init.headers, 'X-Api-Key': assertApiKey() },
    cache: init.cache ?? 'no-store',
  })
}
