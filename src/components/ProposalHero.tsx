import { Proposal, isPending } from '@/data/types'
import { formatDateLong } from '@/lib/format'
import { Eyebrow } from './ui'
import { ArrowRight } from './icons'

function coupleName(p: Proposal) {
  return p.client.partnerName ? `${p.client.name} & ${p.client.partnerName}` : p.client.name
}

function Availability({ proposal }: { proposal: Proposal }) {
  const status = proposal.meta.availabilityStatus
  if (isPending(status)) return null

  const map = {
    available: { dot: 'bg-emerald-400', label: 'Data disponível no momento' },
    on_hold: { dot: 'bg-amber-400', label: 'Data em pré-reserva' },
    unavailable: { dot: 'bg-rose-400', label: 'Data indisponível' },
  } as const
  const it = map[status]

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-line-dark bg-white/5 px-4 py-2 text-sm text-cream/85 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        {status === 'available' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${it.dot}`} />
      </span>
      {it.label}
    </div>
  )
}

export function ProposalHero({ proposal }: { proposal: Proposal }) {
  const { event } = proposal
  const meta = [event.type, formatDateLong(event.date), event.venue, event.city].filter(Boolean)

  return (
    <header className="relative isolate overflow-hidden bg-charcoal text-cream">
      <div className="grain absolute inset-0" aria-hidden />
      {/* brilho dourado sutil */}
      <div
        className="absolute inset-x-0 top-[-10%] -z-10 h-[60%] opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(50% 60% at 50% 0%, rgba(199,162,107,0.25), transparent)' }}
        aria-hidden
      />

      <div className="container-content flex min-h-[88dvh] flex-col justify-center py-20 sm:min-h-[92dvh]">
        <div className="max-w-3xl animate-fade-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_bellus.png" alt="Bellus Eventos" className="mb-8 h-20 w-auto sm:h-24" />
          <Eyebrow light>Proposta para</Eyebrow>

          <h1 className="mt-5 text-balance font-serif text-6xl font-light leading-[1.02] text-cream sm:text-[5.5rem]">
            {coupleName(proposal)}
          </h1>

          <p className="mt-7 max-w-xl text-balance text-lg text-cream/80 sm:text-xl">
            Uma proposta criada para preservar tudo o que vocês vão viver em{' '}
            <span className="text-gold-soft">{formatDateLong(event.date)}</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-cream/65">
            {meta.map((m, i) => (
              <span key={m} className="inline-flex items-center gap-3">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-gold-soft/60" aria-hidden />}
                {m}
              </span>
            ))}
          </div>

          <div className="mt-10">
            <Availability proposal={proposal} />
          </div>

          <div className="mt-10">
            <a href="#seu-evento" className="btn-primary">
              Ver Proposta
              <ArrowRight width={18} height={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="container-content pb-8">
        <div className="hairline" />
      </div>
    </header>
  )
}
