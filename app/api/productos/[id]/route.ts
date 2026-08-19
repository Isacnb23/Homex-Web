import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/mercasavip'
import { getServerSession } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await getServerSession()
  const accountNum = session.user?.accountNum

  const result = await getProductById(id, accountNum)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  if (!result.data) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  return NextResponse.json(result.data)
}