/** Sessão por cookie assinado (HMAC) + helpers de autorização. Server-only. */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import crypto from 'crypto'
import { getUser } from './users-store'
import { User } from '@/data/users'

export const SESSION_COOKIE = 'bellus_session'
const SECRET = process.env.ADMIN_SECRET || 'dev-bellus-secret-change-me'

function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex')
}

export function signSession(userId: string): string {
  return `${userId}.${sign(userId)}`
}

export function verifySession(token?: string | null): string | null {
  if (!token) return null
  const i = token.lastIndexOf('.')
  if (i <= 0) return null
  const id = token.slice(0, i)
  const sig = token.slice(i + 1)
  const expected = sign(id)
  try {
    if (sig.length !== expected.length) return null
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null
  } catch {
    return null
  }
  return id
}

export async function getCurrentUser(): Promise<User | null> {
  const id = verifySession(cookies().get(SESSION_COOKIE)?.value)
  if (!id) return null
  return (await getUser(id)) ?? null
}

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser()
  if (!u) redirect('/admin/login')
  return u
}

export async function requireTeamManager(): Promise<User> {
  const u = await requireUser()
  if (u.role !== 'owner' && u.role !== 'admin') redirect('/admin')
  return u
}
