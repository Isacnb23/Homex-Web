'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

// Sincroniza con el servidor SIN bloquear ni depender del resultado (el
// carrito local ya se actualizó; esto solo intenta reportarlo al
// ShoppingCartController). Si falla (sin sesión, red, lo que sea), se ignora
// en silencio — el usuario sigue viendo su carrito local normalmente.
function fireAndForget(url: string, body: unknown) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {
    /* silencioso: el carrito local sigue siendo válido igual */
  })
}

interface CartStore {
  items: CartItem[]
  hasHydrated: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setHasHydrated: (value: boolean) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      addItem: (product, quantity = 1) => {
        const existing = get().items.find((item) => item.product.id === product.id)
        const newQuantity = existing ? existing.quantity + quantity : quantity

        set((state) => {
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })

        // Si ya existía la línea, es un UPDATE con la cantidad nueva; si es
        // nueva, un CREATE.
        fireAndForget(existing ? '/api/cart/update' : '/api/cart/add', {
          itemId: product.id,
          quantity: newQuantity,
          unitId: product.unit,
        })
      },

      removeItem: (productId) => {
        const item = get().items.find((i) => i.product.id === productId)
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
        if (item) {
          fireAndForget('/api/cart/remove', {
            itemId: item.product.id,
            unitId: item.product.unit,
          })
        }
      },

      updateQuantity: (productId, quantity) => {
        const item = get().items.find((i) => i.product.id === productId)
        if (!item) return

        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((item) => item.product.id !== productId),
          }))
          fireAndForget('/api/cart/remove', {
            itemId: item.product.id,
            unitId: item.product.unit,
          })
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
        fireAndForget('/api/cart/update', {
          itemId: item.product.id,
          quantity,
          unitId: item.product.unit,
        })
      },

      clearCart: () => set({ items: [] }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'homex-cart',
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Selectores derivados (no se guardan como estado, se calculan al vuelo).
export const selectTotalItems = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectSubtotal = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

export const selectItemCount = (state: CartStore) => state.items.length