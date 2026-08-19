'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/cartStore'

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const [justAdded, setJustAdded] = useState(false)

  function handleAddToCart() {
    addItem(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2 sm:w-auto ${
        justAdded
          ? 'bg-green-600 text-white'
          : 'bg-homex-blue text-white hover:-translate-y-0.5 hover:bg-homex-blue-dark hover:shadow-button'
      }`}
    >
      {justAdded ? (
        <>
          <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          Agregado al carrito
        </>
      ) : (
        <>
          <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          Agregar al carrito
        </>
      )}
    </button>
  )
}