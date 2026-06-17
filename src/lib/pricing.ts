/**
 * Toda a matemática financeira da proposta vive aqui, fonte única de verdade.
 * Componentes nunca calculam preço por conta própria.
 */
import { Addon, Package, PaymentOption, isPending } from '@/data/types'

/** Um adicional selecionado, com a quantidade escolhida (passos para 'quantity'). */
export interface AddonLine {
  addon: Addon
  quantity: number
}

/** Valor total de uma linha de adicional. */
export function addonLineTotal(line: AddonLine): number {
  const { addon, quantity } = line
  if (quantity <= 0) return 0
  if (addon.kind === 'quantity') return quantity * (addon.unitPrice ?? 0)
  if (addon.kind === 'bonus') return 0
  return addon.price && !isPending(addon.price) ? addon.price : 0
}

/** Minutos representados por uma linha 'quantity' (ex.: 3 passos de 5 min = 15). */
export function addonLineMinutes(line: AddonLine): number {
  if (line.addon.kind !== 'quantity') return 0
  return line.quantity * (line.addon.unitMinutes ?? 0)
}

export interface PriceBreakdown {
  /** true quando o pacote não tem preço definido (PENDENTE), não dá para calcular. */
  pending: boolean
  subtotal: number
  discount: number
  total: number
  signal: number | null
  balance: number | null
  installmentCount: number | null
  installmentValue: number | null
}

export function computeBreakdown(
  pkg: Package | undefined,
  lines: AddonLine[],
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

  const addonsTotal = lines.reduce((sum, l) => sum + addonLineTotal(l), 0)
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

  return { pending: false, subtotal, discount, total, signal, balance, installmentCount, installmentValue }
}
