'use client'

import { useEffect } from 'react'
import { defaultPersonalMessage } from '@/lib/messages'

/**
 * Preenche automaticamente a "Mensagem pessoal de abertura" com base no nome
 * do casal e na data, enquanto o operador digita. Não sobrescreve uma mensagem
 * que o operador tenha personalizado manualmente.
 */
export function MessageAutofill() {
  useEffect(() => {
    const get = (n: string) =>
      document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${n}"]`)
    const name = get('name')
    const partner = get('partnerName')
    const date = get('date')
    const msg = get('personalMessage') as HTMLTextAreaElement | null
    if (!msg) return

    let lastAuto = ''
    const apply = () => {
      const generated = defaultPersonalMessage(name?.value, partner?.value, date?.value)
      if (msg.value.trim() === '' || msg.value === lastAuto) {
        msg.value = generated
        lastAuto = generated
      }
    }

    if (msg.value.trim() === '') apply()
    const els = [name, partner, date].filter(Boolean) as HTMLElement[]
    els.forEach((el) => el.addEventListener('input', apply))
    return () => els.forEach((el) => el.removeEventListener('input', apply))
  }, [])

  return null
}
