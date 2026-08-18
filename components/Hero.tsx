import Link from 'next/link'
import { Tag, MapPin } from 'lucide-react'
import Navbar from './Navbar'

const HERO_IMAGE_ALT =
  'Familia sonriente empujando un carrito de supermercado HomeX lleno de frutas, verduras y productos frescos'

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-homex-blue lg:min-h-[700px]"
    >
      <div className="absolute inset-y-0 right-0 hidden w-[60%] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/imagenes/hero-homex.png"
          alt={HERO_IMAGE_ALT}
          className="h-full w-full object-cover object-[35%_center]"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-homex-blue via-homex-blue/50 to-transparent" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-5 pb-28 pt-4 md:px-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:px-16 lg:pb-36 lg:pt-14">
          <div className="flex flex-col justify-center">
            <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[46px] lg:text-[54px] lg:leading-[1.05] xl:text-[60px]">
              <span className="block">Todo lo que</span>
              <span className="block">necesitás,</span>
              <span className="block text-homex-yellow">en un solo lugar.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
              Precios bajos todos los días, productos frescos y la calidad que
              tu familia merece.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-homex-yellow px-7 py-3.5 text-sm font-semibold text-homex-blue-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-yellow-dark hover:shadow-button"
              >
                <Tag className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                Ver ofertas
              </Link>
              <Link
                href="/#sucursales"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              >
                <MapPin
                  className="h-4 w-4"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                Encontrá tu sucursal
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagenes/hero-homex.png"
              alt={HERO_IMAGE_ALT}
              className="h-56 w-full object-cover sm:h-72"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[-1px] z-10 leading-none">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="h-20 w-full sm:h-28 lg:h-32"
          aria-hidden="true"
        >
          <path
            d="M500,70 C750,78 900,36 1150,31 C1300,28 1400,50 1440,60 L1440,120 L500,120 Z"
            fill="#FFD400"
          />
          <path
            d="M0,70 C200,90 350,50 500,55 C750,62 900,20 1150,15 C1300,12 1400,35 1440,45 L1440,120 L0,120 Z"
            fill="#FAFAF8"
          />
        </svg>
      </div>
    </section>
  )
}
