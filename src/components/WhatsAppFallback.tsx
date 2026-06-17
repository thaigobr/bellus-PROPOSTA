'use client'

import { Proposal } from '@/data/types'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { track } from '@/lib/analytics'
import { Whatsapp } from './icons'

/** Alternativa humana — secundária, nunca o caminho principal. */
export function WhatsAppFallback({
  proposal,
  selectedPackageName,
}: {
  proposal: Proposal
  selectedPackageName?: string
}) {
  const url = buildWhatsAppUrl({ proposal, packageName: selectedPackageName, doubt: true })

  return (
    <section className="border-t border-line bg-bg py-12">
      <div className="container-content flex flex-col items-center gap-4 text-center">
        <p className="max-w-prose text-ink-soft">
          Prefere esclarecer uma dúvida antes de confirmar? Estamos por perto.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track('whatsapp_click', { proposal_id: proposal.proposalId, x_from: 'fallback_section' })
          }
          className="btn-ghost"
        >
          <Whatsapp width={18} height={18} />
          Falar com {proposal.contact.consultantName?.split(' ')[0] ?? 'a equipe'} no WhatsApp
        </a>
      </div>
    </section>
  )
}
