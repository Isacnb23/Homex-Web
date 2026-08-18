# PULIR CATÁLOGO — rápido, usable y hermoso

El catálogo ya jala datos reales (907 productos, categorías, precios en colones, imágenes por proxy). Ahora hay que hacerlo rápido, usable y hermoso. Trabajá en homex-web. Hacé los cambios en este orden (rendimiento → usabilidad → diseño) y probá al final.

## PARTE 1 — RENDIMIENTO (que no cargue 907 de un solo)

Ahora mismo se traen y renderizan los 907 productos de golpe: payload grande y lento. Mejorarlo:

- **Paginación o scroll infinito:** mostrá de a ~24-30 productos por página/tanda. Elegí una:
  - Opción A (recomendada): scroll infinito con "cargar más" — cargás la primera tanda y vas trayendo más al hacer scroll o al presionar un botón "Ver más".
  - Opción B: paginación clásica con números de página.
- **Filtrado en el servidor cuando se pueda:** si el usuario filtra por categoría, idealmente pedir solo esa categoría al BFF en vez de traer todo y filtrar en el cliente. Si el endpoint no soporta filtrar por categoría directo, filtrá en el BFF (server-side) y devolvé solo lo pedido, no las 907 al navegador.
- **Imágenes lazy:** confirmá que las imágenes usan loading="lazy" (fuera del viewport no se cargan hasta que hacen falta). El proxy de imágenes ya tiene Cache-Control; verificá que funciona.
- Usá TanStack Query (ya instalado) para caché: que al volver a una categoría ya vista no vuelva a pedir todo.

## PARTE 2 — USABILIDAD (búsqueda y filtros)

- **Búsqueda por nombre:** un input de búsqueda que filtre productos por ItemName. Debounce (~300ms) para no filtrar en cada tecla. Si el catálogo está en el cliente, filtrá ahí; si es grande, considerá buscar server-side.
- **Filtro por categoría:** las categorías reales vienen de HE_GetFamilies (Alimentos, Bebidas, etc.). Mostralas como chips/tabs/sidebar clickeables. Al elegir una, se muestran solo productos de esa categoría (Hierarchy1). Incluí un "Todas".
- **Orden:** opción de ordenar por precio (menor/mayor) y por nombre (A-Z). Selector simple.
- **Contador:** mostrá cuántos productos hay ("907 productos" o "24 en Bebidas").
- **Estado vacío:** si un filtro/búsqueda no da resultados, mensaje claro ("No encontramos productos para 'X'") con opción de limpiar filtros.

## PARTE 3 — DISEÑO (que se vea hermoso, sistema HomeX)

Recién ahora, con la funcionalidad lista, pulí lo visual. Sistema de diseño HomeX (azul #063B88 / amarillo #FFD400 / Montserrat), consistente con el resto del sitio.

- **ProductCard hermosa:**
  - Imagen del producto bien encuadrada (object-contain, fondo neutro limpio y consistente).
  - Nombre en peso 600, legible, con truncado elegante si es muy largo (2 líneas máx).
  - Precio en colones grande y protagonista (₡1.650), en azul de marca.
  - Badge de promo (cuando inPromo) amarillo, esquina superior, bien contrastado.
  - Botón "Agregar al carrito" claro, con el feedback de "agregado ✓" que ya existe.
  - Hover suave: elevación leve + sombra con tinte azul (nada brusco).
  - Placeholder elegante cuando no hay imagen (el ícono ya existe, que se vea bien).
- **Grid responsive:** 4-5 columnas en desktop, 3 en laptop, 2 en tablet, 1-2 en móvil. Gaps parejos. Que respire.
- **Barra de filtros/búsqueda:** que se vea integrada y limpia, no pegada. Sticky arriba estaría bien para que al hacer scroll siga accesible.
- **Skeletons de carga:** mientras carga una tanda de productos, mostrá skeletons (cards grises pulsando) en vez de un spinner solo o pantalla vacía. Se siente más rápido y pro.
- **Consistencia:** mismos radios (16px), mismas sombras con tinte azul, misma tipografía que el resto del sitio. Nada que desentone.

## REGLAS
- No rompas la conexión a datos reales que ya funciona (X-Api-Key, PriceList=AF, proxy de imágenes, dedup por ItemId, parseo de coma decimal).
- No expongas la API key ni nada server-only al cliente.
- Respetá prefers-reduced-motion en las animaciones.
- Mantené accesibilidad: focus states, alt en imágenes, navegación por teclado, tamaños táctiles en móvil.

## AL TERMINAR
- Probá en el navegador: que cargue rápido (no 907 de un solo), que la búsqueda y los filtros funcionen, que se vea hermoso en desktop y móvil.
- Confirmá build y lint limpios.
- Resumime qué hiciste en cada parte y si algo quedó pendiente (ej. si el filtro por categoría tuvo que ser client-side por limitación del endpoint).
- No hagas commit vos; yo lo reviso y commiteo después.
