import Link from 'next/link'
import { MapPin, ShoppingBag } from 'lucide-react'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import BenefitsBand from '@/components/BenefitsBand'
import CategoryTile from '@/components/CategoryTile'
import ProductCard from '@/components/ProductCard'
import Reveal from '@/components/Reveal'
import { getCatalog, getFamilies, toCategory } from '@/lib/mercasavip'
import { sampleCategories, sampleProducts } from '@/lib/sampleData'
import type { Category, Product } from '@/lib/types'

const FEATURED_LIMIT = 8

// Prioriza los productos en promoción; completa el resto con el resto del
// catálogo para que la sección nunca se vea vacía o desbalanceada.
function pickFeatured(products: Product[], limit: number): Product[] {
  const promo = products.filter((p) => p.inPromo)
  const rest = products.filter((p) => !p.inPromo)
  return [...promo, ...rest].slice(0, limit)
}

export default async function HomePage() {
  const [categoriesResult, productsResult] = await Promise.all([
    getFamilies(),
    getCatalog(),
  ])

  const categories: Category[] = categoriesResult.ok
    ? categoriesResult.data.map(toCategory)
    : sampleCategories

  const featured: Product[] = productsResult.ok
    ? pickFeatured(productsResult.data, FEATURED_LIMIT)
    : sampleProducts.slice(0, FEATURED_LIMIT)

  return (
    <>
      <Hero />

      <main className="flex-1 bg-white">
        <section className="py-16 lg:py-20">
          <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-16">
            <Reveal>
              <h2 className="text-center text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
                Comprá por categoría
              </h2>
            </Reveal>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category, i) => (
                <Reveal key={category.id} delay={Math.min(i, 6) * 60}>
                  <CategoryTile category={category} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="ofertas" className="bg-homex-surface py-16 lg:py-20">
          <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-16">
            <Reveal>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
                  Destacados
                </h2>
                <Link
                  href="/catalogo"
                  className="flex min-h-11 items-center text-sm font-semibold text-homex-blue hover:text-homex-blue-dark"
                >
                  Ver todo el catálogo →
                </Link>
              </div>
            </Reveal>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((product, i) => (
                <Reveal key={product.id} delay={Math.min(i, 8) * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/catalogo"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-homex-blue px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-blue-dark hover:shadow-button"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                Ver todo el catálogo
              </Link>
            </div>
          </div>
        </section>

        <BenefitsBand />

        <section id="sucursales" className="py-16 lg:py-20">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-8 px-5 text-center md:px-8 lg:px-16">
            <Reveal className="flex w-full flex-col items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
                Estamos cerca de vos
              </h2>
              <p className="max-w-xl text-base text-homex-text/70">
                Encontrá la sucursal HomeX más cercana y hacé tu compra sin vueltas.
              </p>
            </Reveal>

            <Reveal className="w-full max-w-2xl" delay={100}>
              <Link
                href="/sucursales"
                className="group flex flex-col items-center gap-5 rounded-2xl border border-homex-yellow/60 bg-homex-surface p-10 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2 sm:p-14"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-homex-blue text-white transition-colors duration-300 group-hover:bg-homex-yellow group-hover:text-homex-blue-dark">
                  <MapPin className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-homex-blue px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 group-hover:bg-homex-blue-dark">
                  Ver mapa de sucursales
                </span>
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
