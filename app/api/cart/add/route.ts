import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CUSTOMER_ID_COOKIE } from '@/lib/auth-cookies'
import { syncAddLine } from '@/lib/cart-sync'

export async function POST(request: NextRequest) {
  const store = await cookies()
  const vatNum = store.get(CUSTOMER_ID_COOKIE)?.value

  // Sin sesión: el carrito sigue funcionando local, solo no sincroniza.
  if (!vatNum) {
    return NextResponse.json({ skipped: true }, { status: 200 })
  }

  const { itemId, quantity, unitId } = await request.json()
  const result = await syncAddLine(vatNum, itemId, quantity, unitId)

  if (!result.ok) {
    // No rompemos la UI del carrito por esto; solo lo reportamos.
    return NextResponse.json({ error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true, message: result.message })
}