import { NextResponse } from 'next/server'
import { getInventoryItemsFMCM, toProducts } from '@/lib/mercasavip'
import { getServerSession } from '@/lib/session'

export async function GET() {
  // Si hay sesión, pasamos el AccountNum del cliente para precios
  // personalizados; si no, la API igual responde con precios de lista.
  const session = await getServerSession()
  const accountNum = session.user?.accountNum

  const result = await getInventoryItemsFMCM(accountNum)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  const productos = toProducts(result.data)
  return NextResponse.json(productos)
}
