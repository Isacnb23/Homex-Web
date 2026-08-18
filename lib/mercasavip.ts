import 'server-only'
import type { HE_FamilyRaw, HE_InventItemRaw, Product, Category } from './types'

const API_BASE = process.env.MERCASAVIP_API_BASE

// TODO: Luis todavía no nos dio el PriceList real de HomeX. Usamos un
// placeholder leído de env hasta que lo tengamos.
const TEST_PRICELIST = process.env.MERCASAVIP_TEST_PRICELIST ?? 'PENDIENTE_PRICELIST'

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

    const res = await fetch(url, { cache: 'no-store' })

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

// TODO: AddressId real todavía no lo tenemos de Luis.
export async function getFamilies(
  addressId = 'PENDIENTE_ADDRESSID'
): Promise<MercasaVipResult<HE_FamilyRaw[]>> {
  return fetchFromMercasaVip<HE_FamilyRaw[]>('/Inventory/HE_GetFamilies', {
    PriceList: TEST_PRICELIST,
    AddressId: addressId,
  })
}

export async function getInventoryItems(
  itemId = ''
): Promise<MercasaVipResult<HE_InventItemRaw[]>> {
  return fetchFromMercasaVip<HE_InventItemRaw[]>('/Inventory/HE_GetInventoryItems', {
    PriceList: TEST_PRICELIST,
    ItemId: itemId,
  })
}

export function toProduct(raw: HE_InventItemRaw): Product {
  const price = Number.parseFloat(raw.Amount)

  return {
    id: raw.ItemId,
    name: raw.ItemName,
    price: Number.isFinite(price) ? price : 0,
    unit: raw.UnitId,
    category: raw.Hierarchy1,
    inPromo: raw.InPromo === 1,
    imageUrl: null, // TODO: pendiente resolver URLs de imágenes con Luis
    site: raw.SiteName,
  }
}

// Estructura exacta de HE_FamilyRaw pendiente de confirmar con Luis; por
// ahora normalizamos de forma defensiva a { id, name }.
export function toCategory(raw: HE_FamilyRaw): Category {
  const id = String(raw.Hierarchy1 ?? raw.id ?? raw.ItemGroupId ?? '')
  const name = String(raw.Hierarchy1 ?? raw.name ?? raw.ItemGroupId ?? '')
  return { id, name }
}
