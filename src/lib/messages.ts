/** Geração da mensagem pessoal de abertura a partir dos dados do lead. */

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export function coupleLabel(name?: string, partner?: string): string {
  const a = (name ?? '').trim()
  const b = (partner ?? '').trim()
  if (a && b) return `${a} e ${b}`
  return a
}

/** "18 de outubro" a partir de "2026-10-18". */
export function dayMonth(dateISO?: string): string {
  if (!dateISO) return ''
  const [, m, d] = dateISO.split('-').map(Number)
  if (!d || !m || m < 1 || m > 12) return ''
  return `${d} de ${MONTHS[m - 1]}`
}

export function defaultPersonalMessage(name?: string, partner?: string, dateISO?: string): string {
  const couple = coupleLabel(name, partner) || 'Olá'
  const dm = dayMonth(dateISO)
  const datePart = dm ? `o ${dm}` : 'esse dia'
  return `${couple}, preparei esta proposta pensando no dia de vocês. Mais do que um vídeo, ela é sobre como vocês vão querer reviver ${datePart} daqui a alguns anos. Qualquer dúvida, estou por perto.`
}
