# FIX — mapa se ve en blanco/beige (solo pines, sin tiles) + sucursales más cercanas

## PARTE 1 — Diagnosticar y arreglar el mapa en blanco (prioridad)

En el navegador real (no en la pestaña automatizada en background), el mapa se ve así: fondo completamente beige/blanco liso, SIN calles, SIN terreno, SIN agua — pero los pines SÍ se ven flotando sobre ese fondo vacío, y el atributo "MapLibre | OpenFreeMap..." también se ve. Confirmamos con curl que el estilo, TileJSON y tiles .pbf responden 200 con contenido real. El problema es de renderizado en pantalla, no de red.

Esto es un patrón de bug conocido en MapLibre GL JS: si el contenedor del mapa mide 0x0 (o un tamaño incorrecto) en el momento en que MapLibre se inicializa, el canvas WebGL queda mal dimensionado y nunca se refresca solo, aunque los datos hayan cargado bien. Causas típicas a revisar, en orden de probabilidad:

1. **El componente `Reveal` que envuelve al mapa** (fade-up con IntersectionObserver, probablemente usando opacity/transform/display en el montaje inicial) puede estar ocultando o colapsando el contenedor del mapa en el momento exacto en que `Map` de react-map-gl se monta y mide su tamaño. Revisá cómo Reveal oculta el contenido antes de animar (¿`opacity-0`? ¿`display:none`? ¿`scale-95`?) — si usa algo que afecte el layout (no solo opacity), ahí está el bug.

2. **Falta de `map.resize()` tras el montaje/cuando el contenedor se hace visible.** react-map-gl expone la instancia del mapa vía `ref` — agregá un `useEffect` que llame `.resize()` en el mapRef después de que el componente sea visible (por ejemplo, con un `ResizeObserver` en el contenedor padre, o llamando resize() en un `onLoad` del mapa Y de nuevo con un pequeño delay/rAF después del montaje, y también cuando cambie el `IntersectionObserver` de Reveal a visible).

3. Confirmá que `maplibre-gl/dist/maplibre-gl.css` esté importado correctamente y no esté siendo sobreescrito/purgado por Tailwind (a veces las clases de maplibre-gl-canvas quedan sin las reglas de tamaño si el CSS se importa en un orden raro).

### Enfoque de arreglo sugerido
La forma más robusta: sacar el mapa de dentro de `Reveal` (que no se anime con fade el mapa en sí, o envolver solo su contenedor exterior con Reveal pero asegurando que el contenedor interno del `Map` tenga altura/ancho fijos por CSS todo el tiempo, sin depender de opacity para el layout) + agregar un `ResizeObserver` en el div contenedor que llame `mapRef.current?.resize()` cada vez que el tamaño del contenedor cambie (esto cubre el caso de Reveal, sidebar que colapsa, cambios de viewport, etc. de una vez, sin tener que adivinar la causa exacta).

Implementá esto, probalo en un navegador real (screenshot real, no la pestaña automatizada en background — usá el mismo método con el que se confirmaron los pines si hace falta, pero verificá visualmente que las calles/terreno se pinten), y no des el fix por bueno hasta confirmar con una captura que el fondo del mapa muestra el mapa vectorial real, no beige liso.

## PARTE 2 — Sucursales más cercanas (geolocalización opcional)

Agregar la opción de ordenar/destacar las sucursales por cercanía al usuario, usando la Geolocation API del navegador (con permiso explícito, nunca automático/forzado).

### Comportamiento
- Un botón/chip visible en la sección de sucursales, tipo "Ver las más cercanas a mí" (ícono de ubicación).
- Al hacer click, pedir permiso de geolocalización (`navigator.geolocation.getCurrentPosition`).
  - Si el usuario acepta: calcular distancia (fórmula de Haversine, en km) desde su ubicación a cada sucursal con coordenadas reales, reordenar la lista de sucursales de más cerca a más lejos, y mostrar la distancia aproximada junto a cada nombre (ej. "HomeX Cartago · 4.2 km"). Opcional: centrar/ajustar el mapa para mostrar al usuario y la sucursal más cercana.
  - Si el usuario RECHAZA el permiso o el navegador no soporta geolocalización: no romper nada, mostrar un mensaje breve y discreto (ej. "No pudimos acceder a tu ubicación") y dejar la lista como está (orden actual). Nunca bloquear ni insistir.
  - Mientras se obtiene la ubicación: estado de carga breve en el botón (spinner), sin bloquear el resto de la UI.
- El Centro de Distribución NO debería aparecer como "más cercano recomendado" para un cliente (no es punto de venta) — excluirlo del cálculo de "más cercana" o dejarlo aparte igual que ya está separado en la lista.
- Privacidad: la ubicación del usuario se usa SOLO en el cliente (cálculo de distancia en el navegador), nunca se manda a ningún servidor ni se guarda. Dejalo documentado en un comentario.

### Dónde implementarlo
En `components/BranchesMapWithList.tsx`: agregar el estado de geolocalización, el botón, la función de distancia Haversine (puede vivir en un helper nuevo `lib/geo.ts`), y el reordenamiento de la lista de sucursales de venta (no tocar la sección del Centro de Distribución).

## Reglas
- No rompas nada de lo que ya funciona (pines custom, tarjeta de info, flyTo, separación del Centro de Distribución).
- Cero API keys nuevas — la Geolocation API es nativa del navegador, no necesita ninguna.
- Responsive y accesible (botón con foco visible, tamaño táctil 44px).
- Verificación visual REAL del fix del mapa (no solo status 200 de red) antes de dar por terminado.

## Al terminar
- Confirmá con una descripción clara (o si podés, una captura) que el mapa ahora SÍ muestra el terreno/calles/agua, no fondo beige liso.
- Confirmá que el botón de "más cercanas" funciona: pedís permiso, ordena por distancia, maneja el rechazo con gracia.
- Build y lint limpios.
- No hagas commit; lo reviso yo.
