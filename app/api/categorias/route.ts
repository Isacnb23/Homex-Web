import { NextResponse } from 'next/server'
import { getFamilies, toCategory } from '@/lib/mercasavip'

export async function GET() {
  const result = await getFamilies()

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  const categorias = result.data.map(toCategory)
  return NextResponse.json(categorias)
}
