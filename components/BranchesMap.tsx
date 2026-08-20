'use client'

import { useEffect, useMemo, useRef } from 'react'
import Map, { Marker, Source, type MapRef } from 'react-map-gl/maplibre'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Branch } from '@/lib/types'

// MapLibre calcula la URL de su Web Worker (donde se parsean los tiles
// vectoriales) a partir de `import.meta.url` del propio paquete. Bajo
// Turbopack ese valor no resuelve a una URL http(s) real, así que el worker
// nunca llega a cargar: el mapa queda "fantasma" (se ve el fondo y los pines,
// que son HTML aparte, pero ningún tile vectorial se llega a parsear/pintar
// porque el mensaje al worker nunca vuelve). El archivo del worker (y su
// dependencia maplibre-gl-shared.mjs) están copiados a /public para servirlos
// como estáticos, sin depender de cómo Turbopack resuelva el paquete.
setWorkerUrl('/maplibre-gl-worker.mjs')

// Estilo vectorial gratuito, sin API key (financiado por donaciones, no por
// consumo). Ver https://openfreemap.org/ — si cambian el dominio/endpoint,
// actualizar acá.
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

// Tiles de elevación abiertas de AWS (formato Terrarium), gratis y sin key.
const TERRAIN_SOURCE_ID = 'terrain-dem'
const TERRAIN_TILES_URL =
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

const COSTA_RICA_CENTER = { longitude: -84.0907, latitude: 9.9281 }
const DEFAULT_ZOOM = 8
const DEFAULT_PITCH = 45
const FOCUS_ZOOM = 13
const FOCUS_PITCH = 55

export type MapBranch = Branch & {
  lat: number
  lng: number
  isDistributionCenter?: boolean
}

function storeGlyph(color: string, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9L5 3H19L20 9" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 9C4 10.1 4.9 11 6 11C7.1 11 8 10.1 8 9C8 10.1 8.9 11 10 11C11.1 11 12 10.1 12 9C12 10.1 12.9 11 14 11C15.1 11 16 10.1 16 9C16 10.1 16.9 11 18 11C19.1 11 20 10.1 20 9" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 11V21H19V11" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 21V15H15V21" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

// Ícono de bodega (lucide-react "Warehouse") para diferenciar el Centro de
// Distribución de una sucursal de venta al público.
function warehouseGlyph(color: string, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 13h12" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 17h12" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

// El pin seleccionado agranda y muestra el wordmark "HomeX" en vez del ícono
// de tienda, como una insignia. El detalle de la sucursal no se muestra en un
// popup: vive en una tarjeta propia superpuesta al mapa (ver
// BranchesMapWithList), que se ve mejor y es más fácil de estilizar.
function pinHtml({
  selected,
  isDistributionCenter,
}: {
  selected: boolean
  isDistributionCenter: boolean
}): string {
  const size = selected ? 56 : 32
  const height = Math.round(size * (32 / 24))
  const fill = selected ? '#FFD400' : isDistributionCenter ? '#4B5563' : '#00246F'
  const iconColor = selected ? '#00246F' : '#FFFFFF'

  const content =
    selected && !isDistributionCenter
      ? '<div style="font-weight:800;font-size:' +
        Math.round(size * 0.22) +
        'px;color:#00246F;letter-spacing:-0.02em;white-space:nowrap;font-family:inherit;">HomeX</div>'
      : isDistributionCenter
        ? warehouseGlyph(iconColor, Math.round(size * 0.42))
        : storeGlyph(iconColor, Math.round(size * 0.42))

  return (
    '<div style="position:relative;width:' +
    size +
    'px;height:' +
    height +
    'px;filter:drop-shadow(0 4px 6px rgba(0,36,111,0.4));cursor:pointer;">' +
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
  )
}

export default function BranchesMap({
  branches,
  selectedId,
  onSelect,
}: {
  branches: MapBranch[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const mapRef = useRef<MapRef>(null)

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedId) ?? null,
    [branches, selectedId]
  )

  useEffect(() => {
    if (!selectedBranch) return
    mapRef.current?.flyTo({
      center: [selectedBranch.lng, selectedBranch.lat],
      zoom: FOCUS_ZOOM,
      pitch: FOCUS_PITCH,
      duration: 1200,
      essential: true,
    })
  }, [selectedBranch])

  // MapLibre mide el tamaño del canvas UNA vez al montar el mapa y nunca más
  // por su cuenta: si en ese instante el contenedor midió mal (por ejemplo,
  // porque todavía estaba animándose con Reveal, o el layout de alrededor
  // todavía no había asentado), el mapa queda con un canvas mal dimensionado
  // para siempre — se ven los pines (se posicionan aparte, en HTML) pero el
  // WebGL nunca pinta tiles nuevos. ResizeObserver + resize() explícito cubre
  // ese caso sin depender de adivinar la causa exacta del layout raro.
  const handleLoad = () => {
    mapRef.current?.resize()
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const container = map.getContainer()

    const observer = new ResizeObserver(() => {
      map.resize()
    })
    observer.observe(container)

    // Cubre el frame inicial: a veces el primer resize real llega recién
    // después del primer paint del contenedor padre.
    const raf = requestAnimationFrame(() => map.resize())

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <Map
      ref={mapRef}
      onLoad={handleLoad}
      mapStyle={MAP_STYLE}
      initialViewState={{
        ...COSTA_RICA_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: DEFAULT_PITCH,
      }}
      // Exageración moderada: relieve visible en las montañas sin verse
      // artificial.
      terrain={{ source: TERRAIN_SOURCE_ID, exaggeration: 1.2 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Source
        id={TERRAIN_SOURCE_ID}
        type="raster-dem"
        tiles={[TERRAIN_TILES_URL]}
        tileSize={256}
        encoding="terrarium"
        maxzoom={15}
      />

      {branches.map((branch) => (
        <Marker
          key={branch.id}
          longitude={branch.lng}
          latitude={branch.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            onSelect(branch.id)
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: pinHtml({
                selected: branch.id === selectedId,
                isDistributionCenter: branch.isDistributionCenter ?? false,
              }),
            }}
          />
        </Marker>
      ))}
    </Map>
  )
}
