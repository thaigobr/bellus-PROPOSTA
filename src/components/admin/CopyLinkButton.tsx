'use client'

import { useState } from 'react'

/** Copia a URL pública absoluta (origem + caminho) para a área de transferência. */
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.origin + path)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          /* ignore */
        }
      }}
      className="btn-ghost px-4 py-2 text-sm"
    >
      {copied ? 'Link copiado!' : 'Copiar link'}
    </button>
  )
}
