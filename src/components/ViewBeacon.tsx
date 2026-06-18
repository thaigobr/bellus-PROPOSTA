'use client'

import { useEffect, useRef } from 'react'

/** Registra (uma vez) a visualização da proposta para o CRM. */
export function ViewBeacon({ slug }: { slug: string }) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    fetch(`/api/p/${encodeURIComponent(slug)}/view`, { method: 'POST', keepalive: true }).catch(() => {})
  }, [slug])
  return null
}
