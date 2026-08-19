// Formatea un número a colones costarricenses: ₡1.650 (sin decimales, separador de miles con punto).
export function formatColones(n: number): string {
  const rounded = Math.round(n)
  const withThousands = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `₡${withThousands}`
}