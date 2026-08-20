# MAPA 3D — Migrar de Leaflet a MapLibre GL JS + OpenFreeMap (100% gratis, sin API key)

Reemplazá el mapa de sucursales (Leaflet) por MapLibre GL JS con mapa vectorial y terreno 3D. Trabajá en homex-web. Requisito NO NEGOCIABLE: cero API keys, cero cuentas de terceros, cero límites de uso pagos. Solo servicios abiertos sin autenticación.

## Stack a usar (todo gratis, sin key)

1. **MapLibre GL JS** + **react-map-gl** (wrapper de React) — motor de renderizado, open source.
   ```
   npm install maplibre-gl react-map-gl
   ```

2. **OpenFreeMap** como proveedor del estilo/mapa base vectorial — gratis, sin key, sin límite de uso (financiado por donaciones, no por consumo). Estilo a usar: `https://tiles.openfreemap.org/styles/liberty` (estilo "liberty", buen balance de detalle/limpieza) — verificá la URL vigente en https://openfreemap.org/ antes de usarla, puede que hayan actualizado el dominio/endpoint.

3. **Terreno 3D**: tiles de elevación abiertos de AWS (`elevation-tiles-prod`, formato Terrarium), gratis y sin key:
   ```
   https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png
   ```
   MapLibre soporta esto nativamente como fuente `raster-dem` con encoding `terrarium`.

## Datos — coordenadas actualizadas de TODAS las sucursales

Reemplazá `lib/branches-coords.ts` completo con esta lista ampliada (14 entradas, coordenadas reales verificadas por el usuario en Google Maps). Mantené la estructura y el comentario explicativo que ya tenía el archivo (clave = InventSiteId del endpoint HE_GetActiveFMCMSites; CPT sin coordenada se mantiene null si sigue sin dato real).

IMPORTANTE: como el endpoint HE_GetActiveFMCMSites sigue devolviendo solo 8 códigos (ALA, CCA, CPR, CPT, SCA, SFN, SJO, SSH — confirmado hoy más temprano en la sesión), las coordenadas nuevas que no tengan un InventSiteId conocido (San Rafael Abajo, Alajuelita, Mercedes Sur, Oreamuno, El Guarco, Desamparados, Barrio San José si es distinto de SJO, y el Centro de Distribución) NO tienen código de sitio para emparejar automáticamente. Guardalas en el mismo objeto BRANCH_COORDS igual, pero como entradas "extra" bajo una clave descriptiva propia (no un InventSiteId inventado), y agregá una función/lista separada `EXTRA_BRANCHES` para las que no vienen del endpoint. El componente del mapa debe combinar: (a) las sucursales del endpoint con su coordenada emparejada por InventSiteId, y (b) estas extra, marcadas de alguna forma como "no confirmadas por el sistema" (comentario en código, no visible al usuario si no hace falta) — mostralas igual en el mapa ya que son reales, pero dejá documentado que no vienen del endpoint oficial.

Coordenadas a agregar/actualizar:
```
Homex El Guarco: 9.848141722160909, -83.95049541489466
Homex Pitahaya: 9.849284080953415, -83.92689677695317   (ya existía como CPT, sin coord — ahora SÍ hay coordenada real, actualizarla)
Homex Oreamuno: 9.87972126089922, -83.90536259155286
Homex Plaza Radio: 9.847323393633168, -83.88943813809767   (ya existía como CPR, actualizar si difiere)
Centro de distribución HOMEX, principal: 9.84782355816272, -83.950084956878873
Homex San Francisco: 9.906575717443216, -84.04890966878872   (ya existía como SFN, actualizar si difiere)
Homex San Sebastián: 9.912578541238625, -84.09060626878872   (ya existía como SSH, actualizar si difiere)
Homex Desamparados: 9.892900138249793, -84.06376477569897
Homex San Rafael Abajo: 9.889611964976012, -84.07811249947973
Homex San Jose: 9.932523554893674, -84.0831326836259
Homex Alajuelita: 9.901817604327325, -84.09881133017076
Homex Barrio San José: 10.015245851658326, -84.22623013809769   (ya existía como SJO, actualizar si difiere)
Homex Alajuela: 10.02365694836346, -84.204512752934860   (ya existía como ALA, actualizar si difiere)
Homex Mercedes Sur: 10.004488211744155, -84.14092120740666
Homex San Carlos: 10.334217216478464, -84.43236041431693   (ya existía como SCA, actualizar si difiere)
```
Para las que ya existían con un InventSiteId conocido (ALA, CCA, CPR, CPT, SCA, SFN, SJO, SSH), ACTUALIZÁ la coordenada al valor nuevo si difiere del que ya estaba (estos son más precisos, verificados de nuevo hoy). Para las que no tienen InventSiteId, agregalas como EXTRA_BRANCHES con un id propio descriptivo (ej. `EXTRA_SAN_JOSE`, `EXTRA_CD_PRINCIPAL`, etc).

