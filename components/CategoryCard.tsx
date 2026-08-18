import type { Category } from '@/lib/types'

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <button
      type="button"
      className="group overflow-hidden rounded-2xl border border-homex-yellow/60 bg-white shadow-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-card-hover"
    >
      <div className="bg-homex-blue py-3 text-center">
        <span className="text-xs font-semibold text-white sm:text-sm">
          {category.name}
        </span>
      </div>
    </button>
  )
}
