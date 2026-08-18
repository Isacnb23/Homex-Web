'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function RegistroPage() {
  const router = useRouter()

  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!id.trim()) {
      setFormError('Ingresá tu identificación.')
      return
    }
    if (!password) {
      setFormError('La contraseña no puede estar vacía.')
      return
    }
    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id.trim(), password }),
      })
      const body = await res.json().catch(() => null)

      if (!res.ok) {
        setFormError(body?.error ?? 'No se pudo completar el registro.')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 1500)
    } catch {
      setFormError('No se pudo conectar con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="bg-homex-blue">
        <Navbar />
      </div>

      <main className="flex flex-1 items-center justify-center bg-white px-5 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold tracking-tight text-homex-blue">
            Creá tu cuenta
          </h1>
          <p className="mt-1 text-sm text-homex-text/70">
            Registrate para empezar a comprar.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-homex-text">
              Identificación (cédula/VATNUM)
              <input
                type="text"
                autoComplete="username"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="rounded-xl border border-homex-blue/15 bg-homex-surface px-4 py-3 text-sm text-homex-text outline-none transition-colors focus:border-homex-blue"
                placeholder="Tu número de identificación"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-homex-text">
              Contraseña
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-homex-blue/15 bg-homex-surface px-4 py-3 text-sm text-homex-text outline-none transition-colors focus:border-homex-blue"
                placeholder="••••••••"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-homex-text">
              Confirmar contraseña
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <p>¡Cuenta creada! Te llevamos a iniciar sesión…</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-homex-blue px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-blue-dark hover:shadow-button disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Crear cuenta
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-homex-text/70">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="font-semibold text-homex-blue hover:text-homex-blue-dark">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}
