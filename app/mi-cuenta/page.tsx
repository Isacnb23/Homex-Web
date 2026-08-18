'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/authStore'

export default function MiCuentaPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const fetchSession = useAuthStore((state) => state.fetchSession)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <>
      <div className="bg-homex-blue">
        <Navbar />
      </div>

      <main className="flex-1 bg-white px-5 py-16">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
            Mi cuenta
          </h1>

          {isLoading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-homex-text/60">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Cargando tu sesión…
            </div>
          ) : isAuthenticated && user ? (
            <div className="mt-8 rounded-2xl bg-homex-surface p-6 shadow-card">
              {/* TODO(Luis): confirmar qué datos de usuario devuelve la API para mostrar más info aquí */}
              <p className="text-sm text-homex-text/60">Nombre</p>
              <p className="text-lg font-semibold text-homex-blue">{user.name || '—'}</p>
              <p className="mt-4 text-sm text-homex-text/60">Email</p>
              <p className="text-lg font-semibold text-homex-blue">{user.email || '—'}</p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 rounded-full bg-homex-blue px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-blue-dark hover:shadow-button"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-homex-yellow bg-homex-yellow/10 p-4 text-sm text-homex-blue-dark">
              No pudimos confirmar tu sesión.{' '}
              <Link href="/login" className="font-semibold underline">
                Volvé a iniciar sesión
              </Link>
              .
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
