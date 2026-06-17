import { Proposal } from '../types'
import {
  DEFAULT_ADDONS,
  DEFAULT_FAQ,
  DEFAULT_MANIFESTO,
  DEFAULT_METHOD,
  DEFAULT_PACKAGES,
  DEFAULT_PAYMENT_OPTIONS,
  DEFAULT_PORTFOLIO,
  DEFAULT_PROCESS,
  DEFAULT_TESTIMONIALS,
} from '../defaults'

/**
 * MODELO DE PROPOSTA (demonstração).
 *
 * Os PREÇOS e ENTREGAS são reais (tabela da Bellus, em src/data/defaults.ts).
 * O que é fictício aqui: os dados do casal (Mariana & Lucas) e os LINKS de
 * pagamento, que apontam para a página de confirmação interna só para demonstrar
 * o fluxo. Numa proposta real, use a URL do provedor (Pix/cartão). Veja o README.
 */

// Demo: encaminha para a confirmação interna. Em produção: link do provedor.
const demoCheckout = (cond: string) => `/proposta/obrigado?demo=1&cond=${cond}`

const paymentOptions = DEFAULT_PAYMENT_OPTIONS.map((o) => ({
  ...o,
  checkoutUrl: demoCheckout(o.id),
}))

export const marianaELucas: Proposal = {
  proposalId: 'BELLUS-2026-0001',
  slug: 'mariana-e-lucas',
  demo: true,

  client: {
    name: 'Mariana',
    partnerName: 'Lucas',
  },

  event: {
    type: 'Casamento',
    date: '2026-10-18',
    venue: 'Espaço Jardim das Oliveiras',
    city: 'Campinas, São Paulo',
    guestCount: '≈ 120 convidados',
    notes: 'Cerimônia e recepção no mesmo espaço, ao entardecer.',
  },

  meta: {
    createdAt: '2026-06-17',
    expiresAt: '2026-07-15',
    availabilityStatus: 'available',
    recommendedPackageId: 'diamante',
    recommendationReason:
      'Pelo formato do seu dia — cerimônia e recepção no mesmo espaço, do fim de tarde à festa — o Diamante cobre preparativos, cerimônia e festa com a captação mais aprofundada. Se quiserem preservar também a cerimônia na íntegra, a Aliança soma as duas por R$ 1.670 a menos do que separadas.',
    personalMessage:
      'Mariana e Lucas, preparei esta proposta pensando no dia de vocês. Mais do que um vídeo, ela é sobre como vocês vão querer reviver o 18 de outubro daqui a alguns anos. Qualquer dúvida, estou por perto.',
  },

  brand: {
    manifesto: DEFAULT_MANIFESTO,
    method: DEFAULT_METHOD,
    portfolio: DEFAULT_PORTFOLIO,
    process: DEFAULT_PROCESS,
  },

  packages: DEFAULT_PACKAGES,
  addons: DEFAULT_ADDONS,
  paymentOptions,
  testimonials: DEFAULT_TESTIMONIALS,
  faq: DEFAULT_FAQ,

  contact: {
    whatsapp: '5521981636666',
    consultantName: 'Thiago Rodrigues',
  },
}
