'use client'

import { Addon, Proposal, isPending } from '@/data/types'
import { formatBRL } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { track } from '@/lib/analytics'
import { Section, PendingMark } from './ui'
import { Check } from './icons'

function AddonRow({
  addon,
  selected,
  onToggle,
  proposal,
}: {
  addon: Addon
  selected: boolean
  onToggle: () => void
  proposal: Proposal
}) {
  if (isPending(addon.price)) {
    const note = addon.price.note
    const url = buildWhatsAppUrl({ proposal, doubt: true })
    return (
      <div className="flex flex-col gap-3 rounded-xl2 border border-dashed border-line bg-cream/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium text-ink">{addon.name}</h3>
          <p className="mt-1 text-sm text-ink-soft">{addon.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <PendingMark note={note} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track('whatsapp_click', { proposal_id: proposal.proposalId, x_from: 'addon_consult', addon_id: addon.id })
            }
            className="whitespace-nowrap text-sm font-medium text-gold underline-offset-4 hover:underline"
          >
            Consultar
          </a>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`flex w-full items-center gap-4 rounded-xl2 border bg-bg p-5 text-left transition-all ${
        selected ? 'border-gold ring-1 ring-gold' : 'border-line hover:border-ink-soft/40'
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
          selected ? 'border-gold bg-gold text-white' : 'border-ink-soft/40'
        }`}
        aria-hidden
      >
        {selected && <Check width={16} height={16} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-medium text-ink">{addon.name}</span>
          <span className="text-base font-semibold text-ink">+ {formatBRL(addon.price as number)}</span>
        </span>
        <span className="mt-1 block text-sm text-ink-soft">{addon.description}</span>
        <span className="mt-0.5 block text-sm text-gold/90">{addon.benefit}</span>
      </span>
    </button>
  )
}

export function AddonSelector({
  proposal,
  addons,
  selectedIds,
  onToggle,
}: {
  proposal: Proposal
  addons: Addon[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  if (!addons.length) return null
  return (
    <Section
      id="adicionais"
      eyebrow="Para ir além"
      title="Serviços adicionais"
      intro="Opcionais para complementar a sua experiência. O valor se ajusta na hora."
    >
      <div className="grid gap-3">
        {addons.map((addon) => (
          <AddonRow
            key={addon.id}
            addon={addon}
            selected={selectedIds.includes(addon.id)}
            onToggle={() => onToggle(addon.id)}
            proposal={proposal}
          />
        ))}
      </div>
    </Section>
  )
}
