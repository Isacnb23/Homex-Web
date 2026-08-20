import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CUSTOMER_ID_COOKIE } from '@/lib/auth-cookies'
import { createDirection } from '@/lib/directions'
import type { DirectionInput } from '@/lib/auth-types'

export async function POST(request: NextRequest) {
  const store = await cookies()
  const vatNum = store.get(CUSTOMER_ID_COOKIE)?.value

  if (!vatNum) {
    return NextResponse.json({ error: 'No hay sesión activa' }, { status: 401 })
  }

  const data = (await request.json()) as DirectionInput

  if (!data.fullName || !data.province || !data.canton || !data.address) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const result = await createDirection(vatNum, data)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true, message: result.message })
}