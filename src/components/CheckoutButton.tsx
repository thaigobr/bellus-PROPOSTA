'use client'

import { Package, PaymentOption, Proposal } from '@/data/types'
import { PriceBreakdown } from '@/lib/pricing'
import { track } from '@/lib/analytics'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Lock, ArrowRight } from './icons'
import { PendingMark } from './ui'

const CTA_LABEL: Record<string, string> = {
  signal: 'Reservar minha data',
  full: 'Confirmar e pagar',
  installments: 'Continuar para pagamento',
}

export function CheckoutButton({
  proposal,
  selectedPackage,
  selectedPayment,
  breakdown,
  termsAccepted,
  onTermsChange,
}: {
  proposal: Proposal
  selectedPackage?: Package
  selectedPayment?: PaymentOption
  breakdown: PriceBreakdown
  termsAccepted: boolean
  onTermsChange: (v: boolean) => void
}) {
  const href = selectedPayment?.checkoutUrl ?? null
  const label = selectedPayment ? CTA_LABEL[selectedPayment.kind] ?? 'Continuar' : 'Continuar'
  const linkMissing = !href
  const enabled = termsAccepted && !breakdown.pending && !!href && !!selectedPackage

  function handleCheckout() {
    track('begin_checkout', {
      proposal_id: proposal.proposalId,
      package_id: selectedPackage?.id,
      payment_option_id: selectedPayment?.id,
      value: breakdown.pending ? undefined : breakdown.total,
    })
  }

  return (
    <div className="mt-4 rounded-xl2 border border-line bg-bg p-5 shadow-soft">
      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--gold)]"
        />
        <span>
          Li e concordo com os termos de contratação{' '}
          <PendingMark note="link dos termos" /> e a política de privacidade{' '}
          <PendingMark note="link da política" />.
        </span>
      </label>

      <div className="mt-4">
        {enabled ? (
          <a href={href!} onClick={handleCheckout} className="btn-primary w-full">
            {label}
            <ArrowRight width={18} height={18} />
          </a>
        ) : (
          <button type="button" disabled className="btn-primary w-full" aria-disabled>
            {label}
            <ArrowRight width={18} height={18} />
          </button>
        )}
      </div>

      {/* Mensagens de estado */}
      {breakdown.pending ? (
        <p className="mt-3 text-center text-sm text-ink-soft">
          Selecione uma experiência com valor definido para continuar.
        </p>
      ) : linkMissing ? (
        <p className="mt-3 text-center text-sm text-ink-soft">
          Link de pagamento <PendingMark note="configurar checkoutUrl da condição" />. Por
          enquanto,{' '}
          <a
            href={buildWhatsAppUrl({ proposal, packageName: selectedPackage?.name })}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_click', { proposal_id: proposal.proposalId, x_from: 'checkout_no_link' })}
            className="font-medium text-gold underline-offset-4 hover:underline"
          >
            finalize pelo WhatsApp
          </a>
          .
        </p>
      ) : !termsAccepted ? (
        <p className="mt-3 text-center text-sm text-ink-soft">
          Marque o aceite acima para liberar o pagamento.
        </p>
      ) : (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
          <Lock width={14} height={14} />
          Pagamento em ambiente seguro do provedor.
        </p>
      )}
    </div>
  )
}
