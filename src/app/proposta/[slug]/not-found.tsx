import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-5">Bellus Eventos</p>
      <h1 className="font-serif text-3xl text-ink">Proposta não encontrada</h1>
      <p className="mt-4 max-w-prose text-ink-soft">
        Este link pode ter expirado ou estar incorreto. Se você recebeu esta proposta da nossa
        equipe, fale com a gente para receber o link atualizado.
      </p>
      <Link href="/" className="btn-ghost mt-8">
        Voltar ao início
      </Link>
    </main>
  )
}
