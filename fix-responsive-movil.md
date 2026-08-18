# FIX RESPONSIVE MÓVIL — el catálogo (y el sitio) en el celular

En desktop el sitio se ve bien, pero en móvil (~375-430px de ancho) se ve mal. Como esto es un e-commerce de supermercado y la mayoría de la gente compra desde el celular, el móvil tiene que quedar impecable. Trabajá en homex-web. Revisá y corregí el layout móvil de TODO el sitio, con foco en el catálogo.

## IMPORTANTE — cómo probar en móvil de verdad
La herramienta de resize del entorno puede no reflejar el viewport real. Para verificar el layout móvil de forma confiable, abrí Chrome DevTools con emulación de dispositivo (device toolbar / responsive mode) a un ancho de ~390px (iPhone) y ~360px (Android chico), o usá el viewport de Playwright/Chromium con viewport: { width: 390, height: 844 }. NO confíes solo en las clases de Tailwind; verificá el render real a esos anchos.

## Qué revisar y corregir (móvil, 360-430px)

### Catálogo (/catalogo) — prioridad
- **Grid de productos:** en móvil deben ser 2 columnas (o 1 en pantallas muy chicas si 2 quedan apretadas). Que las cards no se desborden ni se corten. Gaps proporcionados.
- **Barra de filtros/búsqueda:** en móvil, el input de búsqueda + chips de categoría + selector de orden NO caben en una fila. Reorganizá:
  - Búsqueda en su propia fila, ancho completo.
  - Chips de categoría en fila scrolleable horizontal (overflow-x, sin romper el layout) o en un dropdown.
  - Selector de orden accesible (puede ir junto a la búsqueda o en un botón de "filtros").
  - Si la barra es sticky, que no tape contenido ni ocupe media pantalla en móvil.
- **ProductCard:** que el nombre, precio, badge y botón "agregar" quepan bien en el ancho reducido. Botón táctil (mínimo 44x44px). Precio y botón legibles.
- **Botón "Ver más":** ancho completo o centrado, táctil.

### Navbar (móvil)
- Confirmá que el menú hamburguesa funciona: los links (Inicio, Catálogo, Ofertas, Sucursales, Contacto) + "Iniciar sesión" + carrito deben ser accesibles en móvil sin romperse.
- El logo, el botón de sucursal y el carrito no deben encimarse ni desbordar.

### Carrito / Drawer (móvil)
- El drawer del carrito en móvil debería ocupar casi todo el ancho (no una tirita a la derecha). Que los controles de cantidad y el botón de pagar sean táctiles.

### Home / Hero (móvil)
- Confirmá que el hero se ve bien en móvil: texto arriba, imagen visible, botones apilados y táctiles, headline en tamaño adecuado (~40-48px, no 72px).

### Otras páginas
- Login, registro, mi-cuenta, carrito: que los formularios y contenidos se vean bien en móvil (inputs ancho completo, botones táctiles, sin scroll horizontal).

## Reglas
- NO rompas nada de lo que ya funciona en desktop ni la conexión a datos reales.
- Cero scroll horizontal en ninguna página en móvil (síntoma clásico de algo que se desborda).
- Tamaños táctiles: botones y links mínimo ~44px.
- Texto legible sin zoom (mínimo ~14-16px en body).
- Respetá el sistema de diseño HomeX (azul/amarillo/Montserrat).

## Al terminar
- Probá con emulación de móvil real (~390px y ~360px) el catálogo, home, navbar, carrito, login.
- Confirmá: cero scroll horizontal, grid de 2 columnas ok, filtros usables, botones táctiles.
- Build y lint limpios.
- Resumime qué corregiste por página y mostrame (o describí) cómo se ve el catálogo en móvil ahora.
- No hagas commit; lo reviso yo.
