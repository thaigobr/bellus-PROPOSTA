import { Proposal } from '../types'
import { marianaELucas } from './mariana-e-lucas'

/**
 * Registro central de propostas.
 *
 * Para cadastrar uma nova proposta:
 *   1. Duplique `mariana-e-lucas.ts` com um novo nome (ex.: `ana-e-joao.ts`).
 *   2. Ajuste os dados do cliente/evento e os valores reais.
 *   3. Importe e adicione ao array abaixo.
 *
 * A proposta fica disponível em /proposta/<slug>.
 */
const PROPOSALS: Proposal[] = [marianaELucas]

const BY_SLUG: Record<string, Proposal> = Object.fromEntries(
  PROPOSALS.map((p) => [p.slug, p]),
)

export function getProposal(slug: string): Proposal | undefined {
  return BY_SLUG[slug]
}

export function getAllProposalSlugs(): string[] {
  return PROPOSALS.map((p) => p.slug)
}
