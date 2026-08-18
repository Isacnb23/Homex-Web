'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Ofertas', href: '/#ofertas' },
  { label: 'Sucursales', href: '/#sucursales' },
  { label: 'Contacto', href: '/#footer' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-5 md:px-8 lg:px-16">
      <Link href="/" className="flex flex-col leading-none">
        <span className="text-2xl font-extrabold">
          <span className="text-white">Home</span>
          <span className="text-homex-yellow">X</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
          SUPERMERCADO
        </span>
      </Link>

      <nav
        aria-label="Navegación principal"
        className="hidden items-center gap-8 lg:flex"
      >
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm font-medium text-white/90 transition-colors duration-300 hover:text-homex-yellow"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/#sucursales"
        className="hidden items-center gap-2 rounded-full bg-homex-yellow px-5 py-2.5 text-sm font-semibold text-homex-blue-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-yellow-dark hover:shadow-button lg:flex"
      >
        <MapPin className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Encontrá tu sucursal
      </Link>

      <button
        type="button"
        className="flex items-center justify-center rounded-md p-2 text-white lg:hidden"
        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? (
          <X className="h-7 w-7" aria-hidden="true" />
        ) : (
          <Menu className="h-7 w-7" aria-hidden="true" />
        )}
      </button>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-full mx-4 flex flex-col gap-1 rounded-2xl bg-homex-blue-dark/95 p-4 shadow-card-hover backdrop-blur lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#sucursales"
            onClick={() => setIsMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-homex-yellow px-5 py-3 text-sm font-semibold text-homex-blue-dark"
          >
            <MapPin className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Encontrá tu sucursal
          </Link>
        </div>
      )}
    </header>
  )
}
