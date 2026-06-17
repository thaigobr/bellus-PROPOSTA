/**
 * Toda a matemática financeira da proposta vive aqui — fonte única de verdade.
 * Componentes nunca calculam preço por conta própria.
 */
import { Addon, Package, PaymentOption, Price, isPending } from '@/data/types'

export interface PriceBreakdown {
  /** true quando o pacote não tem preço definido (PENDENTE) — não dá para calcular. */
  pending: boolean
  /** Pacote + adicionais selecionados (com preço numérico). */
  subtotal: number
  /** Desconto aplicado pela condição de pagamento (ex.: à vista). */
  discount: number
  /** Valor final a pagar nesta condição. */
  total: number
  /** Valor do sinal para reservar a data (condição 'signal'), senão null. */
  signal: number | null
  /** Saldo após o sinal, senão null. */
  balance: number | null
  /** Nº de parcelas (condição 'installments'), senão null. */
  installmentCount: number | null
  /** Valor de cada parcela, senão null. */
  installmentValue: number | null
}

/** Soma segura: ignora preços pendentes (que não são selecionáveis para cálculo). */
function numericPrice(price: Price): number {
  return isPending(price) ? 0 : price
}

export function computeBreakdown(
  pkg: Package | undefined,
  selectedAddons: Addon[],
  payment: PaymentOption | undefined,
): PriceBreakdown {
  const empty: PriceBreakdown = {
    pending: true,
    subtotal: 0,
    discount: 0,
    total: 0,
    signal: null,
    balance: null,
    installmentCount: null,
    installmentValue: null,
  }

  if (!pkg) return empty
  if (isPending(pkg.price)) return { ...empty, pending: true }

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + numericPrice(a.price), 0)
  const subtotal = pkg.price + addonsTotal

  const discountRate = payment?.discountRate ?? 0
  const discount = Math.round(subtotal * discountRate)
  const total = subtotal - discount

  let signal: number | null = null
  let balance: number | null = null
  if (payment?.kind === 'signal' && payment.signalRate) {
    signal = Math.round(subtotal * payment.signalRate)
    balance = subtotal - signal
  }

  let installmentCount: number | null = null
  let installmentValue: number | null = null
  if (payment?.kind === 'installments' && payment.maxInstallments) {
    installmentCount = payment.maxInstallments
    installmentValue = Math.round((total / payment.maxInstallments) * 100) / 100
  }

  return {
    pending: false,
    subtotal,
    discount,
    total,
    signal,
    balance,
    installmentCount,
    installmentValue,
  }
}
