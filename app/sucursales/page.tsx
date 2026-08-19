import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BranchesSection from '@/components/BranchesSection'

export const metadata: Metadata = {
  title: 'Sucursales | HomeX Supermercado',
  description: 'Encontrá la sucursal HomeX más cercana en el mapa.',
}

export default function SucursalesPage() {
  return (
    <>
      <div className="bg-homex-blue">
        <Navbar />
      </div>
      <BranchesSection />
      <Footer />
    </>
  )
}
