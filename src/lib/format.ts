/** Formatação pt-BR centralizada (moeda e datas). */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const BRL_CENTS = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** R$ 7.800 (sem centavos quando inteiro) ou R$ 1.300,50 quando houver. */
export function formatBRL(value: number): string {
  return Number.isInteger(value) ? BRL.format(value) : BRL_CENTS.format(value)
}

/** Sempre com centavos — útil para valor de parcela. */
export function formatBRLCents(value: number): string {
  return BRL_CENTS.format(value)
}

/** Parse seguro de 'YYYY-MM-DD' como data local (evita erro de fuso). */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** "18 de outubro de 2026" */
export function formatDateLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "domingo, 18 de outubro" */
export function formatWeekdayDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** "18/10/2026" */
export function formatDateShort(iso: string): string {
  return parseISODate(iso).toLocaleDateString('pt-BR')
}
