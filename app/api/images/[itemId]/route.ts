import { NextRequest, NextResponse } from 'next/server'

// El backend de imágenes de MercasaVIP solo tiene HTTP plano; si lo pedimos
// directo desde un sitio HTTPS el navegador lo bloquea por mixed content. Este
// proxy server-side lo trae por HTTP y lo re-sirve por nuestro propio HTTPS.
const IMAGES_HOST = 'http://186.176.206.154:8088/images/Products'

// Los ItemId de MercasaVIP son alfanuméricos (+ guiones/puntos); cualquier
// otra cosa la rechazamos antes de construir la URL upstream.
const SAFE_ITEM_ID = /^[A-Za-z0-9_.-]+$/

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params

  if (!SAFE_ITEM_ID.test(itemId)) {
    return NextResponse.json({ error: 'itemId inválido' }, { status: 400 })
  }

  try {
    const upstream = await fetch(`${IMAGES_HOST}/${itemId}_l_.PNG`, { cache: 'no-store' })

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'No se pudo obtener la imagen' }, { status: 502 })
  }
}
