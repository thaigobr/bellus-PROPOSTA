/** Átomos de UI compartilhados. */
import { ReactNode } from 'react'
import { Price, isPending } from '@/data/types'
import { formatBRL } from '@/lib/format'
import { ParticlesCanvas } from './ParticlesCanvas'

export function Eyebrow({
  children,
  light,
  className = '',
}: {
  children: ReactNode
  light?: boolean
  className?: string
}) {
  return <p className={`eyebrow ${light ? 'eyebrow--light' : ''} ${className}`}>{children}</p>
}

interface SectionProps {
  id?: string
  eyebrow?: string
  title?: ReactNode
  intro?: ReactNode
  dark?: boolean
  className?: string
  children: ReactNode
}

/** Seção com cabeçalho editorial padronizado e ritmo vertical consistente. */
export function Section({ id, eyebrow, title, intro, dark, className = '', children }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-20 py-16 sm:py-24 ${
        dark ? 'overflow-hidden bg-charcoal text-cream' : ''
      } ${className}`}
    >
      {dark && (
        <ParticlesCanvas
          className="pointer-events-none absolute inset-0 h-full w-full"
          fadeBottom={0.6}
        />
      )}
      <div className="container-content relative z-10">
        {(eyebrow || title || intro) && (
          <header className="mb-10 max-w-2xl sm:mb-14">
            {eyebrow && <Eyebrow light={dark}>{eyebrow}</Eyebrow>}
            {title && (
              <h2
                className={`mt-4 text-balance font-serif text-3xl font-light sm:text-[2.6rem] sm:leading-[1.08] ${
                  dark ? 'text-cream' : 'text-ink'
                }`}
              >
                {title}
              </h2>
            )}
            {intro && (
              <p className={`mt-4 text-lg ${dark ? 'text-cream/70' : 'text-ink-soft'}`}>{intro}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

/** Marcador visível de informação a preencher pela equipe. */
export function PendingMark({ note, light }: { note: string; light?: boolean }) {
  return (
    <span
      title={`Informação a preencher: ${note}`}
      className={`inline-flex items-center gap-1 rounded border border-dashed px-1.5 py-0.5 align-middle text-[0.7rem] font-medium uppercase tracking-wide ${
        light
          ? 'border-gold-soft/50 text-gold-soft'
          : 'border-gold/50 bg-gold/5 text-gold'
      }`}
    >
      [preencher: {note}]
    </span>
  )
}

/** Exibe um preço ou, se pendente, o marcador. */
export function PriceTag({
  price,
  className = '',
  light,
}: {
  price: Price
  className?: string
  light?: boolean
}) {
  if (isPending(price)) return <PendingMark note={price.note} light={light} />
  return <span className={className}>{formatBRL(price)}</span>
}

/** Selo "Recomendado" com justificativa real. */
export function RecommendedBadge({ light }: { light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider ${
        light ? 'bg-gold-soft text-charcoal' : 'bg-gold text-white'
      }`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="m12 2 2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
      </svg>
      Recomendado
    </span>
  )
}

/** Aviso visível do downsell: 5 min por R$ 900 em vez de R$ 990. */
export function DownsellBanner() {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-[var(--green)]/35 bg-[var(--green)]/[0.08] p-3.5">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--green)] text-white"
        aria-hidden
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="text-sm leading-relaxed text-ink">
        <span className="font-semibold text-[var(--green)]">Condição especial liberada:</span> agora cada
        5 minutos de filme sai por <strong>R$ 900</strong>, em vez de R$ 990. É só adicionar.
      </p>
    </div>
  )
}
