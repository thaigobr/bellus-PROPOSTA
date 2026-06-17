/** Monta o link do WhatsApp com mensagem pré-preenchida (alternativa humana). */
import { Proposal } from '@/data/types'

const FALLBACK_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '5521981636666'

export function whatsappNumber(proposal: Proposal): string {
  return proposal.contact.whatsapp || FALLBACK_WHATSAPP
}

interface WhatsAppContext {
  proposal: Proposal
  packageName?: string
  doubt?: boolean
}

/**
 * Mensagem que já chega preenchida com nome, data e pacote selecionado —
 * para a empresa não precisar perguntar tudo de novo.
 */
export function buildWhatsAppUrl({ proposal, packageName, doubt }: WhatsAppContext): string {
  const number = whatsappNumber(proposal)
  const couple = proposal.client.partnerName
    ? `${proposal.client.name} e ${proposal.client.partnerName}`
    : proposal.client.name

  const lines = [
    `Olá! Aqui é ${couple}.`,
    `Recebi a proposta para o nosso ${proposal.event.type.toLowerCase()} (${formatBR(
      proposal.event.date,
    )}).`,
  ]
  if (packageName) lines.push(`Estou considerando a experiência ${packageName}.`)
  lines.push(
    doubt
      ? 'Gostaria de esclarecer uma dúvida antes de confirmar.'
      : 'Gostaria de falar com vocês sobre a proposta.',
  )

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`
}

function formatBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
