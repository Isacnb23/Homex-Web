# FASE 3 — Carrito de compras (lógica y estructura, sin diseño fino)

Montá la LÓGICA completa del carrito de compras para HomeX Web. Trabajá en homex-web. Enfocate en que funcione bien por dentro; el diseño visual fino lo pulimos después (por ahora UI funcional y limpia, con el sistema de diseño HomeX, pero sin obsesionarse con el pulido).

## Contexto / decisión de arquitectura
- Por ahora el carrito es LOCAL (vive en el navegador vía Zustand). Funciona sin API, con los datos de producto que ya tenemos (tipo Product).
- IMPORTANTE (para más adelante, dejar preparado con TODO): la MercasaVIP API tiene un ShoppingCartController que requiere [Authorize]. En Fase 3-real, cuando el login esté conectado, el carrito se sincronizará con el servidor por usuario. Dejá la estructura lista para eso pero NO lo conectes ahora. Marcá los puntos de sincronización con `// TODO(sync): ...`.
- El precio del producto (Product.price) ya viene como número (el BFF parsea el Amount string). Usalo tal cual.

## Qué construir

### 1. Store del carrito (Zustand) — lib/cartStore.ts
Estado y acciones:
- `items: CartItem[]` donde `CartItem = { product: Product; quantity: number }`
- `addItem(product, quantity = 1)` — si el producto ya está, suma cantidad; si no, lo agrega.
- `removeItem(productId)` — quita el ítem completo.
- `updateQuantity(productId, quantity)` — cambia la cantidad; si llega a 0, quita el ítem.
- `clearCart()` — vacía todo.
- Selectores derivados (computados, no guardados como estado duplicado):
  - `totalItems` — suma de cantidades (para el badge del navbar).
  - `subtotal` — suma de price * quantity.
  - `itemCount` — cantidad de líneas distintas.
- Persistencia: usá el middleware `persist` de Zustand para guardar el carrito en... 

  ⚠️ CUIDADO: las instrucciones del entorno de artifacts prohíben localStorage, pero esto NO es un artifact, es una app Next real corriendo en el navegador del usuario. Acá SÍ se puede y se debe usar localStorage para persistir el carrito entre recargas. Usá el persist middleware de Zustand con localStorage. (Solo el carrito local; los tokens de auth NO van en localStorage, esos siguen en cookies httpOnly.)

- Manejá la hidratación de Next correctamente (el carrito persistido puede causar mismatch de hidratación SSR/cliente; usá el patrón de `skipHydration` o un flag `hasHydrated` para evitar warnings).

### 2. Tipos — actualizar lib/types.ts
```typescript
export interface CartItem {
  product: Product;
  quantity: number;
}
```

### 3. Botón "Agregar al carrito" en ProductCard
- En components/ProductCard.tsx, agregá un botón que llame addItem(product).
- Feedback visual al agregar (un pequeño estado "agregado ✓" temporal, o cambio de color breve). Sin exagerar.
- Si el producto no tiene stock (AvailPhysical / lógica de disponibilidad), el botón se deshabilita. (Por ahora, si no hay dato claro de stock, dejá el botón siempre activo con un TODO.)

### 4. Badge del carrito en el Navbar
- Ícono de carrito (lucide-react) en el navbar con un badge que muestra totalItems.
- Al hacer click, abre el carrito (drawer lateral o navega a /carrito — elegí drawer lateral, es mejor UX para e-commerce).
- El badge solo aparece si totalItems > 0.

### 5. Drawer/panel del carrito — components/CartDrawer.tsx
- Panel lateral que se desliza desde la derecha.
- Lista los CartItem: nombre, precio unitario, control de cantidad (+/-), subtotal por línea, botón quitar.
- Muestra el subtotal general abajo.
- Botón "Ir a pagar" que navega a /checkout (que por ahora es placeholder — la ruta ya está protegida por el proxy/middleware, así que si no hay sesión redirige a login; dejá eso así).
- Estado vacío: mensaje "Tu carrito está vacío" con link al catálogo.
- Cerrar con botón X, click fuera, o tecla Escape.

### 6. Página /carrito (opcional, respaldo del drawer)
- Una página /carrito que muestre lo mismo que el drawer pero en layout de página completa (para móviles o link directo). Reusá la lógica del store.

### 7. Formateo de precios
- Creá un helper `formatColones(n: number)` en lib/utils.ts que formatee a colones costarricenses: ₡1.650 (símbolo ₡, separador de miles con punto, sin decimales salvo que aplique). Usalo en todas partes donde se muestre precio.

## Reglas
- Toda la lógica del carrito es client-side y funciona sin API. Probala con los datos de ejemplo del catálogo.
- NO conectes el ShoppingCartController todavía; solo dejá TODO(sync) donde iría la sincronización con el servidor.
- Los tokens de auth NO tocan localStorage (siguen en cookies httpOnly). Solo el carrito local usa localStorage.
- Manejá bien la hidratación SSR de Next para que el carrito persistido no rompa ni tire warnings.
- Diseño: funcional y con el sistema HomeX (azul/amarillo, Montserrat), pero sin obsesionarse con el pulido fino — eso viene después.

## Al terminar
Corré el proyecto, probá el flujo completo con datos de ejemplo: agregar productos desde el catálogo, ver el badge subir, abrir el drawer, cambiar cantidades, quitar, ver el subtotal, recargar la página y confirmar que el carrito persiste. Confirmá que build y lint pasan. Resumime archivos creados, cómo funciona, y qué quedó como TODO(sync) para cuando conectemos el ShoppingCartController.
