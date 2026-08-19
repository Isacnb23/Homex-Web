'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ImageOff, Plus, Tag } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/cartStore'
import { formatColones } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const [justAdded, setJustAdded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // TODO: por ahora no hay dato claro de stock/disponibilidad en Product (falta
  // exponer AvailPhysical desde el BFF), así que el botón queda siempre activo.
  const outOfStock = false

  function handleAddToCart() {
    addItem(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-homex-yellow/60 bg-white shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={`/producto/${encodeURIComponent(product.id)}`} className="flex flex-1 flex-col">
        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-homex-surface">
          {product.imageUrl && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <ImageOff className="h-8 w-8 text-homex-text/30" aria-hidden="true" />
          )}
          {product.inPromo && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-homex-yellow px-2.5 py-1 text-[10px] font-semibold text-homex-blue-dark">
              <Tag className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
              Promo
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4 pb-0">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-homex-blue/70">
            {product.category}
          </span>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-homex-text">
            {product.name}
          </h3>
          <div className="mt-auto flex items-baseline justify-between pt-2">
            <span className="text-lg font-extrabold text-homex-blue">
              {formatColones(product.price)}
            </span>
            <span className="text-xs text-homex-text/60">/ {product.unit}</span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            justAdded
              ? 'bg-green-600 text-white'
              : 'bg-homex-blue text-white hover:-translate-y-0.5 hover:bg-homex-blue-dark hover:shadow-button'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              Agregado
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              Agregar
            </>
          )}
        </button>
      </div>
    </div>
  )
}