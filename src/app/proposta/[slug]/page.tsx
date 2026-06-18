import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dateConflict, getBySlug } from '@/lib/store'
import { composeProposal } from '@/lib/compose'
import { ProposalShell } from '@/components/ProposalShell'
import { ViewBeacon } from '@/components/ViewBeacon'

export const dynamic = 'force-dynamic'

interface Params {
  params: { slug: string }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = await getBySlug(params.slug)
  const couple = s
    ? s.client.partnerName
      ? `${s.client.name} & ${s.client.partnerName}`
      : s.client.name
    : 'Proposta'
  return {
    title: `${couple} · Proposta Bellus`,
    robots: { index: false, follow: false, nocache: true },
  }
}

export default async function ProposalPage({ params }: Params) {
  const stored = await getBySlug(params.slug)
  if (!stored) notFound()

  const proposal = composeProposal(stored)

  // Disponibilidade automática pela agenda quando não há override manual.
  if (!stored.availabilityStatus) {
    const conflict = await dateConflict(stored.event.date, stored.id)
    if (conflict) proposal.meta.availabilityStatus = 'unavailable'
  }

  return (
    <>
      <ViewBeacon slug={stored.slug} />
      <ProposalShell proposal={proposal} />
    </>
  )
}
