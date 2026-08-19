'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export default function ProductImage({
  imageUrl,
  name,
}: {
  imageUrl: string | null
  name: string
}) {
  const [imageError, setImageError] = useState(false)

  if (!imageUrl || imageError) {
    return <ImageOff className="h-16 w-16 text-homex-text/30" aria-hidden="true" />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={name}
      onError={() => setImageError(true)}
      className="h-full w-full object-contain p-6"
    />
  )
}