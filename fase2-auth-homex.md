# FASE 2 — Estructura de autenticación (login/registro con JWT)

Montá la ESTRUCTURA completa de autenticación para HomeX Web. Trabajá en el proyecto homex-web. NO conectamos todavía los datos reales de la API porque falta confirmación de Luis sobre las rutas/campos/respuesta exactos del login. Dejá esos puntos como placeholders BIEN marcados con TODO, pero armá toda la fontanería alrededor para que conectar sea solo rellenar.

## Contexto de lo que YA sabemos de la MercasaVIP API (no inventar, usar esto)
- La API usa JWT. El AuthenticationController tiene login/registro públicos ([AllowAnonymous]).
- Access token dura 5 minutos; refresh token dura 7 días (10080 min).
- Endpoints protegidos esperan header `Authorization: Bearer <accessToken>`.
- Existen HE_ChangePassword, CreateDirection, UpdateDirection que requieren [Authorize].
- Base de la API ya está en env como MERCASAVIP_API_BASE.

## Lo que NO sabemos (dejar como TODO/placeholder, esperando a Luis)
- Ruta exacta del endpoint de login y de registro (método dentro de /Authentication).
- Campos que pide el login (email? usuario? accountNum? + password) y el registro.
- Forma exacta de la respuesta del login (nombres de campos del access token y refresh token).
- Si existe endpoint de refresh y su ruta.
Marcá cada uno de estos con un comentario `// TODO(Luis): ...` claro en el código.

## Principio de seguridad (igual que el catálogo)
El front NUNCA llama la API de auth directo. Todo pasa por el BFF (Route Handlers en app/api/auth/*). Los tokens se guardan en cookies httpOnly (el JS del navegador no los puede leer), NO en localStorage. El BFF es quien adjunta el Bearer token a las llamadas protegidas.

## Qué construir

### 1. Tipos (lib/types.ts o lib/auth-types.ts)
```typescript
export interface LoginCredentials {
  // TODO(Luis): confirmar campos exactos. Placeholder:
  email: string;
  password: string;
}

export interface AuthTokens {
  // TODO(Luis): confirmar nombres reales de campos en la respuesta del login
  accessToken: string;
  refreshToken: string;
  // posibles: expiresIn, tokenType, etc.
}

export interface AuthUser {
  // TODO(Luis): confirmar qué datos de usuario devuelve la API
  id: string;
  name: string;
  email: string;
}

export interface SessionState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### 2. Cliente de auth (lib/auth-api.ts, server-only)
- `login(credentials)` → llama `POST {MERCASAVIP_API_BASE}/Authentication/[TODO ruta]`, devuelve tokens. Manejo de error controlado (credenciales inválidas, API caída).
- `register(data)` → placeholder con TODO.
- `refresh(refreshToken)` → placeholder con TODO (ruta desconocida).
- Marcá el archivo con `import 'server-only'`.

### 3. BFF — Route Handlers (app/api/auth/)
- `POST /api/auth/login` → recibe credenciales del front, llama a auth-api.login, y si OK: setea cookies httpOnly (accessToken, refreshToken) y devuelve el user (sin los tokens en el body). Manejo de errores con status correctos (401 credenciales inválidas, 502 API caída).
- `POST /api/auth/logout` → borra las cookies.
- `POST /api/auth/refresh` → usa el refresh token de la cookie para pedir uno nuevo (placeholder con TODO, pero deja la estructura).
- `GET /api/auth/me` → lee la cookie, devuelve el user actual o 401. (Para hidratar el estado de sesión en el front.)

### 4. Helper de sesión server-side
- Una función `getServerSession()` que lea la cookie del access token y valide si hay sesión. Usada por rutas protegidas.
- Middleware de Next (`middleware.ts`) que proteja rutas como `/mi-cuenta`, `/checkout` (redirige a /login si no hay cookie). Dejá la lista de rutas protegidas configurable.

### 5. Estado de sesión en el front (Zustand)
- Store `useAuthStore` con: user, isAuthenticated, isLoading, y acciones login(), logout(), fetchSession().
- login() llama a `/api/auth/login`; logout() a `/api/auth/logout`; fetchSession() a `/api/auth/me` (para saber si hay sesión al cargar la app).
- NO guardar tokens en el store ni en localStorage — los tokens viven solo en cookies httpOnly. El store solo guarda el user y el flag de autenticado.

### 6. Refresh automático del token (5 min es muy corto)
- Implementá un interceptor/wrapper en el lado del BFF: cuando una llamada a un endpoint protegido devuelva 401 por token expirado, el BFF intenta refrescar automáticamente con el refresh token y reintenta la llamada una vez. Dejá la lógica montada aunque el endpoint de refresh sea TODO.

### 7. Páginas (UI con diseño HomeX)
- `app/login/page.tsx` — formulario de login (email + password placeholder), diseño HomeX (azul/amarillo, Montserrat), estados de loading/error, link a registro.
- `app/registro/page.tsx` — formulario de registro (campos placeholder con TODO), mismo diseño.
- `app/mi-cuenta/page.tsx` — página protegida simple que muestra el user (para probar que la sesión funciona). Si no hay sesión, el middleware redirige a /login.
- Navbar: mostrar "Iniciar sesión" si no hay sesión, o el nombre del user + "Cerrar sesión" si la hay.

## Importante
- NO uses HTML `<form>` con submit nativo que recargue; usá onSubmit con preventDefault y handlers.
- Validá inputs en el cliente (email válido, password no vacío) antes de mandar.
- Todos los TODO(Luis) bien visibles para rellenar mañana.
- Como no hay datos reales, el login va a fallar de forma controlada (API no responde / ruta placeholder). Asegurate de que el error se muestre lindo en la UI, no que rompa.

## Al terminar
Corré el proyecto, confirmá que compila y que las páginas de login/registro/mi-cuenta se ven con el diseño HomeX. Resumime: archivos creados, qué quedó como TODO(Luis), y exactamente qué datos necesito de Luis para conectar el login de verdad.
