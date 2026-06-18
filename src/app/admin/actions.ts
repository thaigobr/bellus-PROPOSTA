'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createProposal, setStatus, updateProposal } from '@/lib/store'
import { DEFAULT_PACKAGES, DEFAULT_PAYMENT_OPTIONS } from '@/data/defaults'
import { ProposalStatus, StoredProposal } from '@/data/crm'

function str(fd: FormData, k: string): string | undefined {
  const v = fd.get(k)
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length ? s : undefined
}

/** Lê os campos do formulário e devolve os dados da proposta (sem CRM). */
function parseForm(fd: FormData) {
  const priceOverrides: Record<string, number> = {}
  for (const p of DEFAULT_PACKAGES) {
    const raw = str(fd, `price_${p.id}`)
    const n = raw ? Number(raw.replace(/[^\d]/g, '')) : NaN
    if (!Number.isNaN(n) && n > 0) priceOverrides[p.id] = n
  }
  const checkoutLinks: Record<string, string> = {}
  for (const o of DEFAULT_PAYMENT_OPTIONS) {
    const link = str(fd, `link_${o.id}`)
    if (link) checkoutLinks[o.id] = link
  }

  const availRaw = str(fd, 'availabilityStatus')
  const availabilityStatus =
    availRaw === 'available' || availRaw === 'on_hold' || availRaw === 'unavailable' ? availRaw : undefined

  const data: Omit<StoredProposal, 'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt' | 'viewCount'> = {
    client: {
      name: str(fd, 'name') ?? 'Cliente',
      partnerName: str(fd, 'partnerName'),
      email: str(fd, 'email'),
      phone: str(fd, 'phone'),
    },
    event: {
      type: str(fd, 'type') ?? 'Casamento',
      date: str(fd, 'date') ?? '',
      venue: str(fd, 'venue') ?? '',
      city: str(fd, 'city') ?? '',
      guestCount: str(fd, 'guestCount'),
      notes: str(fd, 'notes'),
    },
    recommendedPackageId: str(fd, 'recommendedPackageId'),
    recommendationReason: str(fd, 'recommendationReason'),
    personalMessage: str(fd, 'personalMessage'),
    availabilityStatus,
    expiresAt: str(fd, 'expiresAt'),
    priceOverrides: Object.keys(priceOverrides).length ? priceOverrides : undefined,
    checkoutLinks: Object.keys(checkoutLinks).length ? checkoutLinks : undefined,
    consultantName: str(fd, 'consultantName'),
    whatsapp: str(fd, 'whatsapp'),
  }
  return data
}

export async function createProposalAction(formData: FormData) {
  const data = parseForm(formData)
  const p = await createProposal(data)
  revalidatePath('/admin')
  redirect(`/admin/proposta/${p.id}?criada=1`)
}

export async function updateProposalAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const data = parseForm(formData)
  await updateProposal(id, data)
  revalidatePath(`/admin/proposta/${id}`)
  revalidatePath('/admin')
  redirect(`/admin/proposta/${id}?salvo=1`)
}

export async function setStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as ProposalStatus
  await setStatus(id, status)
  revalidatePath(`/admin/proposta/${id}`)
  revalidatePath('/admin')
  revalidatePath('/admin/agenda')
  redirect(`/admin/proposta/${id}`)
}
