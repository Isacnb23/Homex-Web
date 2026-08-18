export interface LoginCredentials {
  // TODO(Luis): confirmar campos exactos que pide el login (email? usuario? accountNum? + password). Placeholder:
  email: string
  password: string
}

export interface RegisterData {
  // TODO(Luis): confirmar campos exactos que pide el registro. Placeholder:
  name: string
  email: string
  password: string
}

export interface AuthTokens {
  // TODO(Luis): confirmar nombres reales de campos en la respuesta del login
  accessToken: string
  refreshToken: string
  // posibles: expiresIn, tokenType, etc.
}

export interface AuthUser {
  // TODO(Luis): confirmar qué datos de usuario devuelve la API
  id: string
  name: string
  email: string
}

export interface SessionState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}
