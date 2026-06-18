import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifySession } from '@/lib/auth'
import { recordView } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  // Não conta a visualização de quem está logado no painel (o operador).
  const isOperator = Boolean(verifySession(cookies().get(SESSION_COOKIE)?.value))
  if (!isOperator) await recordView(params.slug)
  return new Response(null, { status: 204 })
}
