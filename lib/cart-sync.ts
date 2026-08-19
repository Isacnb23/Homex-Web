import 'server-only'
import { fetchProtected } from './auth-fetch'
import { APP_ID, normalizeId } from './auth-api'

export type CartSyncResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

async function callCartEndpoint(
  path: string,
  params: Record<string, string>
): Promise<CartSyncResult> {
  try {
    const search = new URLSearchParams(params).toString()
    const res = await fetchProtected(`/ShoppingCart/${path}?${search}`, { method: 'GET' })

    if (!res.ok) {
      return { ok: false, error: `ShoppingCart API respondió ${res.status}` }
    }

    // GenericResult es { RESULT: string }, sin más info.
    const body = (await res.json()) as { RESULT?: string }
    return { ok: true, message: body.RESULT ?? '' }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error desconocido sincronizando el carrito',
    }
  }
}

// vatNum: la cédula CON guiones (la misma que se usó para el login, guardada
// en la cookie CUSTOMER_ID_COOKIE). El ShoppingCartController de MercasaVIP
// no tiene ningún endpoint de LECTURA (solo Create/Update/Delete) — el
// carrito local (Zustand) sigue siendo la fuente de verdad para lo que ve el
// usuario; esto solo reporta cada acción al servidor en paralelo
// ("write-through"), sin bloquear ni depender de la respuesta.
export function syncAddLine(
  vatNum: string,
  itemId: string,
  quantity: number,
  unitId: string
): Promise<CartSyncResult> {
  return callCartEndpoint('CreateShoppingCarLine', {
    HomexApp: String(APP_ID),
    ItemId: itemId,
    Quantity: String(quantity),
    UnitId: unitId,
    VATNum: normalizeId(vatNum),
  })
}

export function syncUpdateLine(
  vatNum: string,
  itemId: string,
  quantity: number,
  unitId: string
): Promise<CartSyncResult> {
  return callCartEndpoint('UpdateShoppingCarLine', {
    HomexApp: String(APP_ID),
    ItemId: itemId,
    Quantity: String(quantity),
    UnitId: unitId,
    VATNum: normalizeId(vatNum),
  })
}

export function syncRemoveLine(
  vatNum: string,
  itemId: string,
  unitId: string
): Promise<CartSyncResult> {
  // El controller pide Quantity aunque el SP de borrado no lo use; mandamos 0.
  return callCartEndpoint('DeleteShoppingCarLine', {
    HomexApp: String(APP_ID),
    ItemId: itemId,
    Quantity: '0',
    UnitId: unitId,
    VATNum: normalizeId(vatNum),
  })
}