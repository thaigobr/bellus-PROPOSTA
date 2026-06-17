'use client'

import { useEffect, useMemo, useState } from 'react'
import { Addon, Proposal, isPending } from '@/data/types'
import { computeBreakdown } from '@/lib/pricing'
import { track } from '@/lib/analytics'

import { ProposalHero } from './ProposalHero'
import { EventSummary } from './EventSummary'
import { ValueSection } from './ValueSection'
import { MethodSection } from './MethodSection'
import { PortfolioSection } from './PortfolioSection'
import { PackageSelector } from './PackageSelector'
import { PackageComparison } from './PackageComparison'
import { AddonSelector } from './AddonSelector'
import { Testimonials } from './Testimonials'
import { ProcessSection } from './ProcessSection'
import { Faq } from './Faq'
import { PaymentSelector } from './PaymentSelector'
import { OrderSummary } from './OrderSummary'
import { CheckoutButton } from './CheckoutButton'
import { MobileSummaryBar } from './MobileSummaryBar'
import { WhatsAppFallback } from './WhatsAppFallback'
import { ProposalFooter } from './ProposalFooter'
import { DemoRibbon } from './DemoRibbon'

export function ProposalShell({ proposal }: { proposal: Proposal }) {
  // Pré-seleciona o pacote recomendado (ou o do meio) para reduzir esforço.
  const defaultPackageId =
    proposal.meta.recommendedPackageId ??
    proposal.packages[Math.floor(proposal.packages.length / 2)]?.id ??
    proposal.packages[0]?.id

  const [packageId, setPackageId] = useState<string>(defaultPackageId)
  const [addonIds, setAddonIds] = useState<string[]>(
    proposal.addons.filter((a) => a.defaultSelected && !isPending(a.price)).map((a) => a.id),
  )
  const [paymentId, setPaymentId] = useState<string>(proposal.paymentOptions[0]?.id ?? '')
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Evento de visualização (sem PII).
  useEffect(() => {
    track('proposal_view', { proposal_id: proposal.proposalId, slug: proposal.slug })
  }, [proposal.proposalId, proposal.slug])

  const selectedPackage = useMemo(
    () => proposal.packages.find((p) => p.id === packageId),
    [proposal.packages, packageId],
  )
  const selectedAddons: Addon[] = useMemo(
    () => proposal.addons.filter((a) => addonIds.includes(a.id)),
    [proposal.addons, addonIds],
  )
  const selectedPayment = useMemo(
    () => proposal.paymentOptions.find((o) => o.id === paymentId),
    [proposal.paymentOptions, paymentId],
  )

  const breakdown = useMemo(
    () => computeBreakdown(selectedPackage, selectedAddons, selectedPayment),
    [selectedPackage, selectedAddons, selectedPayment],
  )

  function selectPackage(id: string) {
    setPackageId(id)
    track('package_select', { proposal_id: proposal.proposalId, package_id: id })
  }

  function toggleAddon(id: string) {
    setAddonIds((prev) => {
      const selected = !prev.includes(id)
      track('addon_select', { proposal_id: proposal.proposalId, addon_id: id, selected })
      return selected ? [...prev, id] : prev.filter((x) => x !== id)
    })
  }

  function selectPayment(id: string) {
    setPaymentId(id)
    track('payment_option_select', { proposal_id: proposal.proposalId, payment_option_id: id })
  }

  return (
    <main className="pb-28 lg:pb-0">
      {proposal.demo && <DemoRibbon />}

      <ProposalHero proposal={proposal} />
      <EventSummary proposal={proposal} />
      <ValueSection manifesto={proposal.brand.manifesto} />
      <MethodSection steps={proposal.brand.method} />
      <PortfolioSection proposal={proposal} />

      <PackageSelector
        proposal={proposal}
        selectedId={packageId}
        onSelect={selectPackage}
      />
      <PackageComparison
        packages={proposal.packages}
        selectedId={packageId}
        recommendedId={proposal.meta.recommendedPackageId}
        onSelect={selectPackage}
      />
      <AddonSelector
        proposal={proposal}
        addons={proposal.addons}
        selectedIds={addonIds}
        onToggle={toggleAddon}
      />

      <Testimonials testimonials={proposal.testimonials} />
      <ProcessSection steps={proposal.brand.process} />
      <Faq items={proposal.faq} />

      {/* ── Resumo da contratação + pagamento ── */}
      <section id="contratacao" className="scroll-mt-20 bg-ivory py-16 sm:py-24">
        <div className="container-content">
          <header className="mb-10 max-w-2xl">
            <p className="eyebrow">Resumo da contratação</p>
            <h2 className="mt-4 text-3xl text-ink sm:text-4xl">
              Tudo claro, antes do próximo passo
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              Confira o que você selecionou, escolha como prefere pagar e garanta a data.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(20rem,24rem)] lg:items-start">
            <div className="order-2 space-y-10 lg:order-1">
              <PaymentSelector
                options={proposal.paymentOptions}
                selectedId={paymentId}
                breakdown={breakdown}
                onSelect={selectPayment}
              />
            </div>

            <div className="order-1 lg:order-2 lg:sticky lg:top-8">
              <OrderSummary
                proposal={proposal}
                selectedPackage={selectedPackage}
                selectedAddons={selectedAddons}
                selectedPayment={selectedPayment}
                breakdown={breakdown}
              />
              <CheckoutButton
                proposal={proposal}
                selectedPackage={selectedPackage}
                selectedPayment={selectedPayment}
                breakdown={breakdown}
                termsAccepted={termsAccepted}
                onTermsChange={setTermsAccepted}
              />
            </div>
          </div>
        </div>
      </section>

      <WhatsAppFallback proposal={proposal} selectedPackageName={selectedPackage?.name} />
      <ProposalFooter proposal={proposal} />

      <MobileSummaryBar
        selectedPackage={selectedPackage}
        breakdown={breakdown}
      />
    </main>
  )
}
