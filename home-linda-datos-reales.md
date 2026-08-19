# HOME/LANDING — linda + con datos reales de la API

Mejorá la página principal (home) de HomeX para que se vea profesional Y muestre datos reales de la API (categorías y productos), reusando la fontanería que ya existe (BFF /api/categorias, /api/productos, proxy de imágenes). Trabajá en homex-web. Mantené el sistema de diseño HomeX (azul #063B88 / amarillo #FFD400 / Montserrat) y que sea responsive (desktop + móvil), consistente con el catálogo ya pulido.

## Estructura de la home (secciones, en orden)

### 1. Hero (mejorar el existente)
- Mantené el hero HomeX: headline "Todo lo que necesitás, en un solo lugar", imagen de familia, botones, curva inferior.
- Botón primario "Ver ofertas" o "Comprar ahora" → lleva al /catalogo.
- Botón secundario "Encontrá tu sucursal" → ancla a la sección de sucursales.
- Asegurate de que se vea bien en móvil (texto arriba, headline ~40-48px, botones apilados y táctiles).

### 2. Categorías reales (DATOS REALES)
- Sección "Comprá por categoría".
- Traé las categorías reales desde /api/categorias (HE_GetFamilies → Alimentos, Bebidas, etc.).
- Mostralas como cards/tiles clickeables. Cada una lleva a /catalogo con esa categoría preseleccionada (ej. /catalogo?categoria=Bebidas — el catálogo ya soporta filtro por categoría, conectá el query param).
- Si una categoría tiene ícono/imagen disponible, usalo; si no, un tile de color con el nombre (diseño HomeX). Ojo: las categorías vienen como strings simples, no traen imagen propia — usá un diseño de tile atractivo con el nombre, o un ícono genérico por categoría.
- Fetch server-side (Server Component) para que cargue rápido y sea bueno para SEO.

### 3. Productos destacados (DATOS REALES)
- Sección "Destacados" o "Los más pedidos" (o "Ofertas" si querés destacar los inPromo).
- Traé una tanda chica de productos reales (ej. los primeros 8-12, o los que tienen inPromo === true) desde el BFF.
- Reusá el ProductCard que ya existe (con imagen por proxy, precio en colones, botón agregar al carrito).
- Un botón "Ver todo el catálogo" → /catalogo.
- Que sea una fila/grid compacto, no las 907; solo un vistazo para enganchar.

### 4. Banda de beneficios (estática)
- La banda azul con 4 beneficios (Precios bajos, Productos frescos, Atención cercana, Siempre cerca) con iconos lucide-react amarillos. Si ya existe, mantenela; si no, agregala.

### 5. Sucursales (estática por ahora)
- Sección "Estamos cerca de vos" con el mapa (imagen) y botón. Mantené lo que haya, o simplificá. (Los datos reales de sucursales — HE_GetActiveFMCMSites — los podemos conectar después; por ahora estático está bien.)

### 6. Footer
- El footer HomeX que ya existe.

## Reglas técnicas
- Las secciones con datos reales (categorías, productos) deben usar el BFF existente, NO llamar la API externa directo desde el cliente. Reusá /api/categorias y /api/productos (o funciones server-side de lib/mercasavip.ts en Server Components).
- Manejo de errores: si la API no responde, la home NO debe romperse — mostrá un fallback elegante (ej. las categorías/productos de ejemplo, o esconder la sección con gracia). La home tiene que cargar siempre.
- Loading: si alguna sección carga async, skeleton o carga progresiva, no pantalla en blanco.
- Reusá componentes existentes (ProductCard, CategoryCard) en vez de duplicar.
- Performance: la home es la página más visitada, priorizá su carga. Imágenes lazy salvo el hero.
- Responsive: todo bien en móvil (verificá con emulación real ~390px, como en el fix anterior — la herramienta de resize del entorno no es confiable, usá iframe de ancho fijo o viewport de Playwright).
- Respetá prefers-reduced-motion, focus states, tamaños táctiles 44px, alt en imágenes.

## Animaciones (elegantes, sin exagerar)
- Fade-up sutil en las secciones al hacer scroll (stagger ligero en las cards de categoría/productos).
- Nada de parallax exagerado ni elementos flotando. Prioridad: elegancia y rendimiento.

## Al terminar
- Probá en el navegador (desktop y móvil emulado): que el hero se vea bien, que las categorías reales carguen y lleven al catálogo filtrado, que los productos destacados se muestren con datos reales, que no haya scroll horizontal en móvil.
- Confirmá que si la API falla, la home no se rompe (fallback).
- Build y lint limpios.
- Resumime qué secciones quedaron con datos reales vs estáticas, y qué quedó pendiente.
- No hagas commit; lo reviso yo.
