/**
 * Analytics leve e sem PII.
 * Empurra eventos para window.dataLayer (compatível com Google Tag Manager).
 * NUNCA registra nome, e-mail, telefone ou qualquer dado pessoal — só ids/slugs.
 */

export type AnalyticsEvent =
  | 'proposal_view'
  | 'portfolio_play'
  | 'package_view'
  | 'package_select'
  | 'addon_select'
  | 'payment_option_select'
  | 'begin_checkout'
  | 'whatsapp_click'

type Primitive = string | number | boolean | null | undefined

declare global {
  interface Window {
    dataLayer?: Record<string, Primitive>[]
  }
}

/** Campos permitidos: apenas identificadores não-pessoais. */
interface SafeParams {
  proposal_id?: string
  slug?: string
  package_id?: string
  addon_id?: string
  payment_option_id?: string
  selected?: boolean
  value?: number
  [key: `x_${string}`]: Primitive
}

export function track(event: AnalyticsEvent, params: SafeParams = {}): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, params)
  }
}
