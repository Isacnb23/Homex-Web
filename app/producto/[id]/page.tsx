import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import { getProductById } from '@/lib/mercasavip'
import { getServerSession } from '@/lib/session'
import { formatColones } from '@/lib/utils'
import AddToCartButton from '@/components/AddToCartButton'
import ProductImage from '@/components/ProductImage'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession()
  const accountNum = session.user?.accountNum

  const result = await getProductById(id, accountNum)

  if (!result.ok || !result.data) {
    notFound()
  }

  const product = result.data

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/catalogo"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-homex-blue hover:text-homex-blue-dark"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Volver al catálogo
      </Link>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-homex-yellow/60 bg-homex-surface">
          <ProductImage imageUrl={product.imageUrl} name={product.name} />
          {product.discountPercent ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-homex-yellow px-3 py-1.5 text-xs font-semibold text-homex-blue-dark">
              <Tag className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              -{Math.round(product.discountPercent)}% de descuento
            </span>
          ) : product.inPromo ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-homex-yellow px-3 py-1.5 text-xs font-semibold text-homex-blue-dark">
              <Tag className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              Promo
            </span>
          ) : null}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-homex-blue/70">
            {product.category}
          </span>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-homex-text sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-homex-blue">
              {formatColones(product.price)}
            </span>
            <span className="text-sm text-homex-text/60">/ {product.unit}</span>
          </div>

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          <dl className="mt-8 space-y-2 border-t border-homex-text/10 pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-homex-text/60">Presentación</dt>
              <dd className="font-medium text-homex-text">{product.unit}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-homex-text/60">Categoría</dt>
              <dd className="font-medium text-homex-text">{product.category}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  )
}