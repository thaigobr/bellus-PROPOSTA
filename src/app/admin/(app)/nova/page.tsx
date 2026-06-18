import { ProposalForm } from '@/components/admin/ProposalForm'
import { createProposalAction } from '@/app/admin/actions'
import { bookedDates } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function NovaPage() {
  const booked = await bookedDates()
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-light text-ink">Nova proposta</h1>
      <p className="text-ink-soft">
        Preencha os dados do lead. A proposta nasce como rascunho; você revisa, gera o link e envia.
      </p>
      <ProposalForm action={createProposalAction} submitLabel="Criar proposta" booked={booked} />
    </div>
  )
}
