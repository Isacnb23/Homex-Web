import type { Category } from '@/lib/types'

export default function CategoryCard({
  category,
  selected,
  onClick,
}: {
  category: Category
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-homex-blue focus-visible:ring-offset-2 sm:text-sm ${
        selected
          ? 'bg-homex-blue text-white shadow-button'
          : 'border border-homex-blue/15 bg-homex-surface text-homex-blue hover:border-homex-blue/40 hover:bg-homex-blue/5'
      }`}
    >
      {category.name}
    </button>
  )
}
