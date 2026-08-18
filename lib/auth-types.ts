export interface LoginCredentials {
  id: string // VATNUM/CustomerId del cliente. NO es email.
  password: string
}

export interface RegisterData {
  id: string // VATNUM/CustomerId del cliente.
  password: string
}

// LoginResponseDto real de MercasaVIP.Api (login_HE y RefreshCredentials devuelven esta misma forma).
export interface LoginResponseRaw {
  tokens: { Token: string; RefreshToken: string } | null
  result: string
  IsCorrect: boolean
}

export interface AuthTokens {
  // Mapeados desde tokens.Token / tokens.RefreshToken del LoginResponseDto.
  accessToken: string
  refreshToken: string
}

// Estos datos no vienen de un endpoint: se extraen decodificando los claims
// del access token (JWT) en el servidor. Ver lib/jwt.ts.
export interface AuthUser {
  accountNum: string // claim nameid (ClaimTypes.NameIdentifier)
  name: string // claim unique_name (ClaimTypes.Name)
  email: string // claim email (ClaimTypes.Email)
}

export interface SessionState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}
