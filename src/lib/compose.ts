/**
 * Monta o objeto Proposal (que a página pública consome) a partir do registro
 * StoredProposal (dados do lead) + o catálogo central da marca (defaults).
 *
 * Resultado: os dados comerciais continuam centralizados; cada cliente só guarda
 * o que é dele (evento, recomendação, mensagem, preços/links especiais, status).
 */
import { Proposal, PENDENTE } from '@/data/types'
import { StoredProposal } from '@/data/crm'
import {
  DEFAULT_ADDONS,
  DEFAULT_FAQ,
  DEFAULT_MANIFESTO,
  DEFAULT_PACKAGES,
  DEFAULT_PAYMENT_OPTIONS,
  DEFAULT_PORTFOLIO,
  DEFAULT_PROCESS,
  DEFAULT_TESTIMONIALS,
} from '@/data/defaults'

const FALLBACK_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '5521981636666'
const FALLBACK_CONSULTANT = process.env.NEXT_PUBLIC_CONSULTANT_NAME ?? 'Thiago Rodrigues'

export function composeProposal(s: StoredProposal): Proposal {
  const packages = DEFAULT_PACKAGES.map((p) => {
    const override = s.priceOverrides?.[p.id]
    return typeof override === 'number' ? { ...p, price: override } : p
  })

  const paymentOptions = DEFAULT_PAYMENT_OPTIONS.map((o) => ({
    ...o,
    checkoutUrl: s.checkoutLinks?.[o.id] ?? o.checkoutUrl,
  }))

  return {
    proposalId: s.id,
    slug: s.slug,
    demo: s.demo,
    client: s.client,
    event: {
      type: s.event.type,
      date: s.event.date,
      venue: s.event.venue,
      city: s.event.city,
      guestCount: s.event.guestCount,
      notes: s.event.notes,
    },
    meta: {
      createdAt: s.createdAt,
      expiresAt: s.expiresAt ?? PENDENTE('definir validade da proposta'),
      availabilityStatus: s.availabilityStatus ?? 'available',
      recommendedPackageId: s.recommendedPackageId,
      recommendationReason: s.recommendationReason,
      personalMessage: s.personalMessage,
    },
    brand: {
      manifesto: DEFAULT_MANIFESTO,
      portfolio: DEFAULT_PORTFOLIO,
      process: DEFAULT_PROCESS,
    },
    packages,
    addons: DEFAULT_ADDONS,
    paymentOptions,
    testimonials: DEFAULT_TESTIMONIALS,
    faq: DEFAULT_FAQ,
    contact: {
      whatsapp: s.whatsapp || FALLBACK_WHATSAPP,
      consultantName: s.consultantName || FALLBACK_CONSULTANT,
    },
  }
}
