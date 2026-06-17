'use client'

import { Package, Proposal, isPending } from '@/data/types'
import { formatBRLCents } from '@/lib/format'
import { Section, PriceTag, RecommendedBadge } from './ui'
import { Check } from './icons'

function installmentHint(proposal: Proposal, pkg: Package): string | null {
  const opt = proposal.paymentOptions.find((o) => o.kind === 'installments')
  if (!opt || !opt.maxInstallments || isPending(pkg.price)) return null
  const value = pkg.price / opt.maxInstallments
  return `ou em até ${opt.maxInstallments}x de ${formatBRLCents(value)}`
}

function PackageCard({
  proposal,
  pkg,
  selected,
  recommended,
  onSelect,
}: {
  proposal: Proposal
  pkg: Package
  selected: boolean
  recommended: boolean
  onSelect: () => void
}) {
  const hint = installmentHint(proposal, pkg)

  return (
    <div
      className={`relative flex flex-col rounded-xl2 border bg-bg p-6 transition-all duration-300 sm:p-7 ${
        selected
          ? 'border-gold shadow-lift ring-1 ring-gold'
          : 'border-line shadow-soft hover:border-ink-soft/40'
      }`}
    >
      {recommended && (
        <div className="absolute -top-3 left-6">
          <RecommendedBadge />
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-2xl font-medium tracking-tight text-ink">{pkg.name}</h3>
        <p className="mt-1.5 text-[0.95rem] leading-snug text-ink-soft">{pkg.positioning}</p>
      </div>

      <div className="mb-4 border-y border-line py-4">
        <PriceTag price={pkg.price} className="font-serif text-3xl text-ink" />
        {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      </div>

      {pkg.valueNote && (
        <p className="mb-4 rounded-md border border-gold/20 bg-gold/5 p-2.5 text-xs leading-relaxed text-gold">
          {pkg.valueNote}
        </p>
      )}

      <p className="mb-4 text-sm text-ink-soft">
        <span className="font-medium text-ink">Indicado para:</span> {pkg.bestFor}
      </p>

      <ul className="mb-7 space-y-2.5">
        {pkg.deliverables.map((d, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <Check
              width={17}
              height={17}
              className={`mt-0.5 shrink-0 ${d.highlight ? 'text-gold' : 'text-ink-soft'}`}
            />
            <span className={d.highlight ? 'font-medium text-ink' : 'text-ink-soft'}>
              {d.label}
              {d.detail && <span className="text-ink-soft"> — {d.detail}</span>}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`mt-auto min-h-12 rounded px-5 py-3 font-medium tracking-wide transition-colors ${
          selected
            ? 'bg-ink text-cream'
            : 'border border-ink text-ink hover:bg-ink hover:text-cream'
        }`}
      >
        {selected ? (
          <span className="inline-flex items-center gap-2">
            <Check width={18} height={18} /> Selecionado
          </span>
        ) : (
          'Selecionar esta experiência'
        )}
      </button>
    </div>
  )
}

export function PackageSelector({
  proposal,
  selectedId,
  onSelect,
}: {
  proposal: Proposal
  selectedId: string
  onSelect: (id: string) => void
}) {
  const { recommendedPackageId, recommendationReason } = proposal.meta

  return (
    <Section
      id="experiencias"
      eyebrow="As experiências"
      title="Quatro formas de guardar o seu dia"
      intro="Cada uma é um nível diferente de profundidade e de memória preservada. Os preços estão à mostra — sem letras miúdas."
    >
      {recommendedPackageId && recommendationReason && (
        <div className="mb-8 flex items-start gap-3 rounded-xl2 border border-gold/30 bg-gold/5 p-5">
          <span className="mt-0.5 shrink-0 text-gold">
            <RecommendedBadge />
          </span>
          <p className="text-[0.975rem] leading-relaxed text-ink">{recommendationReason}</p>
        </div>
      )}

      <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {proposal.packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            proposal={proposal}
            pkg={pkg}
            selected={pkg.id === selectedId}
            recommended={pkg.id === recommendedPackageId}
            onSelect={() => onSelect(pkg.id)}
          />
        ))}
      </div>
    </Section>
  )
}
