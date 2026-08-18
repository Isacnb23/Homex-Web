'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/authStore'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!isValidEmail(email)) {
      setFormError('Ingresá un email válido.')
      return
    }
    if (!password) {
      setFormError('La contraseña no puede estar vacía.')
      return
    }

    const result = await login({ email, password })
    if (!result.ok) {
      setFormError(result.error)
      return
    }

    router.push('/mi-cuenta')
  }

  return (
    <>
      <div className="bg-homex-blue">
        <Navbar />
      </div>

      <main className="flex flex-1 items-center justify-center bg-white px-5 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold tracking-tight text-homex-blue">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-homex-text/70">
            Ingresá tus datos para continuar.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {/* TODO(Luis): confirmar si el login usa email, usuario o accountNum + password */}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-homex-text">
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-homex-blue/15 bg-homex-surface px-4 py-3 text-sm text-homex-text outline-none transition-colors focus:border-homex-blue"
                placeholder="tu@email.com"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-homex-text">
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-homex-blue/15 bg-homex-surface px-4 py-3 text-sm text-homex-text outline-none transition-colors focus:border-homex-blue"
                placeholder="••••••••"
              />
            </label>

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <p>{formError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-homex-blue px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-blue-dark hover:shadow-button disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Iniciar sesión
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-homex-text/70">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="font-semibold text-homex-blue hover:text-homex-blue-dark">
              Registrate
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}
