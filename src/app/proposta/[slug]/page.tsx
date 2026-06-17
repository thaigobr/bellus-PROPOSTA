import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllProposalSlugs, getProposal } from '@/data/proposals'
import { ProposalShell } from '@/components/ProposalShell'

interface Params {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllProposalSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const proposal = getProposal(params.slug)
  const couple = proposal
    ? proposal.client.partnerName
      ? `${proposal.client.name} & ${proposal.client.partnerName}`
      : proposal.client.name
    : 'Proposta'
  return {
    title: `${couple} · Proposta Bellus`,
    robots: { index: false, follow: false, nocache: true },
  }
}

export default function ProposalPage({ params }: Params) {
  const proposal = getProposal(params.slug)
  if (!proposal) notFound()
  return <ProposalShell proposal={proposal} />
}
