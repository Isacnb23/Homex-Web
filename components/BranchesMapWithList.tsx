'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  AlertTriangle,
  ChevronRight,
  Loader2,
  MapPin,
  Navigation,
  Store,
  X,
} from 'lucide-react'
import BranchesMap from '@/components/BranchesMapLoader'
import type { Branch } from '@/lib/types'

type BranchWithCoords = Branch & {
  lat: number
  lng: number
}

interface BranchesMapWithListProps {
  showCta?: boolean
}

async function fetchSucursales(): Promise<Branch[]> {
  const res = await fetch('/api/sucursales')
  const body = await res.json()

  if (!res.ok) {
    throw new Error(body?.error ?? 'Error consultando /api/sucursales')
  }

  return body as Branch[]
}

function hasCoordinates(branch: Branch): branch is BranchWithCoords {
  return branch.lat != null && branch.lng != null
}

function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// showCta muestra el banner “Siempre más cerca de vos”.
// Usalo en la página de inicio y omitilo en /sucursales.
export default function BranchesMapWithList({
  showCta = false,
}: BranchesMapWithListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sucursales'],
    queryFn: fetchSucursales,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const branches = data ?? []
  const withCoords = branches.filter(hasCoordinates)
  const withoutCoords = branches.filter((branch) => !hasCoordinates(branch))
  const selected =
    withCoords.find((branch) => branch.id === selectedId) ?? null

  if (isError) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-homex-yellow bg-homex-yellow/10 p-4 text-sm text-homex-blue-dark">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0"
          strokeWidth={2}
          aria-hidden="true"
        />
        <p>
          No pudimos cargar la lista de sucursales en este momento. Probá de
          nuevo en unos minutos.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-homex-text/60">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Cargando sucursales…
      </div>
    )
  }

  if (branches.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
        <div className="relative h-[320px] overflow-hidden rounded-2xl border border-homex-yellow/60 shadow-card sm:h-[420px] lg:h-[500px]">
          <BranchesMap
            branches={withCoords}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {selected && (
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80">
              <div className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-homex-blue p-4 text-white shadow-card-hover">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-homex-yellow text-homex-blue-dark">
                  <Store
                    className="h-5 w-5"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {selected.name}
                  </p>

                  <a
                    href={directionsUrl(selected.lat, selected.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-homex-yellow hover:text-white"
                  >
                    <Navigation
                      className="h-3.5 w-3.5"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                    Cómo llegar
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Cerrar"
                  className="shrink-0 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:max-h-[500px] lg:overflow-y-auto lg:pr-1">
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
                  selectedId === branch.id
                    ? 'text-homex-yellow'
                    : 'text-homex-blue'
                }`}
                strokeWidth={2.5}
                aria-hidden="true"
              />

              <span className="flex-1">{branch.name}</span>

              <ChevronRight
                className={`h-4 w-4 shrink-0 ${
                  selectedId === branch.id
                    ? 'text-homex-yellow'
                    : 'text-homex-text/30'
                }`}
                aria-hidden="true"
              />
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
                  <MapPin
                    className="h-4 w-4 shrink-0 text-homex-text/30"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {branch.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCta && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-homex-surface p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-homex-yellow text-homex-blue-dark">
              <Store
                className="h-6 w-6"
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="text-base font-bold text-homex-blue">
                Siempre más cerca de vos
              </p>
              <p className="text-sm text-homex-text/70">
                Seguimos creciendo para estar en más lugares y brindarte el
                mejor servicio.
              </p>
            </div>
          </div>

          <Link
            href="/sucursales"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-homex-yellow px-6 py-3 text-sm font-semibold text-homex-blue-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-yellow-dark hover:shadow-button"
          >
            Ver todas las sucursales
            <ChevronRight
              className="h-4 w-4"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </Link>
        </div>
      )}
    </div>
  )
}