'use client'

import { Addon, Package, PaymentOption, Proposal, isPending } from '@/data/types'
import { PriceBreakdown, addonLineMinutes, addonLineTotal } from '@/lib/pricing'
import { formatBRL, formatBRLCents, formatDateShort } from '@/lib/format'
import { PendingMark, DownsellBanner } from './ui'
import { Plus, Minus } from './icons'

function Line({
  label,
  value,
  strong,
  accent,
}: {
  label: React.ReactNode
  value: React.ReactNode
  strong?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className={strong ? 'font-medium text-ink' : 'text-ink-soft'}>{label}</span>
      <span
        className={`tabular-nums ${
          accent ? 'text-[var(--green)]' : strong ? 'font-medium text-ink' : 'text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function StepBtn({
  onClick,
  disabled,
  children,
  label,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--green)] text-[var(--green)] transition-colors hover:bg-[var(--green)] hover:text-white disabled:opacity-30"
    >
      {children}
    </button>
  )
}

/** Stepper de adicional por minutagem dentro do resumo (adicionar/retirar aqui). */
function SummaryStepper({
  addon,
  quantity,
  onChange,
}: {
  addon: Addon
  quantity: number
  onChange: (id: string, q: number) => void
}) {
  const max = addon.maxUnits ?? 6
  const minutes = addonLineMinutes({ addon, quantity })
  const total = addonLineTotal({ addon, quantity })
  return (
    <div className="rounded-lg bg-ivory/70 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{addon.name}</span>
        <span className="text-sm font-semibold tabular-nums text-ink">
          {quantity > 0 ? `+ ${formatBRL(total)}` : formatBRL(0)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <StepBtn onClick={() => onChange(addon.id, quantity - 1)} disabled={quantity <= 0} label="Retirar minutos">
          <Minus width={15} height={15} />
        </StepBtn>
        <span className="w-14 text-center text-sm tabular-nums text-ink">{minutes} min</span>
        <StepBtn onClick={() => onChange(addon.id, quantity + 1)} disabled={quantity >= max} label="Adicionar minutos">
          <Plus width={15} height={15} />
        </StepBtn>
      </div>
    </div>
  )
}

export function OrderSummary({
  proposal,
  selectedPackage,
  selectedPayment,
  breakdown,
  addons,
  quantities,
  onAddonChange,
  downsell,
}: {
  proposal: Proposal
  selectedPackage?: Package
  selectedPayment?: PaymentOption
  breakdown: PriceBreakdown
  addons: Addon[]
  quantities: Record<string, number>
  onAddonChange: (id: string, q: number) => void
  downsell?: boolean
}) {
  const expires = proposal.meta.expiresAt
  const quantityAddons = addons.filter((a) => a.kind === 'quantity')
  const toggleLines = addons
    .filter((a) => (a.kind ?? 'toggle') === 'toggle')
    .map((a) => ({ addon: a, quantity: quantities[a.id] ?? 0 }))
    .filter((l) => l.quantity > 0)
  // Inclui prévia: pacotes com "Prévia" ou que herdam o Diamante (que tem prévia).
  const incluiPrevia = selectedPackage?.deliverables.some((d) => /pr[ée]via|diamante/i.test(d.label))

  return (
    <div className="rounded-xl2 border border-line bg-bg p-6 shadow-soft">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-ink">Sua contratação</h3>
        <span className="text-xs uppercase tracking-wide text-ink-soft">
          {proposal.event.type} · {formatDateShort(proposal.event.date)}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <Line
          label={selectedPackage ? `Experiência ${selectedPackage.name}` : 'Selecione uma experiência'}
          value={
            selectedPackage ? (
              isPending(selectedPackage.price) ? (
                <PendingMark note={selectedPackage.price.note} />
              ) : (
                formatBRL(selectedPackage.price)
              )
            ) : (
              ''
            )
          }
          strong
        />

        {incluiPrevia && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--green)]/30 bg-[var(--green)]/[0.07] px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-ink">
              <span className="rounded-full bg-[var(--green)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white">
                Bônus
              </span>
              Prévia em até 15 dias
            </span>
            <span className="text-sm font-medium text-[var(--green)]">Cortesia</span>
          </div>
        )}

        {toggleLines.map((l) => (
          <Line
            key={l.addon.id}
            label={l.addon.name}
            value={`+ ${formatBRL(addonLineTotal(l))}`}
          />
        ))}
      </div>

      {/* Tempo extra: adicionar/retirar aqui mesmo */}
      {quantityAddons.length > 0 && (
        <div className="mt-4 space-y-2">
          {downsell && <DownsellBanner />}
          {quantityAddons.map((a) => (
            <SummaryStepper key={a.id} addon={a} quantity={quantities[a.id] ?? 0} onChange={onAddonChange} />
          ))}
        </div>
      )}

      <hr className="my-5 border-line" />

      {breakdown.pending ? (
        <p className="text-sm text-ink-soft">
          Os valores deste pacote estão <PendingMark note="a definir" />. Fale com a equipe para
          receber a condição completa.
        </p>
      ) : (
        <div className="space-y-3">
          <Line label="Subtotal" value={formatBRL(breakdown.subtotal)} />
          {breakdown.discount > 0 && (
            <Line label="Desconto à vista" value={`menos ${formatBRL(breakdown.discount)}`} accent />
          )}

          <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
            <span className="font-medium text-ink">Total</span>
            <span className="text-2xl font-semibold tabular-nums text-ink">{formatBRL(breakdown.total)}</span>
          </div>

          {selectedPayment?.kind === 'signal' && breakdown.signal != null && (
            <div className="mt-3 rounded-lg bg-ivory p-3 text-sm">
              <Line label="Sinal para reservar a data" value={formatBRL(breakdown.signal)} strong />
              <div className="mt-1.5">
                <Line label="Saldo até o casamento" value={formatBRL(breakdown.balance ?? 0)} />
              </div>
            </div>
          )}

          {selectedPayment?.kind === 'installments' && breakdown.installmentValue != null && (
            <div className="mt-3 rounded-lg bg-ivory p-3 text-sm">
              <Line
                label={`Em até ${breakdown.installmentCount}x`}
                value={formatBRLCents(breakdown.installmentValue)}
                strong
              />
            </div>
          )}
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-ink-soft">
        {isPending(expires) ? (
          <>
            Validade da proposta: <PendingMark note={expires.note} />.{' '}
          </>
        ) : (
          <>Proposta válida até {formatDateShort(expires)}. </>
        )}
        A data é confirmada após a assinatura do contrato e o pagamento do sinal.
      </p>
    </div>
  )
}
