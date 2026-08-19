# SUCURSALES — mapa Leaflet con coordenadas reales

Armá el mapa interactivo de sucursales de HomeX. Ya tengo las coordenadas reales (abajo). Trabajá en homex-web. Leaflet + OpenStreetMap (gratis, sin API key). Sistema de diseño HomeX, responsive.

## PASO 1 — Traer el endpoint y EMPAREJAR por nombre
El endpoint `HE_GetActiveFMCMSites` (público, ya probado, responde 200 con X-Api-Key) devuelve las sucursales ACTIVAS con: InventSiteId (código), InventLocationId, Description (nombre, ej. "URBANO - HOMEX ALAJUELA"). NO trae coordenadas.

Yo conseguí las coordenadas reales por Google Maps (lista abajo). Tu tarea:
1. Traé la lista completa y actual del endpoint (con X-Api-Key, server-side).
2. Emparejá cada sucursal del endpoint con su coordenada de mi lista, por nombre/ciudad (ej. Description "URBANO - HOMEX ALAJUELA" ↔ "Homex • Alajuela" de mi lista).
3. Reportame el emparejamiento: qué sucursales del endpoint encontraron su coordenada, cuáles no, y si sobran coordenadas mías que no están en el endpoint.

IMPORTANTE sobre qué mostrar: mostrá en el mapa SOLO las sucursales que devuelve el endpoint (son las oficialmente activas), emparejadas con su coordenada. Si una sucursal del endpoint no tiene coordenada en mi lista, reportala (no la muestres con coordenada inventada, o mostrala en la lista sin pin). Si tengo coordenadas de sucursales que el endpoint NO devuelve, no las muestres (no están activas) pero avisame cuáles son.

## MIS COORDENADAS (reales, de Google Maps)
```
Homex San Francisco:            9.900188, -84.049063
Homex San Sebastián:            9.910688, -84.090688
Homex Desamparados:             9.891313, -84.062938
Homex San Rafael Abajo:         9.888563, -84.078063
Homex Alajuelita:               9.901688, -84.098688
Homex Alajuela:                 10.022688, -84.204063
Homex Barrio San José:          10.014313, -84.226438
Homex San Carlos:               10.333035, -84.431749
Homex Cartago / Cd. de Oro:     9.847313, -83.926938
Homex El Guarco:                9.846188, -83.950438
Homex Oreamuno:                 9.878938, -83.905313
Homex Plaza Radio / Paraíso:    9.845170, -83.889740
Homex Mercedes Sur / Heredia:   10.003063, -84.141063
```
Poné estas coordenadas en un archivo de config (ej. lib/branches-coords.ts) como un mapa/objeto, para que el emparejamiento sea por código de sucursal (InventSiteId) o por nombre normalizado. Así, si mañana el endpoint agrega una sucursal, solo se agrega su coordenada acá.

## PASO 2 — BFF: /api/sucursales
- Route handler que llama HE_GetActiveFMCMSites (X-Api-Key server-side), y combina cada sucursal con su coordenada del config.
- Modelo limpio:
```typescript
export interface Branch {
  id: string;        // InventSiteId
  name: string;      // Description, limpiado (ej. "HomeX Alajuela")
  lat: number | null;
  lng: number | null;
}
```
- Manejo de error controlado (fallback si la API falla).

## PASO 3 — Mapa Leaflet
- Instalá leaflet + react-leaflet (compatibles con React 19/Next 16; si hay problema de versión avisá).
- CUIDADO Next+Leaflet: Leaflet usa window (no existe en SSR). Componente 'use client' + import dinámico con ssr:false. Importá leaflet/dist/leaflet.css. Configurá bien el ícono del marker (los default de Leaflet se rompen en bundlers) — o usá un pin custom con colores HomeX (azul/amarillo) como plus.
- Mapa centrado en Costa Rica (o en el centroide de las sucursales), zoom que muestre todas.
- Un pin por sucursal con coordenada. Popup al click: nombre de la sucursal.

## PASO 4 — Página/sección de sucursales
- Página /sucursales (o mejorar la sección de la home): mapa + lista de sucursales al lado (desktop) o apilados (móvil, mapa arriba).
- Click en una sucursal de la lista → el mapa centra/hace zoom en ese pin.
- Reemplazá la sección estática de la home (mapa-imagen) por un preview o link a esta página; el mapa real vive en /sucursales.
- Responsive verificado con emulación real (~390px, iframe de ancho fijo como en tareas anteriores; la herramienta de resize del entorno no es confiable). Mapa con altura razonable en móvil, no que ocupe toda la pantalla.

## Reglas
- API externa solo por el BFF (X-Api-Key server-only).
- Sin coordenadas inventadas: emparejar solo con mi lista real.
- Fallback elegante si la API falla.
- Táctil 44px, accesible, prefers-reduced-motion.
- No expongas secretos.

## Al terminar
- Reportá el emparejamiento (qué sucursales del endpoint quedaron con pin, cuáles sin, coordenadas mías que sobraron).
- Probá en navegador (desktop y móvil emulado): pines correctos, popups, interacción lista↔mapa.
- Build y lint limpios. No hagas commit; lo reviso yo.
