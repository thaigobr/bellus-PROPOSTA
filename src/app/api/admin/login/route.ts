import { NextResponse } from 'next/server'
import { getByLogin } from '@/lib/users-store'
import { verifyPassword } from '@/lib/hash'
import { SESSION_COOKIE, signSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Login por usuário/e-mail + senha (formulário HTML puro). */
export async function POST(req: Request) {
  const fd = await req.formData()
  const login = String(fd.get('login') ?? '')
  const password = String(fd.get('password') ?? '')
  const nextRaw = String(fd.get('next') ?? '/admin')
  const safeNext = nextRaw.startsWith('/admin') ? nextRaw : '/admin'

  const user = await getByLogin(login)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.redirect(
      new URL(`/admin/login?erro=1&next=${encodeURIComponent(safeNext)}`, req.url),
      303,
    )
  }

  const res = NextResponse.redirect(new URL(safeNext, req.url), 303)
  res.cookies.set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
