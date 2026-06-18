'use client'

import { useEffect, useMemo, useState } from 'react'
import { Proposal } from '@/data/types'
import { AddonLine, computeBreakdown } from '@/lib/pricing'
import { track } from '@/lib/analytics'

import { ProposalHero } from './ProposalHero'
import { EventSummary } from './EventSummary'
import { ValueSection } from './ValueSection'
import { ProcessSection } from './ProcessSection'
import { PortfolioSection } from './PortfolioSection'
import { PackageSelector } from './PackageSelector'
import { PackageComparison } from './PackageComparison'
import { AddonSelector } from './AddonSelector'
import { Faq } from './Faq'
import { PaymentSelector } from './PaymentSelector'
import { OrderSummary } from './OrderSummary'
import { CheckoutButton } from './CheckoutButton'
import { MobileSummaryBar } from './MobileSummaryBar'
import { WhatsAppFallback } from './WhatsAppFallback'
import { ProposalFooter } from './ProposalFooter'
import { DemoRibbon } from './DemoRibbon'

export function ProposalShell({ proposal }: { proposal: Proposal }) {
  const defaultPackageId =
    proposal.meta.recommendedPackageId ??
    proposal.packages[Math.floor(proposal.packages.length / 2)]?.id ??
    proposal.packages[0]?.id

  const [packageId, setPackageId] = useState<string>(defaultPackageId)
  const [addonQty, setAddonQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(proposal.addons.filter((a) => a.defaultSelected).map((a) => [a.id, 1])),
  )
  const [downsell, setDownsell] = useState(false)
  const [paymentId, setPaymentId] = useState<string>(proposal.paymentOptions[0]?.id ?? '')
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    track('proposal_view', { proposal_id: proposal.proposalId, slug: proposal.slug })
  }, [proposal.proposalId, proposal.slug])

  const selectedPackage = useMemo(
    () => proposal.packages.find((p) => p.id === packageId),
    [proposal.packages, packageId],
  )
  // Downsell: o preço por minuto cai de 990 para 900 quando a cliente reduz
  // um adicional por minutagem que já havia escolhido.
  const effectiveAddons = useMemo(
    () =>
      proposal.addons.map((a) =>
        downsell && a.kind === 'quantity' && a.downsellPrice ? { ...a, unitPrice: a.downsellPrice } : a,
      ),
    [proposal.addons, downsell],
  )

  const addonLines: AddonLine[] = useMemo(
    () => effectiveAddons.map((addon) => ({ addon, quantity: addonQty[addon.id] ?? 0 })),
    [effectiveAddons, addonQty],
  )
  const selectedLines = useMemo(() => addonLines.filter((l) => l.quantity > 0), [addonLines])
  const selectedPayment = useMemo(
    () => proposal.paymentOptions.find((o) => o.id === paymentId),
    [proposal.paymentOptions, paymentId],
  )

  const breakdown = useMemo(
    () => computeBreakdown(selectedPackage, addonLines, selectedPayment),
    [selectedPackage, addonLines, selectedPayment],
  )

  function selectPackage(id: string) {
    setPackageId(id)
    track('package_select', { proposal_id: proposal.proposalId, package_id: id })
  }

  function setAddonQuantity(id: string, quantity: number) {
    const q = Math.max(0, quantity)
    setAddonQty((prev) => {
      const prevQ = prev[id] ?? 0
      const addon = proposal.addons.find((a) => a.id === id)
      if (addon?.kind === 'quantity' && addon.downsellPrice && q < prevQ && prevQ > 0) {
        setDownsell(true)
      }
      return { ...prev, [id]: q }
    })
    track('addon_select', { proposal_id: proposal.proposalId, addon_id: id, selected: q > 0 })
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
      <ProcessSection steps={proposal.brand.process} />
      <PortfolioSection proposal={proposal} />

      <PackageSelector proposal={proposal} selectedId={packageId} onSelect={selectPackage} />
      <PackageComparison
        packages={proposal.packages}
        selectedId={packageId}
        recommendedId={proposal.meta.recommendedPackageId}
        onSelect={selectPackage}
      />
      <AddonSelector
        addons={effectiveAddons}
        quantities={addonQty}
        onChange={setAddonQuantity}
        downsell={downsell}
      />

      <Faq items={proposal.faq} />

      {/* Resumo da contratação + pagamento */}
      <section id="contratacao" className="scroll-mt-20 bg-ivory py-16 sm:py-24">
        <div className="container-content">
          <header className="mb-10 max-w-2xl">
            <p className="eyebrow">Resumo da contratação</p>
            <h2 className="mt-4 font-serif text-3xl font-light text-ink sm:text-[2.6rem]">
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
                selectedPayment={selectedPayment}
                breakdown={breakdown}
                addons={effectiveAddons}
                quantities={addonQty}
                onAddonChange={setAddonQuantity}
                downsell={downsell}
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

      <MobileSummaryBar selectedPackage={selectedPackage} breakdown={breakdown} />
    </main>
  )
}
