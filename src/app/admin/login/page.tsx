import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel · Bellus',
  robots: { index: false, follow: false },
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { erro?: string; next?: string }
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-charcoal px-6">
      <form method="post" action="/api/admin/login" className="w-full max-w-sm rounded-xl2 border border-line-dark bg-bg p-7 shadow-lift">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo_bellus.png" alt="Bellus Eventos" className="mx-auto h-14 w-auto" />
        <h1 className="mt-5 text-center text-lg font-semibold text-ink">Painel de propostas</h1>
        <p className="mt-1 text-center text-sm text-ink-soft">Acesso restrito da equipe</p>

        <input type="hidden" name="next" value={searchParams.next ?? '/admin'} />
        <label className="adm-label mt-6">
          Usuário ou e-mail
          <input name="login" autoFocus required autoComplete="username" className="adm-field" />
        </label>
        <label className="adm-label mt-4">
          Senha
          <input name="password" type="password" required autoComplete="current-password" className="adm-field" />
        </label>
        {searchParams.erro && (
          <p className="mt-2 text-sm text-rose-600">Usuário ou senha incorretos.</p>
        )}
        <button type="submit" className="btn-primary mt-5 w-full">
          Entrar
        </button>
      </form>
    </main>
  )
}
