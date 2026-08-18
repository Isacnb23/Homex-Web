import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/lib/auth-api'
import type { RegisterData } from '@/lib/auth-types'

export async function POST(request: NextRequest) {
  let data: RegisterData

  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!data?.name || !data?.email || !data?.password) {
    return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 })
  }

  const result = await register(data)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ user: result.data.user })
}
