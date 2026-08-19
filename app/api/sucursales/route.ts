import { NextResponse } from 'next/server'
import { getActiveSites, toBranch } from '@/lib/mercasavip'

export async function GET() {
  const result = await getActiveSites()

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  const sucursales = result.data.map(toBranch)
  return NextResponse.json(sucursales)
}
