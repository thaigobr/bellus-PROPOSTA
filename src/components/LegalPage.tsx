export interface LegalSection {
  title: string
  body: string[]
}

/** Layout simples e legível para páginas de Termos e Privacidade. */
export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <main className="min-h-dvh bg-bg">
      <header className="bg-charcoal">
        <div className="container-content flex items-center justify-between py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_bellus.png" alt="Bellus Eventos" className="h-12 w-auto" />
          <span className="text-xs uppercase tracking-wider text-cream/55">{title}</span>
        </div>
      </header>

      <article className="container-content max-w-3xl py-14">
        <p className="eyebrow">Bellus Eventos</p>
        <h1 className="mt-3 font-serif text-4xl font-light text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{intro}</p>

        <div className="mt-10 space-y-7">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-ink">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-2 leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <hr className="my-10 border-line" />
        <p className="text-sm text-ink-soft">
          Bellus Eventos · CNPJ 30.922.038/0001-82 · Teresópolis/RJ · WhatsApp (21) 98163-6666 ·
          contato@belluseventos.com.br
        </p>
      </article>
    </main>
  )
}
