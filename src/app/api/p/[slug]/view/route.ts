import { cookies } from 'next/headers'
import { ADMIN_COOKIE, ADMIN_TOKEN } from '@/lib/admin-auth'
import { recordView } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  // Não conta a visualização do próprio operador (quem está logado no painel).
  const isAdmin = cookies().get(ADMIN_COOKIE)?.value === ADMIN_TOKEN
  if (!isAdmin) await recordView(params.slug)
  return new Response(null, { status: 204 })
}
