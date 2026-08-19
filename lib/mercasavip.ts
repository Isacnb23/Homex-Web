import 'server-only'
import { apiFetch } from './api-client'
import { BRANCH_COORDS } from './branches-coords'
import type { HE_FamilyRaw, HE_InventItemRaw, HE_SiteRaw, Product, Category, Branch } from './types'

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

// Cache en memoria (proceso del server) para no volver a pedirle a
// MercasaVIP.Api el catálogo completo (~4.5MB) en cada paginación/búsqueda.
// Vive mientras viva el proceso de Next; se vence solo por TTL.
const CACHE_TTL_MS = 15 * 60 * 1000
const cache = new Map<string, { data: unknown; expiresAt: number }>()

async function cached<T>(key: string, fetcher: () => Promise<MercasaVipResult<T>>): Promise<MercasaVipResult<T>> {
  const hit = cache.get(key)
  if (hit && hit.expiresAt > Date.now()) {
    return { ok: true, data: hit.data as T }
  }

  const result = await fetcher()
  if (result.ok) {
    cache.set(key, { data: result.data, expiresAt: Date.now() + CACHE_TTL_MS })
  }
  return result
}

export async function getFamilies(
  addressId = '-1'
): Promise<MercasaVipResult<HE_FamilyRaw[]>> {
  return cached(`families:${addressId}`, () =>
    fetchFromMercasaVip<HE_FamilyRaw[]>('/Inventory/HE_GetFamilies', {
      PriceList: PRICE_LIST,
      AddressId: addressId,
    })
  )
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

// Endpoint real que usa el sitio oficial para listar el catálogo completo de
// HomeX (todas las categorías de una). AccountNum es opcional (confirmado: sin
// él igual devuelve 200 con precios de lista); cuando el usuario está logueado
// se lo pasamos para precios personalizados por cuenta. // TODO(sync): revisar
// si con AccountNum de un cliente real la API devuelve precios/promos
// distintos a los de lista.
export async function getInventoryItemsFMCM(
  accountNum?: string,
  addressId = '-1'
): Promise<MercasaVipResult<HE_InventItemRaw[]>> {
  return cached(`fmcm:${accountNum ?? 'anon'}:${addressId}`, () =>
    fetchFromMercasaVip<HE_InventItemRaw[]>('/Inventory/HE_GetInventoryItemsFMCM', {
      PriceGroup: PRICE_LIST,
      AddressId: addressId,
      ...(accountNum ? { AccountNum: accountNum } : {}),
    })
  )
}

// ⚠️ NO usar para filtrar el catálogo de HomeX: aunque Hierarchy1 sí filtra
// server-side, esto pega contra un DataAreaId distinto ("cmer"), un dataset
// más chico y desalineado del que usa HE_GetInventoryItemsFMCM ("fmcm") — para
// "Alimentos" da 160 ítems contra los 413 reales de FMCM, y no incluye los
// mismos productos. Se deja documentada por si en el futuro se necesita ese
// otro dataset, pero el filtro por categoría del catálogo se hace en
// getCatalog() sobre los datos de FMCM.
export async function getInventoryItemsByFamily(
  hierarchy1: string,
  accountNum?: string,
  addressId = '-1'
): Promise<MercasaVipResult<HE_InventItemRaw[]>> {
  return cached(`family:${hierarchy1}:${accountNum ?? 'anon'}:${addressId}`, () =>
    fetchFromMercasaVip<HE_InventItemRaw[]>('/Inventory/HE_GetInventoryItemsByFamily', {
      PriceList: PRICE_LIST,
      Hierarchy1: hierarchy1,
      AddressId: addressId,
      ...(accountNum ? { AccountNum: accountNum } : {}),
    })
  )
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

// HE_GetActiveFMCMSites: público, sin parámetros (confirmado 200 sin
// PriceList/AddressId), devuelve las sucursales ACTIVAS. No trae coordenadas
// (ver lib/branches-coords.ts para el emparejamiento).
export async function getActiveSites(): Promise<MercasaVipResult<HE_SiteRaw[]>> {
  return cached('sites', () =>
    fetchFromMercasaVip<HE_SiteRaw[]>('/Inventory/HE_GetActiveFMCMSites', {})
  )
}

export function toBranch(raw: HE_SiteRaw): Branch {
  const coords = BRANCH_COORDS[raw.InventSiteId]
  return {
    id: raw.InventSiteId,
    name: coords?.name ?? raw.Description,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  }
}

// HE_GetInventoryItemsFMCM/ByFamily devuelven una fila por combinación
// item+sucursal, así que el mismo ItemId aparece repetido una vez por cada
// sitio con stock. Nos quedamos con la primera aparición de cada ItemId.
// TODO: cuando haya selección de sucursal, usar AddressId/InventSiteId real en
// vez de deduplicar a ciegas.
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

// Cachea el resultado YA transformado (907 productos deduplicados), no solo
// las 8289 filas crudas. Sin esto, toProducts() (parseo de precios + dedup)
// se repetía en CADA request del catálogo dentro de la ventana de caché.
async function getCatalogProducts(accountNum?: string): Promise<MercasaVipResult<Product[]>> {
  return cached(`catalog-products:${accountNum ?? 'anon'}`, async () => {
    const result = await getInventoryItemsFMCM(accountNum)
    if (!result.ok) return result
    return { ok: true, data: toProducts(result.data) }
  })
}

// Punto único que usa la ruta /api/productos. Trae el catálogo ya
// transformado (cacheado, ver getCatalogProducts) y filtra por categoría acá
// mismo en el servidor — no existe un endpoint upstream que filtre este mismo
// dataset por Hierarchy1, así que el "filtrado server-side" es este, hecho en
// el BFF antes de mandar la respuesta al navegador (nunca se manda el
// catálogo completo al cliente, solo lo que pide /api/productos).
export async function getCatalog(options: {
  category?: string
  accountNum?: string
} = {}): Promise<MercasaVipResult<Product[]>> {
  const { category, accountNum } = options

  const result = await getCatalogProducts(accountNum)
  if (!result.ok) return result

  return {
    ok: true,
    data: category ? result.data.filter((p) => p.category === category) : result.data,
  }
}

