import { MapPin } from 'lucide-react'
import BranchesMapWithList from '@/components/BranchesMapWithList'

export default function BranchesSection() {
  return (
    <main className="flex-1 bg-white py-12 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-16">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-homex-yellow px-3 py-1 text-xs font-bold uppercase tracking-wide text-homex-blue-dark">
          <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
          Nuestras sucursales
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
          Nuestras sucursales
        </h1>
        <p className="mt-2 max-w-xl text-sm text-homex-text/70">
          Encontrá la sucursal HomeX más cercana. Elegí una de la lista para
          verla en el mapa.
        </p>

        <div className="mt-8">
          <BranchesMapWithList />
        </div>
      </div>
    </main>
  )
}