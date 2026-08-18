'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/authStore'
import { useCartStore } from '@/lib/cartStore'

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const fetchSession = useAuthStore((state) => state.fetchSession)

  useEffect(() => {
    fetchSession()
    useCartStore.persist.rehydrate()
  }, [fetchSession])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
