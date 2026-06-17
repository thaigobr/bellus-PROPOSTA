import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAllProposalSlugs } from '@/data/proposals'

/**
 * Raiz. As propostas são privadas (acessadas por link próprio), mas para
 * facilitar a visualização do projeto a raiz leva direto à primeira proposta.
 *
 * Quando você tiver várias propostas reais, pode trocar este redirect por uma
 * página neutra (as propostas continuam acessíveis em /proposta/<slug>).
 */
export default function Home() {
  const slugs = getAllProposalSlugs()

  if (slugs.length > 0) {
    redirect(`/proposta/${slugs[0]}`)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-5">Bellus Eventos</p>
      <h1 className="font-serif text-3xl text-ink">Área privada de propostas</h1>
      <p className="mt-4 max-w-prose text-ink-soft">
        As propostas da Bellus são pessoais e acessadas por um link exclusivo enviado pela nossa
        equipe.
      </p>
      <Link href="/proposta/mariana-e-lucas" className="btn-primary mt-8">
        Ver proposta de demonstração
      </Link>
    </main>
  )
}
