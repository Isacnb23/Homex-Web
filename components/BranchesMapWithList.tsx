'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  AlertTriangle,
  ChevronRight,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Store,
  Warehouse,
  X,
} from 'lucide-react'
import BranchesMap from '@/components/BranchesMapLoader'
import type { MapBranch } from '@/components/BranchesMap'
import { EXTRA_BRANCHES } from '@/lib/branches-coords'
import { haversineDistanceKm } from '@/lib/geo'
import type { Branch } from '@/lib/types'

type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'

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

function hasCoordinates(
  branch: Branch
): branch is Branch & { lat: number; lng: number } {
  return branch.lat != null && branch.lng != null
}

// EXTRA_BRANCHES son ubicaciones reales que el endpoint HE_GetActiveFMCMSites
// todavía no conoce (no tienen InventSiteId). Se muestran igual en el mapa,
// combinadas con las que sí vienen del endpoint.
const extraBranches: MapBranch[] = EXTRA_BRANCHES.map((extra) => ({
  id: extra.id,
  name: extra.name,
  lat: extra.lat,
  lng: extra.lng,
  isDistributionCenter: extra.isDistributionCenter,
}))

function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// showCta muestra el banner “Siempre más cerca de vos”.
// Usalo en la página de inicio y omitilo en /sucursales.
export default function BranchesMapWithList({
  showCta = false,
}: BranchesMapWithListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  // La ubicación del usuario se usa SOLO en el cliente (cálculo de distancia
  // en el navegador vía Haversine, ver lib/geo.ts): nunca se manda a ningún
  // servidor ni se guarda.
  const [userPosition, setUserPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sucursales'],
    queryFn: fetchSucursales,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const branches = data ?? []
  const withCoords = branches.filter(hasCoordinates)
  const withoutCoords = branches.filter((branch) => !hasCoordinates(branch))

  // Combina las sucursales del endpoint (emparejadas por InventSiteId) con
  // las extra (reales, pero sin InventSiteId todavía). Ver
  // lib/branches-coords.ts.
  const allBranches: MapBranch[] = [
    ...withCoords.map((branch) => ({ ...branch, isDistributionCenter: false })),
    ...extraBranches,
  ]
  // El Centro de Distribución nunca entra en el cálculo/orden de "más
  // cercana": no es un punto de venta al público.
  const saleBranches = allBranches
    .filter((b) => !b.isDistributionCenter)
    .map((b) => ({
      ...b,
      distanceKm: userPosition ? haversineDistanceKm(userPosition, b) : null,
    }))
  if (userPosition) {
    saleBranches.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
  }
  const distributionBranches = allBranches.filter((b) => b.isDistributionCenter)
  const selected = allBranches.find((branch) => branch.id === selectedId) ?? null

  function handleFindNearby() {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported')
      return
    }

    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGeoStatus('granted')
      },
      () => {
        setGeoStatus('denied')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    )
  }

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
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleFindNearby}
          disabled={geoStatus === 'loading'}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-homex-blue/20 bg-white px-4 py-2 text-xs font-semibold text-homex-blue transition-colors duration-300 hover:border-homex-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {geoStatus === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
          )}
          Ver las más cercanas a mí
        </button>

        {(geoStatus === 'denied' || geoStatus === 'unsupported') && (
          <p className="text-xs text-homex-text/50">
            No pudimos acceder a tu ubicación.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
        <div className="relative h-[320px] overflow-hidden rounded-2xl border border-homex-yellow/60 shadow-card sm:h-[420px] lg:h-[500px]">
          <BranchesMap
            branches={allBranches}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {selected && (
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80">
              <div className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-homex-blue p-4 text-white shadow-card-hover">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-homex-yellow text-homex-blue-dark">
                  {selected.isDistributionCenter ? (
                    <Warehouse
                      className="h-5 w-5"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  ) : (
                    <Store
                      className="h-5 w-5"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {selected.isDistributionCenter
                      ? 'Centro de Distribución'
                      : selected.name}
                  </p>

                  {selected.isDistributionCenter && (
                    <p className="mt-0.5 text-xs text-white/70">
                      No es un punto de venta al público
                    </p>
                  )}

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
          {saleBranches.map((branch) => (
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

              <span className="flex-1">
                {branch.name}
                {branch.distanceKm != null && (
                  <span
                    className={`ml-1.5 font-normal ${
                      selectedId === branch.id
                        ? 'text-white/70'
                        : 'text-homex-text/50'
                    }`}
                  >
                    · {branch.distanceKm.toFixed(1)} km
                  </span>
                )}
              </span>

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

          {distributionBranches.length > 0 && (
            <div className="mt-2 flex flex-col gap-2 border-t border-homex-surface pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-homex-text/50">
                Centro de distribución (no es punto de venta)
              </p>

              {distributionBranches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedId(branch.id)}
                  className={`flex min-h-11 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2 ${
                    selectedId === branch.id
                      ? 'border-homex-blue bg-homex-blue text-white'
                      : 'border-dashed border-homex-text/20 bg-transparent text-homex-text/70 hover:border-homex-blue/40'
                  }`}
                >
                  <Warehouse
                    className={`h-4 w-4 shrink-0 ${
                      selectedId === branch.id
                        ? 'text-homex-yellow'
                        : 'text-homex-text/40'
                    }`}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <span className="flex-1">Centro de Distribución</span>
                </button>
              ))}
            </div>
          )}

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