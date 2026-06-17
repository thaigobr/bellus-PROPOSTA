import Link from 'next/link'
import { getAllProposalSlugs } from '@/data/proposals'

/**
 * Raiz privada. Não é uma página pública de marketing — apenas um acesso
 * discreto. Em desenvolvimento, lista os slugs cadastrados para facilitar.
 */
export default function Home() {
  const slugs = getAllProposalSlugs()
  const isDev = process.env.NODE_ENV !== 'production'

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-5">Bellus Eventos</p>
      <h1 className="font-serif text-3xl text-ink">Área privada de propostas</h1>
      <p className="mt-4 max-w-prose text-ink-soft">
        As propostas da Bellus são pessoais e acessadas por um link exclusivo enviado pela nossa
        equipe.
      </p>

      {isDev && slugs.length > 0 && (
        <div className="mt-10 w-full max-w-sm rounded-xl2 border border-line bg-cream p-5 text-left">
          <p className="eyebrow mb-3">Dev · propostas cadastradas</p>
          <ul className="space-y-2">
            {slugs.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/proposta/${slug}`}
                  className="text-gold underline-offset-4 hover:underline"
                >
                  /proposta/{slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
