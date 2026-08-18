import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Hero />

      <main className="flex-1 bg-white py-16 lg:py-24">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-5 text-center md:px-8 lg:px-16">
          <h2 className="text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
            Descubrí nuestro catálogo
          </h2>
          <p className="max-w-xl text-base text-homex-text/70">
            Explorá los productos y precios de tu sucursal HomeX más cercana.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-homex-blue px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-blue-dark hover:shadow-button"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Ver catálogo
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
