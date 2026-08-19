'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Loader2, MapPin } from 'lucide-react'
import BranchesMap from '@/components/BranchesMapLoader'
import type { Branch } from '@/lib/types'

async function fetchSucursales(): Promise<Branch[]> {
  const res = await fetch('/api/sucursales')
  const body = await res.json()
  if (!res.ok) {
    throw new Error(body?.error ?? 'Error consultando /api/sucursales')
  }
  return body as Branch[]
}

export default function BranchesSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sucursales'],
    queryFn: fetchSucursales,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const branches = data ?? []
  const withCoords = branches.filter((b) => b.lat != null && b.lng != null)
  const withoutCoords = branches.filter((b) => b.lat == null || b.lng == null)

  return (
    <main className="flex-1 bg-white py-12 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-16">
        <h1 className="text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
          Nuestras sucursales
        </h1>
        <p className="mt-2 max-w-xl text-sm text-homex-text/70">
          Encontrá la sucursal HomeX más cercana. Elegí una de la lista para
          verla en el mapa.
        </p>

        {isError && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-homex-yellow bg-homex-yellow/10 p-4 text-sm text-homex-blue-dark">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <p>
              No pudimos cargar la lista de sucursales en este momento. Probá
              de nuevo en unos minutos.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 flex h-64 items-center justify-center gap-2 text-sm text-homex-text/60">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Cargando sucursales…
          </div>
        ) : !isError && branches.length > 0 ? (
          <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
            <div className="h-[320px] overflow-hidden rounded-2xl border border-homex-yellow/60 shadow-card sm:h-[420px] lg:h-[600px]">
              <BranchesMap
                branches={withCoords}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>

            <div className="flex flex-col gap-3 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1">
              {withCoords.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedId(branch.id)}
                  className={`flex min-h-11 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2 ${
                    selectedId === branch.id
                      ? 'border-homex-blue bg-homex-blue text-white'
                      : 'border-homex-blue/15 bg-homex-surface text-homex-text hover:border-homex-blue/40'
                  }`}
                >
                  <MapPin
                    className={`h-4 w-4 shrink-0 ${
                      selectedId === branch.id ? 'text-homex-yellow' : 'text-homex-blue'
                    }`}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {branch.name}
                </button>
              ))}

              {withoutCoords.length > 0 && (
                <div className="mt-2 flex flex-col gap-2 border-t border-homex-surface pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-homex-text/50">
                    Sin ubicación en el mapa todavía
                  </p>
                  {withoutCoords.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center gap-3 rounded-2xl border border-dashed border-homex-text/20 px-4 py-3 text-sm text-homex-text/70"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-homex-text/30" strokeWidth={2} aria-hidden="true" />
                      {branch.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
