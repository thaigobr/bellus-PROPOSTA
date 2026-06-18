import { notFound } from 'next/navigation'
import { bookedDates, dateConflict, getById } from '@/lib/store'
import { ProposalStatus, STATUS_META } from '@/data/crm'
import { setStatusAction, updateProposalAction } from '@/app/admin/actions'
import { ProposalForm } from '@/components/admin/ProposalForm'
import { CopyLinkButton } from '@/components/admin/CopyLinkButton'
import { formatDateShort } from '@/lib/format'

export const dynamic = 'force-dynamic'

const FLOW: ProposalStatus[] = ['rascunho', 'enviada', 'negociando', 'reservada', 'fechada', 'perdida']

function fmtDateTime(iso?: string) {
  if (!iso) return null
  return formatDateShort(iso.slice(0, 10))
}

export default async function ProposalDetail({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { criada?: string; salvo?: string }
}) {
  const p = await getById(params.id)
  if (!p) notFound()

  const couple = p.client.partnerName ? `${p.client.name} e ${p.client.partnerName}` : p.client.name
  const path = `/proposta/${p.slug}`
  const conflict = await dateConflict(p.event.date, p.id)
  const booked = await bookedDates(p.id)

  const waText = encodeURIComponent(
    `Olá, ${couple}! Segue a proposta da Bellus para o seu ${p.event.type.toLowerCase()}: `,
  )
  const waUrl = `https://wa.me/${p.whatsapp || '5521981636666'}?text=${waText}`

  return (
    <div className="space-y-8">
      {(searchParams.criada || searchParams.salvo) && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {searchParams.criada ? 'Proposta criada. Revise, gere o link e envie.' : 'Alterações salvas.'}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">{couple}</h1>
          <p className="text-ink-soft">
            {p.event.type} · {formatDateShort(p.event.date)} · {p.event.city || 'cidade a definir'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${STATUS_META[p.status].chip}`}>
          <span className={`h-2 w-2 rounded-full ${STATUS_META[p.status].dot}`} />
          {STATUS_META[p.status].label}
        </span>
      </div>

      {conflict && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Atenção: já existe uma proposta <strong>{conflict.couple}</strong> reservada/fechada nesta data
          ({formatDateShort(p.event.date)}).
        </div>
      )}

      {/* Link e envio */}
      <section className="adm-card">
        <p className="text-sm font-semibold text-gold">Link da proposta</p>
        <p className="mt-1 break-all font-mono text-sm text-ink-soft">{path}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyLinkButton path={path} />
          <a href={path} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2 text-sm">
            Abrir no site
          </a>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2 text-sm">
            Abrir WhatsApp
          </a>
        </div>
      </section>

      {/* Status */}
      <section className="adm-card">
        <p className="mb-3 text-sm font-semibold text-gold">Status</p>
        <div className="flex flex-wrap gap-2">
          {FLOW.map((s) => (
            <form action={setStatusAction} key={s}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="status" value={s} />
              <button
                type="submit"
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  p.status === s ? 'border-ink bg-ink text-cream' : 'border-line text-ink hover:border-ink'
                }`}
              >
                {STATUS_META[s].label}
              </button>
            </form>
          ))}
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm text-ink-soft sm:grid-cols-2">
          <div>Criada: {fmtDateTime(p.createdAt)}</div>
          <div>Enviada: {fmtDateTime(p.sentAt) ?? 'ainda não'}</div>
          <div>1ª visualização: {fmtDateTime(p.firstViewedAt) ?? 'ainda não'}</div>
          <div>Visualizações: {p.viewCount}</div>
        </dl>
      </section>

      {/* Edição */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-soft">Editar dados</h2>
        <ProposalForm action={updateProposalAction} initial={p} submitLabel="Salvar alterações" booked={booked} />
      </section>
    </div>
  )
}
