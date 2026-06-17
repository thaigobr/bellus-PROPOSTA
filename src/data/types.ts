/**
 * Modelo de dados central da proposta.
 *
 * REGRA DE OURO: todo dado comercial (preço, prazo, condição, link de checkout)
 * vive aqui ou no arquivo da proposta. Nenhum componente inventa valores.
 *
 * Sempre que um dado comercial ainda não estiver definido, use `null` e descreva
 * a pendência com o helper PENDENTE() (renderiza um marcador "[PREENCHER: ...]").
 */

/** Marcador visível de informação ausente. Ex.: PENDENTE('valor real do pacote'). */
export type Pending = { __pending: true; note: string }

/** Um preço em reais (number) OU uma pendência explícita. Nunca um número inventado silenciosamente. */
export type Price = number | Pending

export interface DeliverableItem {
  /** Texto curto e humano da entrega. Ex.: "Filme de destaques (3 a 5 min)". */
  label: string
  /** Detalhe opcional exibido em tom secundário. */
  detail?: string
  /** Se a entrega é um diferencial deste nível (recebe destaque visual). */
  highlight?: boolean
}

export interface Package {
  id: string
  /** Nome do nível de experiência. Ex.: "Memória". */
  name: string
  /** Frase de posicionamento — como o cliente vai querer lembrar do dia. */
  positioning: string
  /** Para quem este nível é indicado (perfil de cliente). */
  bestFor: string
  /** Promessa principal, uma linha. */
  promise: string
  /** Entregas incluídas, em ordem de leitura. */
  deliverables: DeliverableItem[]
  /** Valor cheio do pacote (à vista bruto, antes de descontos/condições). */
  price: Price
  /** Prazo de entrega do filme final. Ex.: "90 a 180 dias". */
  deliveryTime: string
  /** Diferencial frente ao nível anterior, uma linha curta. */
  differentiator?: string
  /** Ancoragem de valor real (ex.: combo que sai mais barato que separado). */
  valueNote?: string
}

export interface Addon {
  id: string
  name: string
  description: string
  /** Benefício percebido, uma linha. */
  benefit: string
  price: Price
  /** true => já vem marcado (raro; use com parcimônia). */
  defaultSelected?: boolean
}

export type PaymentKind =
  | 'signal' // sinal para reservar a data + saldo depois
  | 'full' // pagamento integral (geralmente com desconto)
  | 'installments' // parcelamento no cartão / link externo

export interface PaymentOption {
  id: string
  kind: PaymentKind
  /** Rótulo curto exibido no seletor. Ex.: "Reservar a data com sinal". */
  label: string
  /** Explicação curta e honesta da condição. */
  description: string
  /** Percentual de desconto sobre o total (0 a 1). Ex.: 0.05 = 5%. */
  discountRate?: number
  /** Para 'signal': fração do total paga agora para reservar (0 a 1). Ex.: 0.2. */
  signalRate?: number
  /** Para 'installments': número máximo de parcelas exibido. */
  maxInstallments?: number
  /**
   * Link de checkout seguro do provedor (Pix/cartão/sinal).
   * Configurável por proposta + condição. `null` => botão fica desativado
   * com aviso e o cliente é direcionado ao WhatsApp.
   */
  checkoutUrl: string | null
}

export interface Testimonial {
  /** Depoimento real. NUNCA inventar. Se ainda não transcrito, use pending. */
  quote: string | Pending
  author: string | Pending
  /** Contexto curto. Ex.: "Casamento em Itaipava, 2024". */
  context?: string
  /** ID do vídeo no YouTube (só o ID), se houver depoimento em vídeo real. */
  youtubeId?: string
}

export interface FaqItem {
  question: string
  /** Resposta confirmada. Se não houver política definida, use pending. */
  answer: string | Pending
}

export interface PortfolioItem {
  /** Título curto da cena/filme. */
  title: string
  /** ID do vídeo no YouTube (só o ID). Preferir materiais reais da Bellus. */
  youtubeId?: string
  /** Caminho de imagem de capa (em /public) como alternativa ao vídeo. */
  poster?: string
  /** O que esta cena comprova (naturalidade, emoção, discrição...). */
  proves?: string
}

export interface ProcessStep {
  title: string
  description: string
}

/** Manifesto da marca — o "porquê" emocional, em blocos curtos. */
export interface Manifesto {
  lead: string
  lines: string[]
  emphasis: string
  close: string
}

export interface Proposal {
  proposalId: string
  /** Identificador único na URL: /proposta/<slug> */
  slug: string

  /** Proposta de demonstração (mostra um selo discreto "exemplo"). */
  demo?: boolean

  client: {
    name: string
    partnerName?: string
    email?: string
    phone?: string
  }

  event: {
    /** Ex.: "Casamento". */
    type: string
    /** ISO 8601: "2026-10-18". */
    date: string
    venue: string
    city: string
    /** Ex.: "120 convidados" ou pendência. */
    guestCount?: string | Pending
    /** Observações do que o cliente já contou (cerimônia, recepção, etc.). */
    notes?: string
  }

  meta: {
    /** ISO date. */
    createdAt: string
    /** ISO date — validade da proposta. */
    expiresAt: string | Pending
    /** Status real da data. */
    availabilityStatus: 'available' | 'on_hold' | 'unavailable' | Pending
    /** id do pacote recomendado, com justificativa real. */
    recommendedPackageId?: string
    recommendationReason?: string
    /** Mensagem pessoal de abertura, assinada pelo consultor. */
    personalMessage?: string
  }

  /** Conteúdo da marca (compartilhado, mas sobrescrevível por proposta). */
  brand: {
    /** Manifesto emocional ("o dia passa, o filme fica"). */
    manifesto: Manifesto
    /** Método criativo: Entender · Observar · Construir. */
    method: ProcessStep[]
    portfolio: PortfolioItem[]
    /** Processo operacional (reserva, alinhamento, entrega). */
    process: ProcessStep[]
  }

  packages: Package[]
  addons: Addon[]
  paymentOptions: PaymentOption[]
  testimonials: Testimonial[]
  faq: FaqItem[]

  contact: {
    /** WhatsApp em dígitos (DDI+DDD+numero). Cai para env se ausente. */
    whatsapp?: string
    consultantName?: string
  }
}

/** Cria um marcador de pendência visível e tipado. */
export function PENDENTE(note: string): Pending {
  return { __pending: true, note }
}

/** Type guard para pendências. */
export function isPending(v: unknown): v is Pending {
  return typeof v === 'object' && v !== null && (v as Pending).__pending === true
}
