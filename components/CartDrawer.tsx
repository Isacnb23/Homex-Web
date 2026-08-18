'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { selectSubtotal, useCartStore } from '@/lib/cartStore'
import { formatColones } from '@/lib/utils'

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const subtotal = useCartStore(selectSubtotal)

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function handleCheckout() {
    onClose()
    // TODO(sync): al conectar el ShoppingCartController, este es el punto donde
    // habría que enviar/confirmar el carrito local contra el carrito del servidor
    // antes de navegar a /checkout.
    router.push('/checkout')
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-card-hover transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-homex-surface px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-homex-blue">
            <ShoppingCart className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            Tu carrito
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-homex-text/60 hover:bg-homex-surface hover:text-homex-text"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart className="h-10 w-10 text-homex-text/20" aria-hidden="true" />
            <p className="text-sm text-homex-text/60">Tu carrito está vacío.</p>
            <Link
              href="/catalogo"
              onClick={onClose}
              className="text-sm font-semibold text-homex-blue underline"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex items-center gap-3 border-b border-homex-surface py-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold leading-snug text-homex-text">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-homex-text/60">
                      {formatColones(item.product.price)} / {item.product.unit}
                    </p>

                    <div className="mt-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        aria-label="Restar cantidad"
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-homex-blue hover:bg-homex-surface"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-homex-blue/30">
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        aria-label="Sumar cantidad"
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-homex-blue hover:bg-homex-surface"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-homex-blue/30">
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-homex-blue">
                      {formatColones(item.product.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      aria-label="Quitar producto"
                      className="flex min-h-11 min-w-11 items-center justify-center text-homex-text/40 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-homex-surface px-5 py-4">
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-homex-text">Subtotal</span>
                <span className="text-xl font-extrabold text-homex-blue">
                  {formatColones(subtotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-homex-yellow px-5 py-3 text-sm font-semibold text-homex-blue-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-yellow-dark hover:shadow-button"
              >
                Ir a pagar
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
