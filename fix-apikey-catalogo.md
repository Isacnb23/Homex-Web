# FIX — Agregar X-Api-Key y conectar catálogo real

Descubrimos (viendo el tráfico de red del sitio oficial que SÍ funciona) que TODAS las llamadas a la MercasaVIP API requieren un header `X-Api-Key`. Sin él, la API falla (probablemente por eso el login daba "Object reference not set"). También confirmamos los parámetros reales del catálogo. Trabajá en homex-web.

## DATOS CONFIRMADOS (vistos en el Network del sitio oficial, todas status 200)

### Header obligatorio en TODAS las llamadas a la API
```
X-Api-Key: MercasaVIP-2024-Secret-Key-12345
```
Este header va en TODAS las peticiones a mercasavipapi.grupointeca.com:8130 (login, catálogo, todo). Agregarlo como header por defecto en el cliente de la API.

### Parámetros reales del catálogo
- Endpoint categorías: `GET /Inventory/HE_GetFamilies?PriceList=AF&AddressId=-1`  → status 200 ✅
- PriceList real: `AF` (no "HX-VIP" como asumíamos; ese era solo un default).
- AddressId: `-1`
- Para productos HomeX, el sitio usa el endpoint FMCM:
  `GET /Inventory/HE_GetInventoryItemsFMCM?PriceGroup=AF&AccountNum={cuenta}&AddressId=-1`
  Nota: acá el parámetro se llama `PriceGroup` (no PriceList) y pide `AccountNum`.

### Config de env (.env.local)
Actualizá:
```
MERCASAVIP_API_BASE=https://mercasavipapi.grupointeca.com:8130
MERCASAVIP_API_KEY=MercasaVIP-2024-Secret-Key-12345
MERCASAVIP_TEST_PRICELIST=AF
```
La API key NUNCA en el cliente; solo se lee en el server (BFF / lib server-only).

## QUÉ HACER

### 1. Cliente de la API (lib/mercasavip.ts y lib/auth-api.ts, server-only)
- Agregá el header `X-Api-Key` (leído de MERCASAVIP_API_KEY) a TODAS las peticiones fetch a la API, tanto en el cliente de inventario como en el de auth. Centralizá esto en un helper si conviene (ej. una función `apiFetch` que siempre incluya el header).
- Esto probablemente arregla el login también: agregá X-Api-Key a la llamada de login_HE y probá.

### 2. Catálogo — usar los parámetros reales
- `getFamilies`: llamar `/Inventory/HE_GetFamilies?PriceList=AF&AddressId=-1` con el header X-Api-Key. Devuelve un array de strings (nombres de familias).
- `getProducts`: para HomeX, usar `/Inventory/HE_GetInventoryItemsFMCM?PriceGroup=AF&AccountNum={cuenta}&AddressId=-1`. 
  - PROBLEMA: AccountNum requiere una cuenta de cliente (viene del login). Como el login está pendiente, por ahora: 
    a) Probá primero si HE_GetInventoryItems (el no-FMCM) o HE_GetInventoryItemsByFamily funcionan solo con PriceList=AF sin AccountNum. 
    b) Si FMCM requiere AccountNum sí o sí, dejá el PriceList=AF configurable y usá un AccountNum placeholder con TODO, o probá con el AccountNum que aparezca cuando el login funcione.
  - Transformá cada HE_inventItem crudo a Product (precio Amount string → número, InPromo → boolean).

### 3. Imágenes de producto
Ahora sabemos el patrón (del código de homex-20express):
```
http://186.176.206.154:8088/images/Products/{ItemId}_l_.PNG   (grande)
http://186.176.206.154:8088/images/Products/{ItemId}_s_.PNG   (chica)
```
- PROBLEMA de mixed content: esas imágenes son HTTP y tu sitio corre en HTTPS → el navegador las bloqueará.
- SOLUCIÓN: creá un route handler proxy en tu BFF, ej. `GET /api/images/[itemId]` que del lado servidor haga fetch de la imagen HTTP y la devuelva por tu HTTPS. Así el navegador solo ve HTTPS (tu dominio). Manejá el caso de imagen no encontrada (devolver un placeholder/onerror).
- En el Product, seteá `imageUrl` a `/api/images/{ItemId}` (tu proxy), no a la URL HTTP directa.

### 4. Probar
- Probá el catálogo: las categorías (HE_GetFamilies con AF) deberían venir reales ahora.
- Si getProducts necesita AccountNum y no lo tenemos, que caiga elegante al fallback de ejemplo, PERO que las categorías reales sí se muestren.
- Confirmá que el header X-Api-Key se está mandando (revisá en Network de tu propio sitio).

## Importante
- X-Api-Key y tokens SOLO en el server (BFF/lib server-only), nunca expuestos al navegador.
- Ojo: no commitear .env.local (verificá que sigue en .gitignore).
- Manejo de errores controlado en todo (nada que rompa la UI).

## Al terminar
Resumime: si el login ahora funciona con X-Api-Key, si las categorías reales cargan, qué pasa con productos (si necesita AccountNum), y si el proxy de imágenes funciona. Marcá qué queda pendiente.
