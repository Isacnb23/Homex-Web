import 'server-only'
import { apiFetch } from './api-client'
import type { HE_FamilyRaw, HE_InventItemRaw, Product, Category } from './types'

const API_BASE = process.env.MERCASAVIP_API_BASE

// PriceList/PriceGroup real de HomeX (AF), confirmado viendo el sitio oficial.
const PRICE_LIST = process.env.MERCASAVIP_TEST_PRICELIST ?? 'AF'

export type MercasaVipResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

function assertApiBase(): string {
  if (!API_BASE) {
    throw new Error(
      'MERCASAVIP_API_BASE no está configurada. Revisá .env.local.'
    )
  }
  return API_BASE
}

async function fetchFromMercasaVip<T>(path: string, params: Record<string, string>): Promise<MercasaVipResult<T>> {
  try {
    const base = assertApiBase()
    const url = new URL(path, base)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }

    const res = await apiFetch(url)

    if (!res.ok) {
      return {
        ok: false,
        error: `MercasaVIP API respondió ${res.status} ${res.statusText}`,
      }
    }

    const data = (await res.json()) as T
    return { ok: true, data }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error desconocido llamando a MercasaVIP API',
    }
  }
}

export async function getFamilies(
  addressId = '-1'
): Promise<MercasaVipResult<HE_FamilyRaw[]>> {
  return fetchFromMercasaVip<HE_FamilyRaw[]>('/Inventory/HE_GetFamilies', {
    PriceList: PRICE_LIST,
    AddressId: addressId,
  })
}

// HE_GetInventoryItems pide un ItemId puntual (400 si falta) — sirve para
// buscar/consultar un producto específico, no para listar el catálogo entero.
export async function getInventoryItems(
  itemId: string
): Promise<MercasaVipResult<HE_InventItemRaw[]>> {
  return fetchFromMercasaVip<HE_InventItemRaw[]>('/Inventory/HE_GetInventoryItems', {
    PriceList: PRICE_LIST,
    ItemId: itemId,
  })
}

// Endpoint real que usa el sitio oficial para listar el catálogo de HomeX.
// AccountNum es opcional (confirmado: sin él igual devuelve 200 con precios de
// lista); cuando el usuario está logueado se lo pasamos para precios
// personalizados por cuenta. // TODO(sync): revisar si con AccountNum de un
// cliente real la API devuelve precios/promos distintos a los de lista.
export async function getInventoryItemsFMCM(
  accountNum?: string,
  addressId = '-1'
): Promise<MercasaVipResult<HE_InventItemRaw[]>> {
  return fetchFromMercasaVip<HE_InventItemRaw[]>('/Inventory/HE_GetInventoryItemsFMCM', {
    PriceGroup: PRICE_LIST,
    AddressId: addressId,
    ...(accountNum ? { AccountNum: accountNum } : {}),
  })
}

export function toProduct(raw: HE_InventItemRaw): Product {
  // El Amount viene con coma como separador decimal, ej. "1534,6500000000000000".
  const price = Number.parseFloat(raw.Amount.replace(',', '.'))

  return {
    id: raw.ItemId,
    name: raw.ItemName,
    price: Number.isFinite(price) ? price : 0,
    unit: raw.UnitId,
    category: raw.Hierarchy1,
    inPromo: raw.InPromo === 1,
    // Proxeado por nuestro BFF: la imagen real vive en HTTP plano (mixed
    // content si se pide directo desde un sitio HTTPS). Ver app/api/images/[itemId].
    imageUrl: `/api/images/${encodeURIComponent(raw.ItemId)}`,
    site: raw.SiteName,
  }
}

export function toCategory(raw: HE_FamilyRaw): Category {
  return { id: raw, name: raw }
}

// HE_GetInventoryItemsFMCM devuelve una fila por combinación item+sucursal,
// así que el mismo ItemId aparece repetido una vez por cada sitio con stock.
// Para el catálogo (no filtrado por sucursal) nos quedamos con la primera
// aparición de cada ItemId. // TODO: cuando haya selección de sucursal, usar
// AddressId/InventSiteId real en vez de deduplicar a ciegas.
export function toProducts(raw: HE_InventItemRaw[]): Product[] {
  const seen = new Set<string>()
  const products: Product[] = []

  for (const item of raw) {
    if (seen.has(item.ItemId)) continue
    seen.add(item.ItemId)
    products.push(toProduct(item))
  }

  return products
}
