'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { selectSubtotal, useCartStore } from '@/lib/cartStore'
import { formatColones } from '@/lib/utils'

export default function CarritoPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const subtotal = useCartStore(selectSubtotal)

  function handleCheckout() {
    // TODO(sync): al conectar el ShoppingCartController, este es el punto donde
    // habría que enviar/confirmar el carrito local contra el carrito del servidor
    // antes de navegar a /checkout.
    router.push('/checkout')
  }

  return (
    <>
      <div className="bg-homex-blue">
        <Navbar />
      </div>

      <main className="flex-1 bg-white py-12 lg:py-16">
        <div className="mx-auto w-full max-w-3xl px-5 md:px-8 lg:px-16">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-homex-blue sm:text-3xl">
            <ShoppingCart className="h-7 w-7" strokeWidth={2.5} aria-hidden="true" />
            Tu carrito
          </h1>

          {items.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-homex-text/60">Tu carrito está vacío.</p>
              <Link
                href="/catalogo"
                className="text-sm font-semibold text-homex-blue underline"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-8 divide-y divide-homex-surface">
                {items.map((item) => (
                  <li key={item.product.id} className="flex items-center gap-4 py-5">
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
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-homex-blue/30">
                            <Minus className="h-4 w-4" aria-hidden="true" />
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
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-homex-blue/30">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-base font-bold text-homex-blue">
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

              <div className="mt-6 flex flex-col items-end gap-4 border-t border-homex-surface pt-6">
                <div className="flex items-center gap-3 text-base">
                  <span className="font-semibold text-homex-text">Subtotal</span>
                  <span className="text-xl font-extrabold text-homex-blue">
                    {formatColones(subtotal)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="flex items-center justify-center rounded-full bg-homex-yellow px-6 py-3 text-sm font-semibold text-homex-blue-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-homex-yellow-dark hover:shadow-button"
                >
                  Ir a pagar
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
