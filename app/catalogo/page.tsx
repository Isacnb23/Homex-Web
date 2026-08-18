'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CategoryCard from '@/components/CategoryCard'
import ProductCard from '@/components/ProductCard'
import { sampleCategories, sampleProducts } from '@/lib/sampleData'
import type { Category, Product } from '@/lib/types'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const body = await res.json()
  if (!res.ok) {
    throw new Error(body?.error ?? `Error consultando ${url}`)
  }
  return body as T
}

export default function CatalogoPage() {
  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: () => fetchJson<Category[]>('/api/categorias'),
    retry: false,
  })

  const productosQuery = useQuery({
    queryKey: ['productos'],
    queryFn: () => fetchJson<Product[]>('/api/productos'),
    retry: false,
  })

  const usingSampleData = categoriasQuery.isError || productosQuery.isError
  const categorias = usingSampleData
    ? sampleCategories
    : (categoriasQuery.data ?? [])
  const productos = usingSampleData ? sampleProducts : (productosQuery.data ?? [])
  const isLoading = categoriasQuery.isLoading || productosQuery.isLoading

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
                No pudimos conectar con la API de MercasaVIP (todavía no
                tenemos el PriceList real de Luis), así que estás viendo{' '}
                <strong>datos de ejemplo</strong> para previsualizar el diseño.
              </p>
            </div>
          )}

          {isLoading && !usingSampleData ? (
            <p className="mt-8 text-sm text-homex-text/60">Cargando catálogo…</p>
          ) : (
            <>
              <section className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-homex-blue/70">
                  Categorías
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {categorias.map((categoria) => (
                    <CategoryCard key={categoria.id} category={categoria} />
                  ))}
                </div>
              </section>

              <section className="mt-12">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-homex-blue/70">
                  Productos
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {productos.map((producto) => (
                    <ProductCard key={producto.id} product={producto} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
