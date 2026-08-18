export const ACCESS_TOKEN_COOKIE = 'homex_access_token'
export const REFRESH_TOKEN_COOKIE = 'homex_refresh_token'
// Id/CustomerId con el que se hizo login. RefreshCredentials lo pide junto al
// refresh token, y para entonces el access token (JWT) ya pudo haber
// expirado, así que no podemos derivarlo del claim nameid en ese momento.
export const CUSTOMER_ID_COOKIE = 'homex_customer_id'

// Según la API: access token dura 5 min, refresh token dura 7 días (10080 min).
export const ACCESS_TOKEN_MAX_AGE = 60 * 5
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}
