'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Branch } from '@/lib/types'

const COSTA_RICA_CENTER: [number, number] = [9.9281, -84.0907]
const DEFAULT_ZOOM = 9
const FOCUS_ZOOM = 12

type PinnedBranch = Branch & { lat: number; lng: number }

function storeGlyph(color: string, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9L5 3H19L20 9" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 9C4 10.1 4.9 11 6 11C7.1 11 8 10.1 8 9C8 10.1 8.9 11 10 11C11.1 11 12 10.1 12 9C12 10.1 12.9 11 14 11C15.1 11 16 10.1 16 9C16 10.1 16.9 11 18 11C19.1 11 20 10.1 20 9" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 11V21H19V11" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 21V15H15V21" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

// El pin seleccionado agranda y muestra el wordmark "HomeX" en vez del ícono
// de tienda, como una insignia. El detalle de la sucursal ya no se muestra en
// un <Popup> de Leaflet: vive en una tarjeta propia superpuesta al mapa (ver
// BranchesMapWithList), que se ve mejor y es más fácil de estilizar.
function createPinIcon(selected: boolean) {
  const size = selected ? 56 : 32
  const height = Math.round(size * (32 / 24))
  const fill = selected ? '#FFD400' : '#00246F'
  const iconColor = selected ? '#00246F' : '#FFFFFF'

  const content = selected
    ? '<div style="font-weight:800;font-size:' +
      Math.round(size * 0.22) +
      'px;color:#00246F;letter-spacing:-0.02em;white-space:nowrap;font-family:inherit;">HomeX</div>'
    : storeGlyph(iconColor, Math.round(size * 0.42))

  const html =
    '<div style="position:relative;width:' +
    size +
    'px;height:' +
    height +
    'px;filter:drop-shadow(0 4px 6px rgba(0,36,111,0.4));">' +
    '<svg width="' +
    size +
    '" height="' +
    height +
    '" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="' +
    fill +
    '" stroke="#FFFFFF" stroke-width="1.5"/>' +
    '</svg>' +
    '<div style="position:absolute;top:' +
    Math.round(height * 0.26) +
    'px;left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;">' +
    content +
    '</div>' +
    '</div>'

  return L.divIcon({
    className: '',
    html,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
  })
}

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {withCoords.map((branch) => (
        <Marker
          key={branch.id}
          position={[branch.lat, branch.lng]}
          icon={createPinIcon(branch.id === selectedId)}
          eventHandlers={{ click: () => onSelect(branch.id) }}
        />
      ))}
      <FocusOnSelected branch={selectedBranch} />
    </MapContainer>
  )
}