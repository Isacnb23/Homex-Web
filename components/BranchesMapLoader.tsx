'use client'

import dynamic from 'next/dynamic'

// Leaflet toca `window` al inicializarse, así que no puede pasar por SSR.
// Este wrapper es el único punto donde se permite `ssr: false` (regla del App
// Router: dynamic con ssr:false solo puede llamarse desde un Client Component).
const BranchesMap = dynamic(() => import('./BranchesMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-homex-surface text-sm text-homex-text/60">
      Cargando mapa…
    </div>
  ),
})

export default BranchesMap
