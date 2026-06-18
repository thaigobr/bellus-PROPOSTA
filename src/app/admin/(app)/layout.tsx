import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Painel · Bellus',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-ivory">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_bellus.png" alt="Bellus" className="h-8 w-auto" />
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="font-medium text-ink hover:text-gold">
                Propostas
              </Link>
              <Link href="/admin/agenda" className="font-medium text-ink hover:text-gold">
                Agenda
              </Link>
              <Link href="/admin/nova" className="font-medium text-gold hover:underline">
                + Nova
              </Link>
            </nav>
          </div>
          <form method="post" action="/api/admin/logout">
            <button type="submit" className="text-sm text-ink-soft hover:text-ink">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
