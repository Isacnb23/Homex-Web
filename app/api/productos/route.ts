import { NextRequest, NextResponse } from 'next/server'
import { getInventoryItems, toProduct } from '@/lib/mercasavip'

export async function GET(request: NextRequest) {
  const itemId = request.nextUrl.searchParams.get('itemId') ?? ''
  const result = await getInventoryItems(itemId)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  const productos = result.data.map(toProduct)
  return NextResponse.json(productos)
}
