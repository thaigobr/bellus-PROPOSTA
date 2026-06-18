import Link from 'next/link'
import { listProposals } from '@/lib/store'
import { STATUS_META, StoredProposal } from '@/data/crm'
import { formatDateShort } from '@/lib/format'

export const dynamic = 'force-dynamic'

function StatusChip({ s }: { s: StoredProposal['status'] }) {
  const m = STATUS_META[s]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${m.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

function daysBetween(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}

export default async function Dashboard() {
  const all = await listProposals()
  const now = new Date()

  const open = all.filter((p) => ['rascunho', 'enviada', 'visualizada', 'negociando'].includes(p.status))
  const won = all.filter((p) => ['reservada', 'fechada'].includes(p.status))

  // Precisam de atenção: abertas, sem movimento há 3+ dias OU expirando em <= 3 dias.
  const attention = open.filter((p) => {
    const stale = daysBetween(now, new Date(p.updatedAt)) >= 3 && p.status !== 'rascunho'
    const expSoon = p.expiresAt ? daysBetween(new Date(p.expiresAt), now) <= 3 : false
    return stale || expSoon
  })

  const stats = [
    { label: 'Abertas', value: open.length },
    { label: 'Visualizadas', value: all.filter((p) => p.status === 'visualizada').length },
    { label: 'Reservadas/Fechadas', value: won.length },
    { label: 'Precisam de atenção', value: attention.length },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-light text-ink">Propostas</h1>
        <Link href="/admin/nova" className="btn-primary">
          Nova proposta
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="adm-card">
            <p className="text-2xl font-semibold text-ink">{s.value}</p>
            <p className="text-sm text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      {attention.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">
            Precisam de atenção
          </h2>
          <div className="space-y-2">
            {attention.map((p) => (
              <Row key={p.id} p={p} now={now} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Todas ({all.length})
        </h2>
        <div className="space-y-2">
          {all.map((p) => (
            <Row key={p.id} p={p} now={now} />
          ))}
        </div>
      </section>
    </div>
  )
}

function Row({ p, now }: { p: StoredProposal; now: Date }) {
  const couple = p.client.partnerName ? `${p.client.name} e ${p.client.partnerName}` : p.client.name
  const expDays = p.expiresAt ? daysBetween(new Date(p.expiresAt), now) : null
  return (
    <Link
      href={`/admin/proposta/${p.id}`}
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-line bg-bg px-4 py-3 transition-colors hover:border-gold/50"
    >
      <div className="min-w-0">
        <p className="font-medium text-ink">
          {couple}
          {p.demo && <span className="ml-2 text-xs text-ink-soft">(demo)</span>}
        </p>
        <p className="text-sm text-ink-soft">
          {p.event.type} · {formatDateShort(p.event.date)} · {p.event.city || 'cidade a definir'}
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm text-ink-soft">
        {p.viewCount > 0 && <span>{p.viewCount} visualizações</span>}
        {expDays != null && expDays >= 0 && expDays <= 5 && (
          <span className="text-amber-600">expira em {expDays}d</span>
        )}
        <StatusChip s={p.status} />
      </div>
    </Link>
  )
}
