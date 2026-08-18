import { NextRequest, NextResponse } from 'next/server'
import { getCatalog } from '@/lib/mercasavip'
import { getServerSession } from '@/lib/session'
import type { ProductSort, ProductsResponse } from '@/lib/types'

const DEFAULT_PAGE_SIZE = 30
const MAX_PAGE_SIZE = 60
const SORTS: ProductSort[] = ['price_asc', 'price_desc', 'name_asc']

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const category = params.get('category')?.trim() || undefined
  const search = params.get('search')?.trim().toLowerCase() || undefined
  const sortParam = params.get('sort')
  const sort = SORTS.includes(sortParam as ProductSort) ? (sortParam as ProductSort) : undefined

  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.parseInt(params.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  )

  // Si hay sesión, pasamos el AccountNum del cliente para precios
  // personalizados; si no, la API igual responde con precios de lista.
  const session = await getServerSession()
  const accountNum = session.user?.accountNum

  const result = await getCatalog({ category, accountNum })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  let productos = result.data

  if (search) {
    productos = productos.filter((p) => p.name.toLowerCase().includes(search))
  }

  if (sort === 'price_asc') {
    productos = [...productos].sort((a, b) => a.price - b.price)
  } else if (sort === 'price_desc') {
    productos = [...productos].sort((a, b) => b.price - a.price)
  } else if (sort === 'name_asc') {
    productos = [...productos].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }

  const total = productos.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const pageItems = productos.slice(start, start + pageSize)

  const body: ProductsResponse = { products: pageItems, total, page, pageSize, totalPages }
  return NextResponse.json(body)
}
