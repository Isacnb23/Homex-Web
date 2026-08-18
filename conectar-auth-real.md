# CONECTAR AUTH REAL — reemplazar los TODO(Luis) con los datos verdaderos

Ya tenemos el flujo de login real del código de MercasaVIP.Api. Los placeholders que se pusieron en la Fase 2 (rutas HE_Login, campos email/accessToken) están INCORRECTOS. Corregilos con la info real de abajo. Trabajá en homex-web.

## DATOS REALES DE LA API (confirmados leyendo el AuthenticationController)

### LOGIN — es GET con query string (NO POST con body JSON)
```
GET {MERCASAVIP_API_BASE}/Authentication/login_HE?Id={id}&password={password}&AppId=2
```
- `Id` (string): identificador del cliente (VATNUM/CustomerId). NO es email.
- `password` (string).
- `AppId`: SIEMPRE 2 para HomeX Express (1 sería MercasaVIP). Poné 2 como constante para este proyecto.
- ⚠️ La contraseña viaja en la query string (mala práctica del sistema, pero así es). Como TODO nuestro pasa por el BFF server-side, al menos NO queda expuesta en el navegador del cliente. Igual dejá un comentario notando este riesgo.

### Respuesta del login — LoginResponseDto
```json
{
  "tokens": { "Token": "<access-jwt>", "RefreshToken": "<refresh-string>" },
  "result": "SUCCESS",
  "IsCorrect": true
}
```
- El ACCESS token se llama `tokens.Token` (¡no accessToken!).
- El REFRESH token se llama `tokens.RefreshToken`.
- Login exitoso cuando `result === "SUCCESS"`. Si no, credenciales inválidas.
- NO hay expiresIn ni tokenType en la respuesta. (El access dura 5 min, el refresh 7 días, según config — manejalo por tiempo conocido, no viene en el body.)

### REGISTRO — también GET query string
```
GET {MERCASAVIP_API_BASE}/Authentication/UserRegisterHE?Id={id}&password={password}
```
- Solo `Id` + `password`. Devuelve un string plano de resultado (no objeto).
- (Nota: RegisterNewCustomer existe para alta completa de cliente vía AIF, pero para registro básico es UserRegisterHE.)

### REFRESH — este SÍ es POST con body JSON (el único)
```
POST {MERCASAVIP_API_BASE}/Authentication/RefreshCredentials
body: { "CustomerId": "<id>", "RefreshToken": "<refresh>", "AppId": 2 }
```
- Respuesta: mismo LoginResponseDto. Si falla, `IsCorrect: false` y sin tokens.

### DATOS DEL USUARIO — vienen dentro del JWT (claims), no en un endpoint aparte
El access token (JWT) contiene estos claims:
- `nameid` (ClaimTypes.NameIdentifier) → AccountNum del cliente
- `unique_name` (ClaimTypes.Name) → nombre del cliente (CustomerName)
- `email` (ClaimTypes.Email) → email del cliente
- `jti` → id único del token
Para obtener los datos del usuario, DECODIFICÁ el JWT en el BFF (no verificar firma para leer claims, pero sí podés) y extraé nameid/unique_name/email. Usá una librería como `jose` o decodificá el payload base64 manualmente en el server. NO decodifiques el token en el cliente.

## QUÉ CORREGIR

1. **lib/auth-types.ts**: 
   - `LoginCredentials` → cambiar a `{ id: string; password: string }` (NO email).
   - `AuthTokens` → los campos reales son `Token` y `RefreshToken`. Podés mapearlos internamente a nombres más claros (accessToken/refreshToken) al recibirlos, pero documentá el mapeo.
   - `AuthUser` → `{ accountNum: string; name: string; email: string }` (de los claims del JWT).

2. **lib/auth-api.ts** (server-only):
   - `login(id, password)`: hacer GET a `/Authentication/login_HE?Id=...&password=...&AppId=2`. Encodeá bien los query params (encodeURIComponent). Chequear `result === "SUCCESS"`. Devolver tokens (Token, RefreshToken) o error.
   - `register(id, password)`: GET a `/Authentication/UserRegisterHE`.
   - `refresh(customerId, refreshToken)`: POST a `/Authentication/RefreshCredentials` con el body JSON. Chequear `IsCorrect`.
   - Definir `const APP_ID = 2;` (HomeX Express) como constante.

3. **app/api/auth/login/route.ts** (BFF):
   - Recibir `{ id, password }` del front.
   - Llamar auth-api.login. Si OK: decodificar el JWT para sacar los datos del user, setear cookies httpOnly con el access token (`Token`) y refresh token (`RefreshToken`), devolver el user (sin tokens en el body).
   - Guardar también el `id`/CustomerId en cookie o derivarlo del claim nameid, porque lo vas a necesitar para el refresh (RefreshCredentials pide CustomerId).

4. **app/api/auth/refresh/route.ts**: usar RefreshCredentials real con CustomerId + RefreshToken de las cookies.

5. **app/api/auth/me/route.ts**: leer el access token de la cookie, decodificar el JWT, devolver el user de los claims.

6. **lib/auth-fetch.ts**: el header de auth para endpoints protegidos es `Authorization: Bearer {Token}`. Confirmá que usa el token correcto.

7. **Páginas de login/registro**: cambiar el campo "email" por "Id / identificación" (o el label que corresponda al VATNUM/cédula del cliente). El registro solo pide Id + password.

## Probar (ahora SÍ puede funcionar de verdad, si el API responde)
- Necesitás credenciales de prueba válidas (un Id + password real de un cliente de prueba). Si no tenés, el login va a devolver result != SUCCESS de forma controlada — está bien, la estructura queda correcta. Anotá que falta un usuario de prueba.
- Confirmá build y lint limpios.

## Al terminar
Resumime qué corregiste, y qué falta para probar login real (básicamente: credenciales de un cliente de prueba). Marcá si algún dato quedó ambiguo.
