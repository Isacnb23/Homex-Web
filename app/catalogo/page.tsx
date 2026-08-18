'use client'

import { useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { AlertTriangle, Loader2, PackageSearch, Search, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CategoryCard from '@/components/CategoryCard'
import ProductCard from '@/components/ProductCard'
import ProductCardSkeleton from '@/components/ProductCardSkeleton'
import { sampleCategories, sampleProducts } from '@/lib/sampleData'
import { useDebouncedValue } from '@/lib/utils'
import type { Category, Product, ProductSort, ProductsResponse } from '@/lib/types'

const ALL_CATEGORIES = ''
const PAGE_SIZE_SKELETONS = 8

const SORT_OPTIONS: { value: ProductSort | ''; label: string }[] = [
  { value: '', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
]

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const body = await res.json()
  if (!res.ok) {
    throw new Error(body?.error ?? `Error consultando ${url}`)
  }
  return body as T
}

function fetchCategorias(): Promise<Category[]> {
  return fetchJson<Category[]>('/api/categorias')
}

function fetchProductos(params: {
  category: string
  search: string
  sort: ProductSort | ''
  page: number
}): Promise<ProductsResponse> {
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.search) search.set('search', params.search)
  if (params.sort) search.set('sort', params.sort)
  search.set('page', String(params.page))
  return fetchJson<ProductsResponse>(`/api/productos?${search.toString()}`)
}

function sortSampleProducts(products: Product[], sort: ProductSort | ''): Product[] {
  if (sort === 'price_asc') return [...products].sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') return [...products].sort((a, b) => b.price - a.price)
  if (sort === 'name_asc') return [...products].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return products
}

function countLabel(total: number, category: string, search: string): string {
  if (search) return `${total} resultado${total === 1 ? '' : 's'} para "${search}"`
  if (category) return `${total} en ${category}`
  return `${total} producto${total === 1 ? '' : 's'}`
}

export default function CatalogoPage() {
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<ProductSort | ''>('')
  const search = useDebouncedValue(searchInput, 300).trim().toLowerCase()

  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
    retry: false,
  })

  const productosQuery = useInfiniteQuery({
    queryKey: ['productos', category, search, sort],
    queryFn: ({ pageParam }) => fetchProductos({ category, search, sort, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const usingSampleData = categoriasQuery.isError || productosQuery.isError

  const categorias = usingSampleData ? sampleCategories : categoriasQuery.data ?? []

  const sampleFiltered = useMemo(() => {
    const filtered = sampleProducts.filter((p) => {
      const matchesCategory = !category || p.category === category
      const matchesSearch = !search || p.name.toLowerCase().includes(search)
      return matchesCategory && matchesSearch
    })
    return sortSampleProducts(filtered, sort)
  }, [category, search, sort])

  const realPages = productosQuery.data?.pages ?? []
  const productos = usingSampleData ? sampleFiltered : realPages.flatMap((p) => p.products)
  const total = usingSampleData ? sampleFiltered.length : realPages[0]?.total ?? 0

  const isFirstLoad = !usingSampleData && productosQuery.isLoading
  const hasNextPage = !usingSampleData && productosQuery.hasNextPage
  const isFetchingNextPage = !usingSampleData && productosQuery.isFetchingNextPage

  function clearFilters() {
    setCategory(ALL_CATEGORIES)
    setSearchInput('')
    setSort('')
  }

  const hasActiveFilters = category !== ALL_CATEGORIES || searchInput.trim() !== '' || sort !== ''

  return (
    <>
      <div className="bg-homex-blue">
        <Navbar />
      </div>

      <main className="flex-1 bg-white py-12 lg:py-16">
        <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-16">
          <h1 className="text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
            Catálogo
          </h1>

          {usingSampleData && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-homex-yellow bg-homex-yellow/10 p-4 text-sm text-homex-blue-dark">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              <p>
                No pudimos conectar con la API de MercasaVIP, así que estás viendo{' '}
                <strong>datos de ejemplo</strong> para previsualizar el diseño.
              </p>
            </div>
          )}

          <div className="sticky top-0 z-10 -mx-5 mt-6 border-b border-homex-surface bg-white/95 px-5 py-4 backdrop-blur md:-mx-8 md:px-8 lg:-mx-16 lg:px-16">
            <div
              className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, black 92%, transparent 100%)',
                maskImage: 'linear-gradient(to right, black 92%, transparent 100%)',
              }}
            >
              <CategoryCard
                category={{ id: ALL_CATEGORIES, name: 'Todas' }}
                selected={category === ALL_CATEGORIES}
                onClick={() => setCategory(ALL_CATEGORIES)}
              />
              {categorias.map((c) => (
                <CategoryCard
                  key={c.id}
                  category={c}
                  selected={category === c.id}
                  onClick={() => setCategory(c.id)}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Buscar productos</span>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-homex-text/40"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar productos..."
                  className="min-h-11 w-full rounded-full border border-homex-blue/15 bg-homex-surface py-2.5 pl-10 pr-4 text-sm text-homex-text outline-none transition-colors focus:border-homex-blue"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-homex-text/70">
                <span className="hidden sm:inline">Ordenar por</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as ProductSort | '')}
                  className="min-h-11 w-full rounded-full border border-homex-blue/15 bg-homex-surface px-4 py-2.5 text-sm text-homex-text outline-none transition-colors focus:border-homex-blue sm:w-auto"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-homex-text/60">{countLabel(total, category, search)}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm font-semibold text-homex-blue hover:text-homex-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Limpiar filtros
              </button>
            )}
          </div>

          {isFirstLoad ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
              {Array.from({ length: PAGE_SIZE_SKELETONS }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : total === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <PackageSearch className="h-10 w-10 text-homex-text/20" aria-hidden="true" />
              <p className="text-sm text-homex-text/60">
                {search
                  ? `No encontramos productos para "${search}".`
                  : 'No encontramos productos con estos filtros.'}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-homex-blue underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
                {productos.map((producto) => (
                  <ProductCard key={producto.id} product={producto} />
                ))}
              </div>

              {hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => productosQuery.fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-homex-blue px-7 py-3 text-sm font-semibold text-homex-blue transition-colors hover:bg-homex-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    Ver más
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
