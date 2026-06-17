'use client'

import { PaymentOption } from '@/data/types'
import { PriceBreakdown } from '@/lib/pricing'
import { formatBRL, formatBRLCents } from '@/lib/format'
import { Check } from './icons'

/** Texto da vantagem de cada condição, calculado a partir do subtotal. */
function optionPreview(option: PaymentOption, b: PriceBreakdown): string | null {
  if (b.pending) return 'Valor a definir'
  switch (option.kind) {
    case 'signal': {
      const signal = Math.round(b.subtotal * (option.signalRate ?? 0))
      return `Sinal de ${formatBRL(signal)} para reservar · saldo de ${formatBRL(b.subtotal - signal)}`
    }
    case 'full': {
      const discount = Math.round(b.subtotal * (option.discountRate ?? 0))
      const total = b.subtotal - discount
      return discount > 0
        ? `${formatBRL(total)} à vista · você economiza ${formatBRL(discount)}`
        : `${formatBRL(total)} à vista`
    }
    case 'installments': {
      if (!option.maxInstallments) return null
      return `Em até ${option.maxInstallments}x de ${formatBRLCents(b.subtotal / option.maxInstallments)}`
    }
    default:
      return null
  }
}

export function PaymentSelector({
  options,
  selectedId,
  breakdown,
  onSelect,
}: {
  options: PaymentOption[]
  selectedId: string
  breakdown: PriceBreakdown
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h3 className="text-xl font-medium text-ink">Como você prefere pagar</h3>
      <p className="mt-2 text-ink-soft">Escolha a condição que faz mais sentido para vocês.</p>

      <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Condição de pagamento">
        {options.map((option) => {
          const selected = option.id === selectedId
          const preview = optionPreview(option, breakdown)
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(option.id)}
              className={`flex items-start gap-4 rounded-xl2 border bg-bg p-5 text-left transition-all ${
                selected ? 'border-gold ring-1 ring-gold' : 'border-line hover:border-ink-soft/40'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  selected ? 'border-gold bg-gold text-white' : 'border-ink-soft/40'
                }`}
                aria-hidden
              >
                {selected && <Check width={13} height={13} />}
              </span>
              <span className="flex-1">
                <span className="font-medium text-ink">{option.label}</span>
                <span className="mt-1 block text-sm text-ink-soft">{option.description}</span>
                {preview && <span className="mt-2 block text-sm font-medium text-gold">{preview}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
