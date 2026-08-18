import { useEffect, useState } from 'react'

// Formatea un número a colones costarricenses: ₡1.650 (sin decimales, separador de miles con punto).
export function formatColones(n: number): string {
  const rounded = Math.round(n)
  const withThousands = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `₡${withThousands}`
}

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
