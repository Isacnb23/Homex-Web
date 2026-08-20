'use client'

import { useState } from 'react'
import { Check, Loader2, MapPin } from 'lucide-react'
import type { DirectionInput } from '@/lib/auth-types'

const EMPTY_FORM: DirectionInput = {
  fullName: '',
  province: '',
  canton: '',
  city: '',
  district: '',
  street: '',
  address: '',
  postalName: '',
}

export default function DirectionForm() {
  const [form, setForm] = useState<DirectionInput>(EMPTY_FORM)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(field: keyof DirectionInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/direcciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const body = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(body?.error ?? 'No pudimos guardar la dirección.')
        return
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg('Error de conexión. Intentá de nuevo.')
    }
  }

  const inputClass =
    'min-h-11 w-full rounded-xl border border-homex-blue/15 bg-white px-4 py-2.5 text-sm text-homex-text outline-none transition-colors focus:border-homex-blue'
  const labelClass = 'mb-1.5 block text-sm font-medium text-homex-text/70'

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="fullName">Nombre completo</label>
        <input
          id="fullName"
          type="text"
          required
          value={form.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="province">Provincia</label>
          <input
            id="province"
            type="text"
            required
            value={form.province}
            onChange={(e) => handleChange('province', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="canton">Cantón</label>
          <input
            id="canton"
            type="text"
            required
            value={form.canton}
            onChange={(e) => handleChange('canton', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="city">Ciudad</label>
          <input
            id="city"
            type="text"
            required
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="district">Distrito</label>
          <input
            id="district"
            type="text"
            required
            value={form.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="street">Calle / señas</label>
        <input
          id="street"
          type="text"
          required
          value={form.street}
          onChange={(e) => handleChange('street', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="address">Dirección exacta</label>
        <textarea
          id="address"
          required
          rows={2}
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="postalName">Nombre para esta dirección</label>
        <input
          id="postalName"
          type="text"
          required
          placeholder="Ej. Casa, Oficina"
          value={form.postalName}
          onChange={(e) => handleChange('postalName', e.target.value)}
          className={inputClass}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      {status === 'success' ? (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          Dirección guardada correctamente.
        </div>
      ) : (
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-homex-blue px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-blue-dark hover:shadow-button disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <MapPin className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          )}
          Guardar dirección
        </button>
      )}
    </form>
  )
}