# REDISEÑO — Sección de marcas ("Marcas que construyen confianza")

Rediseñá la sección de marcas de la home para que combine con el sistema de diseño HomeX del resto del sitio, manteniendo la imagen de la vitrina de marcas que ya existe. Trabajá en homex-web. NO cambies otras secciones, solo esta.

## Qué mantener
- La IMAGEN de la vitrina de marcas (el panel con los logos: Nature Valley, Heinz, Renata, etc.) — esa imagen se queda, se ve bien. Reusala tal cual.
- El concepto: sección que comunica "trabajamos con marcas líderes / confianza".

## Qué cambiar — que combine con HomeX
Actualmente la sección tiene un fondo azul MUY oscuro (casi negro) que desentona con el resto del sitio, que usa el azul HomeX (#063B88) y amarillo (#FFD400). Ajustá:

- **Fondo/paleta:** usá el azul de marca HomeX (#063B88 / #022C6C) en vez del azul-negro actual, o un fondo claro (#FAFAF8) si queda más limpio y consistente con las secciones vecinas. Que NO desentone con la sección de arriba y de abajo. Mirá cómo son las secciones adyacentes y hacé que esta fluya con ellas.
- **Título:** "Marcas que construyen confianza" (o el que tenga) con la tipografía y jerarquía HomeX (Montserrat, peso 700/800). Si va sobre azul, texto blanco con la palabra clave en amarillo (mismo patrón que el hero: "en un solo lugar" en amarillo). Si va sobre fondo claro, título en azul HomeX.
- **Los 3 puntos** (Calidad garantizada, Alianzas estratégicas, Compromiso con el cliente): mantené el contenido, pero rediseñá los iconos y el layout para que combinen. Iconos lucide-react en amarillo HomeX. Espaciado consistente con el resto del sitio.
- **La vitrina de marcas (imagen):** presentala de forma más elegante y ordenada — un contenedor con border-radius consistente (16px), sombra suave con tinte azul de marca (como las otras cards del sitio), bien encuadrada. Que se sienta integrada, no pegada.
- **El bloque de "Explorar por categoría"** que aparece abajo (Alimentos, Bebidas, etc.): si esas son las categorías reales, que combinen con los chips/cards de categoría del resto del sitio (mismo estilo que en el catálogo/home). Consistencia.

## Combinar lo mejor de varios estilos (como pediste)
- Base: la imagen de vitrina de marcas se mantiene.
- Orden y limpieza: layout ordenado, con aire, no apiñado.
- Elegancia: sombras suaves, radios consistentes, transiciones suaves.
- Opcional (si aporta): un toque sutil de movimiento — fade-up al hacer scroll, o si querés, los 3 puntos con un stagger ligero. Nada exagerado.

## Reglas
- Sistema de diseño HomeX: azul #063B88, amarillo #FFD400, blanco, Montserrat. Consistencia total con el resto del sitio.
- Responsive: que se vea bien en móvil (imagen de vitrina escalada, los 3 puntos apilados, texto legible). Verificá con emulación real (~390px), no confíes en el resize del entorno.
- No rompas nada del resto de la home.
- Respetá prefers-reduced-motion, focus states, tamaños táctiles, alt en la imagen de marcas.
- Nota: los logos son de marcas de terceros; no cambies cuáles son ni agregues nuevos — solo el diseño del contenedor.

## Al terminar
- Probá en navegador (desktop y móvil emulado): que la sección combine con las de arriba/abajo, que la vitrina se vea integrada, que en móvil no se rompa.
- Build y lint limpios.
- Resumime qué cambiaste.
- No hagas commit; lo reviso yo.
