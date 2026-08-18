export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-2xl border border-homex-surface bg-white shadow-card"
    >
      <div className="h-36 animate-pulse bg-homex-surface" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-homex-surface" />
        <div className="h-3.5 w-full animate-pulse rounded-full bg-homex-surface" />
        <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-homex-surface" />
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-homex-surface" />
          <div className="h-3 w-8 animate-pulse rounded-full bg-homex-surface" />
        </div>
        <div className="mt-3 h-9 w-full animate-pulse rounded-full bg-homex-surface" />
      </div>
    </div>
  )
}
