import Link from 'next/link'
import {
  CupSoda,
  Hammer,
  Home,
  Package,
  ShoppingBasket,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/lib/types'

// Las categorías reales de HomeX vienen como strings simples (HE_GetFamilies),
// sin imagen propia. Mapeamos un ícono genérico por nombre y usamos Package
// para cualquier categoría nueva que no esté en esta lista.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Alimentos: ShoppingBasket,
  Bebidas: CupSoda,
  'Construcción': Hammer,
  'Cuidado del Hogar': Home,
  'Cuidado Personal': Sparkles,
  'Electrónica': Zap,
}

export default function CategoryTile({ category }: { category: Category }) {
  const Icon = CATEGORY_ICONS[category.name] ?? Package

  return (
    <Link
      href={`/catalogo?categoria=${encodeURIComponent(category.name)}`}
      className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-homex-yellow/60 bg-white p-4 text-center shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-homex-blue/10 text-homex-blue transition-colors duration-300 group-hover:bg-homex-blue group-hover:text-white">
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="text-xs font-semibold text-homex-text sm:text-sm">{category.name}</span>
    </Link>
  )
}
