/**
 * Modelo de CRM: o registro POR CLIENTE de cada proposta enviada.
 *
 * Separa o que é do lead (cliente, evento, recomendação, links, status) do
 * catálogo da marca (pacotes, FAQ, manifesto), que continua central em defaults.
 * A página pública é montada por composeProposal() (lib/compose.ts).
 */

export type ProposalStatus =
  | 'rascunho'
  | 'enviada'
  | 'visualizada'
  | 'negociando'
  | 'reservada'
  | 'fechada'
  | 'perdida'

export interface StoredProposal {
  id: string
  /** Identificador na URL pública: /proposta/<slug>. Único e difícil de adivinhar. */
  slug: string
  status: ProposalStatus
  demo?: boolean

  client: { name: string; partnerName?: string; email?: string; phone?: string }
  event: {
    type: string
    /** ISO: AAAA-MM-DD */
    date: string
    venue: string
    city: string
    guestCount?: string
    notes?: string
  }

  recommendedPackageId?: string
  recommendationReason?: string
  personalMessage?: string
  /** Override manual da disponibilidade; se ausente, é calculada pela agenda. */
  availabilityStatus?: 'available' | 'on_hold' | 'unavailable'
  /** ISO date. Validade da proposta. */
  expiresAt?: string

  /** Preço especial por pacote (id -> valor em reais). */
  priceOverrides?: Record<string, number>
  /** Links de checkout por condição de pagamento (id -> url). */
  checkoutLinks?: Record<string, string>

  consultantName?: string
  whatsapp?: string

  // ── Campos de CRM (registro/rastreio) ──
  createdAt: string
  updatedAt: string
  sentAt?: string
  firstViewedAt?: string
  lastViewedAt?: string
  viewCount: number
}

/** Rótulos e cores para o painel (sutil, sem depender de cor só). */
export const STATUS_META: Record<ProposalStatus, { label: string; dot: string; chip: string }> = {
  rascunho: { label: 'Rascunho', dot: 'bg-stone-400', chip: 'bg-stone-100 text-stone-700' },
  enviada: { label: 'Enviada', dot: 'bg-sky-400', chip: 'bg-sky-50 text-sky-700' },
  visualizada: { label: 'Visualizada', dot: 'bg-violet-400', chip: 'bg-violet-50 text-violet-700' },
  negociando: { label: 'Em negociação', dot: 'bg-amber-400', chip: 'bg-amber-50 text-amber-700' },
  reservada: { label: 'Reservada', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  fechada: { label: 'Fechada', dot: 'bg-emerald-600', chip: 'bg-emerald-100 text-emerald-800' },
  perdida: { label: 'Perdida', dot: 'bg-rose-400', chip: 'bg-rose-50 text-rose-700' },
}

/** Status que ocupam a data na agenda (impedem outro fechamento no mesmo dia). */
export const BOOKING_STATUSES: ProposalStatus[] = ['reservada', 'fechada']
