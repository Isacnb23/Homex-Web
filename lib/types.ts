// Modelo crudo que devuelve la API (todos los campos string excepto InPromo)
export interface HE_InventItemRaw {
  Row: string
  ItemId: string
  ItemName: string
  ItemGroupId: string
  AvailPhysical: string
  DataAreaId: string
  UnitId: string
  AccountRelation: string
  FromDate: string
  ToDate: string
  Amount: string
  taxes: string
  RecId: string
  MerchaArea: string
  Hierarchy5: string
  Hierarchy4: string
  Hierarchy3: string
  Hierarchy2: string
  Hierarchy1: string
  InPromo: number
  InventSiteId: string
  SiteName: string
}

// Modelo limpio que el front consume (transformado por el BFF)
export interface Product {
  id: string // ItemId
  name: string // ItemName
  price: number // Amount parseado a número
  unit: string // UnitId
  category: string // Hierarchy1
  inPromo: boolean // InPromo === 1
  imageUrl: string | null // pendiente: resolver con Luis
  site: string // SiteName
}

// HE_GetFamilies devuelve un array de strings (nombres de familia), no objetos.
export type HE_FamilyRaw = string

export interface Category {
  id: string
  name: string
}

export interface ApiErrorResponse {
  error: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export type ProductSort = 'price_asc' | 'price_desc' | 'name_asc'

// Respuesta paginada de /api/productos: el servidor filtra/ordena/pagina, el
// navegador solo recibe la tanda pedida (nunca el catálogo completo).
export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// HE_GetActiveFMCMSites: sucursales activas. No trae coordenadas.
export interface HE_SiteRaw {
  InventSiteId: string
  InventLocationId: string
  Description: string
  Name: string
}

// Modelo limpio para /api/sucursales: sucursal del endpoint + coordenada
// emparejada desde lib/branches-coords.ts. lat/lng quedan en null cuando la
// sucursal está activa pero todavía no tenemos su coordenada real.
export interface Branch {
  id: string // InventSiteId
  name: string
  lat: number | null
  lng: number | null
}
