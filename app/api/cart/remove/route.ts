import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CUSTOMER_ID_COOKIE } from '@/lib/auth-cookies'
import { syncRemoveLine } from '@/lib/cart-sync'

export async function POST(request: NextRequest) {
  const store = await cookies()
  const vatNum = store.get(CUSTOMER_ID_COOKIE)?.value

  if (!vatNum) {
    return NextResponse.json({ skipped: true }, { status: 200 })
  }

  const { itemId, unitId } = await request.json()
  const result = await syncRemoveLine(vatNum, itemId, unitId)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true, message: result.message })
}