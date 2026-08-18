import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-cookies'

const PROTECTED_ROUTES = ['/mi-cuenta', '/checkout']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  if (!request.cookies.has(ACCESS_TOKEN_COOKIE)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/mi-cuenta/:path*', '/checkout/:path*'],
}
