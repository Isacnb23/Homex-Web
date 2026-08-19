'use client'

import { useEffect, useState } from 'react'

// Devuelve `value` recién después de `delayMs` ms sin cambios. Para inputs de
// búsqueda: evita disparar un fetch en cada tecla.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}