## El Centro de Distribución — tratamiento especial

"Centro de distribución HOMEX, principal" NO es una sucursal de venta al público. Mostralo en el mapa pero:
- Ícono/pin visualmente DISTINTO al de sucursales (ej. un ícono de bodega/warehouse en vez de tienda — lucide-react tiene `Warehouse`).
- Etiqueta clara: "Centro de Distribución" (no "Homex" a secas) tanto en el pin como en la lista/tarjeta de info.
- Si mostrás una lista de sucursales aparte, ponelo en su propia sección o al final, claramente diferenciado, para no confundir a un cliente que busca dónde comprar.

## Qué construir

### 1. Nuevo componente `components/BranchesMap.tsx` (reemplaza el actual de Leaflet)
- Usar `Map` de `react-map-gl/maplibre`, con `mapStyle` apuntando al estilo de OpenFreeMap.
- `initialViewState`: centrado en Costa Rica, zoom ~8, `pitch: 45` para el efecto 3D inclinado.
- Terreno: agregar `source` tipo `raster-dem` apuntando a las tiles de elevación de AWS (encoding `terrarium`), y `terrain={{ source: 'terrain-source-id', exaggeration: 1.2 }}` (exageración moderada, no exagerada — el usuario quiere "relieve moderado, no demasiado realista").
- Colores del estilo base: si el estilo Liberty de OpenFreeMap no calza con la paleta deseada (beige/gris terreno, verde suave vegetación, celeste agua, azul carreteras), investigá si OpenFreeMap permite tomar su estilo JSON y forkearlo/ajustar colores localmente (es un JSON de estilo MapLibre estándar, se puede clonar y modificar capas de color sin depender de ningún editor de pago). Si es mucho trabajo para esta pasada, dejá el estilo default de Liberty funcionando primero y documentá el ajuste de colores como mejora futura.
- Markers personalizados (custom, no el pin default): 
  - Sucursales normales: pin azul marino (#00246F) con ícono de tienda, mismo lenguaje visual que ya usábamos en Leaflet (ver el archivo actual de BranchesMap.tsx si sigue en el repo, como referencia de los colores/SVG).
  - Sucursal seleccionada: pin agrandado, amarillo (#FFD400), mostrando el wordmark "HomeX".
  - Centro de Distribución: pin distinto (otro color o forma, ícono de bodega).
- Al seleccionar una sucursal: la cámara debe volar suavemente (`flyTo` de MapLibre, con `pitch`/`zoom`/`duration` para que se sienta cinematográfico pero no lento) hasta esa ubicación.

### 2. Actualizar `components/BranchesMapLoader.tsx`
MapLibre GL también toca `window`/WebGL, así que sigue necesitando el patrón de carga dinámica con `ssr: false` que ya existe. Ajustar el import al nuevo componente si cambia de nombre.

### 3. Actualizar `components/BranchesMapWithList.tsx`
- Mantené el patrón actual (mapa + lista + tarjeta flotante al seleccionar + banner CTA opcional con showCta) pero:
  - La lista debe separar visualmente sucursales de venta vs el Centro de Distribución.
  - La tarjeta de info al seleccionar sigue mostrando nombre + botón "Cómo llegar" (Google Maps con las coords), y para el Centro de Distribución debe indicar claramente que no es un punto de venta.

### 4. CSS de MapLibre
Importar `maplibre-gl/dist/maplibre-gl.css` donde corresponda (reemplaza el import de `leaflet/dist/leaflet.css`).

### 5. Limpieza
Una vez migrado y funcionando, quitar la dependencia de `leaflet` y `react-leaflet` del `package.json` si ya no se usan en ningún lado (confirmá que no queden imports rotos).

## Reglas
- CERO API keys, cero cuentas, cero servicios que requieran configurar credenciales en .env.
- Verificá que la URL de OpenFreeMap y las tiles de AWS respondan de verdad antes de dar por terminado (probá en el navegador que las tiles cargan, no asumas).
- No inventes coordenadas ni datos — todo lo que no tengamos (direcciones, horarios) se mantiene fuera, igual que hasta ahora.
- Responsive: verificá con emulación real (~390px), la herramienta de resize de este entorno no es confiable.
- Performance: el terreno 3D es más pesado que un mapa raster plano — confirmá que la carga inicial no se sienta lenta; si hace falta, considerá cargar el terreno de forma diferida o con un zoom/pitch inicial más conservador.

## Al terminar
- Confirmá que el mapa carga con estilo vectorial, terreno 3D visible en las montañas de Costa Rica, markers personalizados, y que el flyTo funciona al seleccionar.
- Probá en desktop y móvil emulado.
- Build y lint limpios.
- Resumí: qué tan cerca quedó del estilo de colores deseado (beige/verde/celeste HomeX) vs el estilo default de OpenFreeMap, y qué faltaría para pulirlo más si no se llegó al 100%.
- No hagas commit; lo reviso yo.
