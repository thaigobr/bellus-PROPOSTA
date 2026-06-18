import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_PASSWORD, ADMIN_TOKEN } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** Login via formulário HTML puro (sem JS). Define o cookie no redirect. */
export async function POST(req: Request) {
  const fd = await req.formData()
  const password = String(fd.get('password') ?? '')
  const nextRaw = String(fd.get('next') ?? '/admin')
  const safeNext = nextRaw.startsWith('/admin') ? nextRaw : '/admin'

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.redirect(
      new URL(`/admin/login?erro=1&next=${encodeURIComponent(safeNext)}`, req.url),
      303,
    )
  }

  const res = NextResponse.redirect(new URL(safeNext, req.url), 303)
  res.cookies.set(ADMIN_COOKIE, ADMIN_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
