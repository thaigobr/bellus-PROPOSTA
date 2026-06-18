import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'bellus_admin'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-bellus-token'

/** Protege /admin/*. A tela de login fica acessível para autenticar. */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (token !== ADMIN_TOKEN) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin', '/admin/:path*'] }
