import Link from 'next/link'
import { listProposals } from '@/lib/store'
import { BOOKING_STATUSES, STATUS_META } from '@/data/crm'
import { formatDateShort, formatWeekdayDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  const all = await listProposals()
  const events = all.filter((p) => p.event.date).sort((a, b) => (a.event.date < b.event.date ? -1 : 1))

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-light text-ink">Agenda</h1>
      <p className="text-ink-soft">
        Datas dos eventos. As reservadas e fechadas bloqueiam o dia para novos fechamentos.
      </p>

      <div className="space-y-2">
        {events.map((p) => {
          const m = STATUS_META[p.status]
          const booked = BOOKING_STATUSES.includes(p.status)
          const couple = p.client.partnerName ? `${p.client.name} e ${p.client.partnerName}` : p.client.name
          return (
            <Link
              key={p.id}
              href={`/admin/proposta/${p.id}`}
              className={`flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors ${
                booked ? 'border-emerald-300 bg-emerald-50/60' : 'border-line bg-bg hover:border-gold/50'
              }`}
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {formatDateShort(p.event.date)} · {couple}
                </p>
                <p className="truncate text-sm capitalize text-ink-soft">
                  {formatWeekdayDate(p.event.date)} · {p.event.city || 'cidade a definir'}
                </p>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${m.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                {m.label}
              </span>
            </Link>
          )
        })}
        {events.length === 0 && <p className="text-ink-soft">Nenhum evento cadastrado ainda.</p>}
      </div>
    </div>
  )
}
