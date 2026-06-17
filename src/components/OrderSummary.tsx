'use client'

import { Addon, Package, PaymentOption, Proposal, isPending } from '@/data/types'
import { PriceBreakdown } from '@/lib/pricing'
import { formatBRL, formatBRLCents, formatDateShort } from '@/lib/format'
import { PendingMark } from './ui'

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
          accent ? 'text-emerald-700' : strong ? 'font-medium text-ink' : 'text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export function OrderSummary({
  proposal,
  selectedPackage,
  selectedAddons,
  selectedPayment,
  breakdown,
}: {
  proposal: Proposal
  selectedPackage?: Package
  selectedAddons: Addon[]
  selectedPayment?: PaymentOption
  breakdown: PriceBreakdown
}) {
  const expires = proposal.meta.expiresAt

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
              '—'
            )
          }
          strong
        />

        {selectedAddons.length > 0 && (
          <div className="space-y-2 border-l-2 border-line pl-3">
            {selectedAddons.map((a) => (
              <Line
                key={a.id}
                label={a.name}
                value={isPending(a.price) ? '—' : `+ ${formatBRL(a.price)}`}
              />
            ))}
          </div>
        )}
      </div>

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
            <Line label="Desconto à vista" value={`− ${formatBRL(breakdown.discount)}`} accent />
          )}

          <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
            <span className="font-medium text-ink">Total</span>
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {formatBRL(breakdown.total)}
            </span>
          </div>

          {selectedPayment?.kind === 'signal' && breakdown.signal != null && (
            <div className="mt-3 rounded-lg bg-ivory p-3 text-sm">
              <Line label="Sinal para reservar a data" value={formatBRL(breakdown.signal)} strong />
              <div className="mt-1.5">
                <Line
                  label="Saldo até o casamento"
                  value={formatBRL(breakdown.balance ?? 0)}
                />
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
