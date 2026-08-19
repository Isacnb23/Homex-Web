# SUCURSALES REALES — mapa interactivo con Leaflet + OpenStreetMap

Conectá la sección/página de sucursales de HomeX con datos reales de la API y mostralas en un mapa interactivo (Leaflet + OpenStreetMap, gratis, sin API key de pago). Trabajá en homex-web. Sistema de diseño HomeX (azul/amarillo/Montserrat), responsive.

## PASO 1 — PRIMERO: ver qué devuelve el endpoint (crítico, antes de codear el mapa)
El endpoint `HE_GetActiveFMCMSites` es público ([AllowAnonymous]). Antes de armar nada, probalo y mostrame EXACTAMENTE qué campos devuelve cada sucursal.
- Llamalo vía el patrón que ya usás (con X-Api-Key desde el server). Probá:
  `GET {MERCASAVIP_API_BASE}/Inventory/HE_GetActiveFMCMSites` (con los params que pida; si tira 400 por falta de parámetro, el error dirá cuál — probá con PriceList=AF u otros como los demás endpoints).
- Mostrame el JSON crudo de 1-2 sucursales de ejemplo.
- LO MÁS IMPORTANTE: ¿trae coordenadas (latitud/longitud)? Buscá campos tipo Lat, Lng, Latitude, Longitude, Coordinates, GPS, o similares.
- También: nombre de la sucursal, dirección, horario, teléfono — lo que venga.

### Según lo que traiga:
- **Si trae lat/lng** → usalas directo para los pines. Ideal.
- **Si NO trae coordenadas** (solo nombre/dirección texto) → NO inventes coordenadas. Paralo ahí y avisame: te diré si geocodificamos las direcciones o si conseguimos las coordenadas de otra forma. No pongas pines en ubicaciones inventadas.

Mostrame el resultado del PASO 1 y, si hay coordenadas, seguí con el resto. Si no las hay, pará y reportá.

## PASO 2 — BFF: endpoint de sucursales
- Route handler `GET /api/sucursales` que llama HE_GetActiveFMCMSites (con X-Api-Key, server-side), transforma cada sucursal a un modelo limpio:
```typescript
export interface Branch {
  id: string;
  name: string;
  address: string;
  lat: number;       // si viene
  lng: number;       // si viene
  phone?: string;
  hours?: string;
}
```
- Parseo defensivo (coordenadas pueden venir como string, igual que el Amount del catálogo — parsealas a número, ojo con coma decimal).
- Manejo de error controlado (si la API falla, no romper; devolver error controlado).

## PASO 3 — Mapa con Leaflet
- Instalá `leaflet` y `react-leaflet` (versión compatible con React 19 / Next 16; verificá compatibilidad, react-leaflet v4+ suele andar; si hay problema de versión, decímelo).
- IMPORTANTE (Next + Leaflet): Leaflet usa `window`, que no existe en SSR. Cargá el mapa como client component con `'use client'`, y si hace falta, import dinámico con `ssr: false` para evitar errores de hidratación. El CSS de Leaflet (`leaflet/dist/leaflet.css`) hay que importarlo.
- Mapa centrado en Costa Rica (o en el centroide de las sucursales), zoom que muestre todas.
- Un pin por sucursal. Los íconos default de Leaflet a veces se rompen en bundlers — configurá el icono correctamente (o usá un ícono custom con los colores HomeX, azul/amarillo, sería un plus).
- Popup al hacer click en un pin: nombre, dirección, teléfono/horario si hay.

## PASO 4 — Sección/página de sucursales
- Layout: el mapa + una lista de sucursales al lado (o abajo en móvil). Al hacer click en una sucursal de la lista, el mapa hace zoom/centra en ese pin (interacción linda).
- Cada item de la lista: nombre, dirección, teléfono/horario.
- Responsive: en desktop mapa + lista lado a lado; en móvil apilados (mapa arriba, lista abajo), mapa con altura razonable (no que ocupe toda la pantalla). Verificá con emulación real (~390px), la herramienta de resize del entorno no es confiable.
- Reemplazá/mejorá la sección de sucursales estática que ya existe en la home (la del mapa-imagen) para que enlace o use esto, o dejá la home con un preview y el mapa completo en una página /sucursales. Elegí lo que quede más limpio.

## Reglas
- Todo lo que toca la API externa pasa por el BFF (X-Api-Key server-only, nunca al cliente).
- Si la API de sucursales falla, fallback elegante (mensaje o sucursales de ejemplo), la página no se rompe.
- Sin coordenadas inventadas: si no hay lat/lng reales, parar y reportar (ver PASO 1).
- Responsive, táctil (44px), accesible, prefers-reduced-motion.
- No expongas secretos.

## Al terminar
- Reportá qué campos trajo HE_GetActiveFMCMSites (sobre todo si había coordenadas).
- Si hay mapa: probá en navegador (desktop y móvil emulado) que los pines salgan, los popups funcionen, y la lista interactúe con el mapa.
- Build y lint limpios.
- Resumí qué quedó real vs pendiente. No hagas commit; lo reviso yo.
