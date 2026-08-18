export const ACCESS_TOKEN_COOKIE = 'homex_access_token'
export const REFRESH_TOKEN_COOKIE = 'homex_refresh_token'
export const SESSION_USER_COOKIE = 'homex_session_user'

// Según la API: access token dura 5 min, refresh token dura 7 días (10080 min).
export const ACCESS_TOKEN_MAX_AGE = 60 * 5
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}
