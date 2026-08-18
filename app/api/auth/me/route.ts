import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'

export async function GET() {
  const session = await getServerSession()

  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ error: 'No hay sesión activa' }, { status: 401 })
  }

  return NextResponse.json({ user: session.user })
}
