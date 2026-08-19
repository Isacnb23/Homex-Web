# MAPA DE SUCURSALES — embeberlo en la HOME (no en página aparte)

Ahora la sección "Estamos cerca de vos" de la home tiene un botón "Ver mapa de sucursales" que redirige a /sucursales. El cambio que quiero: que el MAPA INTERACTIVO se muestre DIRECTAMENTE ahí en la home, embebido en esa misma sección, sin redirigir a otra página. Trabajá en homex-web.

## Qué hacer
1. En la sección "Estamos cerca de vos" de la home, reemplazá el placeholder + botón "Ver mapa de sucursales" por el MAPA Leaflet real (el mismo componente que ya se armó para /sucursales), embebido inline en la home.
2. El mapa muestra los pines de las sucursales reales (los que ya se emparejaron con las coordenadas). Popups al click con el nombre.
3. Debajo o al lado del mapa, la lista de sucursales (opcional pero recomendado): click en una sucursal → el mapa centra en ese pin. Si en la home ocupa mucho, puede ser una lista compacta o solo el mapa.

## Sobre la página /sucursales
- Podés DEJARLA como está (para quien entre por link directo o para SEO), o eliminarla si preferís todo en la home. Recomendación: dejala, pero que la home ya tenga el mapa completo funcional para que nadie NECESITE ir a /sucursales. El objetivo es que en la home ya se vea y se use el mapa sin redirección.
- Si dejás /sucursales, que reuse el mismo componente de mapa (no dupliques código).

## Cuidado técnico (Next + Leaflet)
- El mapa es client component ('use client') con import dinámico ssr:false (Leaflet usa window, no existe en SSR). La home es Server Component — asegurate de que el mapa embebido se cargue como client island correctamente, sin romper el SSR de la home ni tirar error de hidratación.
- Si el mapa tarda en cargar, mostrá un placeholder/skeleton con la altura del mapa (para que no salte el layout).

## Diseño y responsive
- El mapa en la home con una altura razonable (ej. 400-450px desktop, ~300px móvil) — que no ocupe pantallas enteras ni sea una tirita.
- Bordes redondeados (16px), consistente con el sistema HomeX. Que se integre lindo en la sección, no que desentone.
- Responsive verificado con emulación real (~390px). En móvil: mapa arriba, lista abajo (o solo mapa si la lista estorba).
- Mantené el título "Estamos cerca de vos" y el subtítulo.

## Reglas
- No rompas la conexión a datos reales (BFF /api/sucursales, X-Api-Key server-only).
- Fallback elegante si la API falla (mensaje o mapa sin pines, no pantalla rota).
- La home debe seguir cargando bien (el mapa es una isla client dentro de la home server).
- Táctil, accesible, prefers-reduced-motion.

## Al terminar
- Probá en el navegador (desktop y móvil emulado): que el mapa se vea DENTRO de la home, con los pines, sin redirigir. Que la home no se rompa ni tire errores de hidratación.
- Build y lint limpios. No hagas commit; lo reviso yo.
