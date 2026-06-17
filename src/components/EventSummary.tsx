'use client'

import { Proposal, isPending } from '@/data/types'
import { formatWeekdayDate } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { track } from '@/lib/analytics'
import { Section, PendingMark } from './ui'
import { Pencil } from './icons'

export function EventSummary({ proposal }: { proposal: Proposal }) {
  const { event, meta } = proposal

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Evento', value: event.type },
    { label: 'Data', value: formatWeekdayDate(event.date) },
    { label: 'Local', value: event.venue },
    { label: 'Cidade', value: event.city },
  ]
  if (event.guestCount) {
    rows.push({
      label: 'Convidados',
      value: isPending(event.guestCount) ? (
        <PendingMark note={event.guestCount.note} />
      ) : (
        event.guestCount
      ),
    })
  }

  const correctionUrl = buildWhatsAppUrl({ proposal })

  return (
    <Section
      id="seu-evento"
      eyebrow="O dia de vocês"
      title="Os detalhes que já conhecemos"
      intro="Partimos do que vocês já nos contaram — sem precisar repetir nada."
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <dl className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-cream">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline gap-4 px-5 py-4 sm:px-6">
              <dt className="w-28 shrink-0 text-sm uppercase tracking-wide text-ink-soft">
                {r.label}
              </dt>
              <dd className="font-serif text-lg text-ink">{r.value}</dd>
            </div>
          ))}
          {event.notes && (
            <div className="px-5 py-4 sm:px-6">
              <dt className="mb-1 text-sm uppercase tracking-wide text-ink-soft">Observações</dt>
              <dd className="text-ink">{event.notes}</dd>
            </div>
          )}
        </dl>

        <div className="flex flex-col gap-6">
          {meta.personalMessage && (
            <figure className="rounded-xl2 border border-line bg-ivory p-6 sm:p-7">
              <blockquote className="font-serif text-xl leading-relaxed text-ink">
                “{meta.personalMessage}”
              </blockquote>
              <figcaption className="mt-4 text-sm text-ink-soft">
                — {proposal.contact.consultantName ?? 'Equipe Bellus'}, Bellus Eventos
              </figcaption>
            </figure>
          )}

          <a
            href={correctionUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track('whatsapp_click', { proposal_id: proposal.proposalId, x_from: 'event_correction' })
            }
            className="inline-flex items-center gap-2 self-start text-sm text-ink-soft underline-offset-4 transition-colors hover:text-gold"
          >
            <Pencil width={15} height={15} />
            Algum dado mudou? Corrigir com a gente
          </a>
        </div>
      </div>
    </Section>
  )
}
