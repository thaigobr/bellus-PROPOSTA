import { Proposal, isPending } from '@/data/types'
import { formatDateShort } from '@/lib/format'
import { Instagram } from './icons'
import { ParticlesCanvas } from './ParticlesCanvas'

export function ProposalFooter({ proposal }: { proposal: Proposal }) {
  const expires = proposal.meta.expiresAt
  return (
    <footer className="relative overflow-hidden bg-charcoal text-cream">
      <div className="grain absolute inset-0" aria-hidden />
      <ParticlesCanvas className="pointer-events-none absolute inset-0 h-full w-full" fadeBottom={0.6} />
      <div className="container-content relative z-10 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_bellus.png" alt="Bellus Eventos" className="h-16 w-auto sm:h-20" />
            <p className="mt-3 max-w-xs text-sm text-cream/65">
              Filmes que revelam o que você não viu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-cream/75">
            <a
              href="https://belluseventos.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-soft"
            >
              belluseventos.com.br
            </a>
            <a
              href="https://www.instagram.com/belluscasamentos/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @belluscasamentos"
              className="transition-colors hover:text-gold-soft"
            >
              <Instagram width={24} height={24} />
            </a>
          </div>
        </div>

        <hr className="my-8 border-line-dark" />

        <div className="flex flex-col gap-2 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Bellus Eventos · CNPJ 30.922.038/0001-82 · Teresópolis, RJ
            {proposal.contact.consultantName && <> · {proposal.contact.consultantName}</>}
          </p>
          <p>
            Proposta pessoal e confidencial
            {!isPending(expires) && <> · válida até {formatDateShort(expires)}</>}.
          </p>
        </div>
      </div>
    </footer>
  )
}
