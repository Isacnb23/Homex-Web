'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

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
    (set) => ({
      items: [],
      hasHydrated: false,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id)
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
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((item) => item.product.id !== productId),
          }))
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      // TODO(sync): cuando el login esté conectado, al hacer login/hidratar acá
      // se debería mergear/reemplazar este carrito local con el carrito del
      // usuario en el ShoppingCartController ([Authorize]) de la MercasaVIP API.
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
