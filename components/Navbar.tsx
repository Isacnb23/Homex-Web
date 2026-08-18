'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Menu, User, X } from 'lucide-react'
import { useAuthStore } from '@/lib/authStore'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Ofertas', href: '/#ofertas' },
  { label: 'Sucursales', href: '/#sucursales' },
  { label: 'Contacto', href: '/#footer' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  async function handleLogout() {
    await logout()
    setIsMenuOpen(false)
    router.push('/')
  }

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

      <div className="hidden items-center gap-5 lg:flex">
        <Link
          href="/#sucursales"
          className="flex items-center gap-2 rounded-full bg-homex-yellow px-5 py-2.5 text-sm font-semibold text-homex-blue-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-yellow-dark hover:shadow-button"
        >
          <MapPin className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          Encontrá tu sucursal
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link
              href="/mi-cuenta"
              className="flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-homex-yellow"
            >
              <User className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              {user?.name || 'Mi cuenta'}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold text-white/70 hover:text-homex-yellow"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold text-white hover:text-homex-yellow"
          >
            Iniciar sesión
          </Link>
        )}
      </div>

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

          {isAuthenticated ? (
            <>
              <Link
                href="/mi-cuenta"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
              >
                <User className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                {user?.name || 'Mi cuenta'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white/90 hover:bg-white/10"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
