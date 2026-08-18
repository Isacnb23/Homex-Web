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

  if (!data?.id || !data?.password) {
    return NextResponse.json({ error: 'Id y contraseña son obligatorios' }, { status: 400 })
  }

  const result = await register(data)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  // UserRegisterHE no devuelve un usuario ni loguea automáticamente: el front
  // debe redirigir a /login después de esto.
  return NextResponse.json({ message: result.data.message })
}
