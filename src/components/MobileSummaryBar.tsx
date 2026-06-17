'use client'

import { Package } from '@/data/types'
import { PriceBreakdown } from '@/lib/pricing'
import { formatBRL } from '@/lib/format'
import { ArrowRight } from './icons'

/** Barra inferior compacta no mobile — resumo sempre acessível. */
export function MobileSummaryBar({
  selectedPackage,
  breakdown,
}: {
  selectedPackage?: Package
  breakdown: PriceBreakdown
}) {
  const totalLabel = !selectedPackage
    ? 'Selecione'
    : breakdown.pending
      ? 'A definir'
      : formatBRL(breakdown.total)

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 px-4 py-3 shadow-bar backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs text-ink-soft">
            {selectedPackage ? `Experiência ${selectedPackage.name}` : 'Sua experiência'}
          </p>
          <p className="text-xl font-semibold leading-tight text-ink">{totalLabel}</p>
        </div>
        <a href="#contratacao" className="btn-primary shrink-0 px-5 py-2.5">
          Continuar
          <ArrowRight width={17} height={17} />
        </a>
      </div>
    </div>
  )
}
