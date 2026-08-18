import { ImageOff, Tag } from 'lucide-react'
import type { Product } from '@/lib/types'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-homex-yellow/60 bg-white shadow-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-card-hover">
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-homex-surface">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
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

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-homex-blue/70">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold leading-snug text-homex-text">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="text-lg font-extrabold text-homex-blue">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs text-homex-text/60">/ {product.unit}</span>
        </div>
      </div>
    </div>
  )
}
