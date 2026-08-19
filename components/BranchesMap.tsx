'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Branch } from '@/lib/types'

const COSTA_RICA_CENTER: [number, number] = [9.9281, -84.0907]
const DEFAULT_ZOOM = 9
const FOCUS_ZOOM = 14

type PinnedBranch = Branch & { lat: number; lng: number }

// Los íconos default de Leaflet apuntan a rutas de imagen que los bundlers de
// Next rompen; en vez de parchear L.Icon.Default, usamos un pin propio en SVG
// (azul/amarillo HomeX) vía divIcon, sin depender de ningún asset externo.
function createPinIcon(selected: boolean) {
  const size = selected ? 40 : 32
  const height = Math.round(size * (32 / 24))
  const fill = selected ? '#FFD400' : '#00246F'
  const dot = selected ? '#00246F' : '#FFD400'

  return L.divIcon({
    className: '',
    html: `<svg width="${size}" height="${height}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="${fill}" stroke="#FFFFFF" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="${dot}"/>
    </svg>`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height],
  })
}

// Centra/hace zoom en la sucursal seleccionada desde la lista. Vive dentro del
// MapContainer (useMap solo funciona como descendiente).
function FocusOnSelected({ branch }: { branch: PinnedBranch | null }) {
  const map = useMap()

  useEffect(() => {
    if (branch) {
      map.flyTo([branch.lat, branch.lng], FOCUS_ZOOM, { duration: 0.8 })
    }
  }, [branch, map])

  return null
}

export default function BranchesMap({
  branches,
  selectedId,
  onSelect,
}: {
  branches: Branch[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const withCoords = useMemo(
    () =>
      branches.filter(
        (b): b is PinnedBranch => b.lat != null && b.lng != null
      ),
    [branches]
  )

  const selectedBranch = withCoords.find((b) => b.id === selectedId) ?? null

  return (
    <MapContainer
      center={COSTA_RICA_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((branch) => (
        <Marker
          key={branch.id}
          position={[branch.lat, branch.lng]}
          icon={createPinIcon(branch.id === selectedId)}
          eventHandlers={{ click: () => onSelect(branch.id) }}
        >
          <Popup>{branch.name}</Popup>
        </Marker>
      ))}
      <FocusOnSelected branch={selectedBranch} />
    </MapContainer>
  )
}
