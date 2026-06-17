import { Proposal, isPending } from '@/data/types'
import { formatDateShort } from '@/lib/format'

export function ProposalFooter({ proposal }: { proposal: Proposal }) {
  const expires = proposal.meta.expiresAt
  return (
    <footer className="relative overflow-hidden bg-charcoal text-cream">
      <div className="grain absolute inset-0" aria-hidden />
      <div className="container-content relative py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-2xl tracking-[0.2em] text-cream">BELLUS</p>
            <p className="mt-2 max-w-xs text-sm text-cream/65">
              Filmes que revelam o que você não viu.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-cream/75">
            <a href="https://belluseventos.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-gold-soft">
              belluseventos.com.br
            </a>
            <a
              href="https://www.instagram.com/belluscasamentos/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-soft"
            >
              @belluscasamentos
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
