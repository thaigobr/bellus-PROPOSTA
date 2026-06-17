'use client'

import { Package } from '@/data/types'
import { Section } from './ui'
import { Check } from './icons'

/**
 * Comparação enxuta — só os critérios que pesam na decisão.
 * Matriz fixada nos ids do catálogo (cerimonia/rubi/diamante/alianca).
 * Se renomear/alterar experiências, atualize esta matriz.
 */
type Cell = boolean | string
const FEATURES: { label: string; v: Record<string, Cell> }[] = [
  { label: 'Filme do dia', v: { cerimonia: '—', rubi: '8 min', diamante: 'até 15 min', alianca: 'até 15 min' } },
  { label: 'Trailer', v: { cerimonia: false, rubi: true, diamante: true, alianca: true } },
  { label: 'Preparativos', v: { cerimonia: false, rubi: 'Noiva', diamante: 'Completos', alianca: 'Completos' } },
  { label: 'Festa', v: { cerimonia: false, rubi: true, diamante: true, alianca: true } },
  { label: 'Captação aprofundada + drone', v: { cerimonia: false, rubi: false, diamante: true, alianca: true } },
  { label: 'Cerimônia na íntegra (editada)', v: { cerimonia: true, rubi: false, diamante: false, alianca: true } },
  { label: 'Prévia em 2 semanas', v: { cerimonia: false, rubi: true, diamante: true, alianca: true } },
  {
    label: 'Entrega',
    v: { cerimonia: 'Digital', rubi: 'Digital', diamante: 'Pendrive + digital', alianca: 'Pendrive + digital' },
  },
]

function CellView({ value }: { value: Cell | undefined }) {
  if (value === true) return <Check width={18} height={18} className="mx-auto text-gold" aria-label="incluído" />
  if (value === false || value === undefined)
    return <span className="text-ink-soft/40" aria-label="não incluído">—</span>
  return <span className="text-xs text-ink-soft sm:text-sm">{value}</span>
}

export function PackageComparison({
  packages,
  selectedId,
  recommendedId,
  onSelect,
}: {
  packages: Package[]
  selectedId: string
  recommendedId?: string
  onSelect: (id: string) => void
}) {
  return (
    <Section
      id="comparar"
      eyebrow="Lado a lado"
      title="Qual experiência combina mais com vocês?"
      intro="O essencial para comparar, sem termos técnicos."
    >
      <div className="overflow-x-auto rounded-xl2 border border-line">
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-cream">
              <th className="p-3 text-sm font-normal text-ink-soft sm:p-4">Critério</th>
              {packages.map((p) => {
                const isSel = p.id === selectedId
                return (
                  <th key={p.id} className="p-2 text-center sm:p-4">
                    <button
                      type="button"
                      onClick={() => onSelect(p.id)}
                      aria-pressed={isSel}
                      className={`mx-auto flex w-full flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
                        isSel ? 'bg-ink text-cream' : 'text-ink hover:bg-ivory'
                      }`}
                    >
                      <span className="font-serif text-base sm:text-lg">{p.name}</span>
                      {p.id === recommendedId && (
                        <span
                          className={`text-[0.62rem] font-semibold uppercase tracking-wider ${
                            isSel ? 'text-gold-soft' : 'text-gold'
                          }`}
                        >
                          Recomendado
                        </span>
                      )}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f, i) => (
              <tr key={f.label} className={i % 2 ? 'bg-cream/50' : ''}>
                <th scope="row" className="p-3 text-left text-sm font-normal text-ink sm:p-4">
                  {f.label}
                </th>
                {packages.map((p) => (
                  <td
                    key={p.id}
                    className={`p-3 text-center sm:p-4 ${
                      p.id === selectedId ? 'bg-gold/[0.06]' : ''
                    }`}
                  >
                    <CellView value={f.v[p.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mx-auto mt-12 max-w-2xl text-center">
        <p className="text-balance font-serif text-2xl font-light leading-snug text-ink sm:text-3xl">
          Agora vocês já entendem o que está em jogo.
        </p>
        <p className="mt-3 text-ink-soft">
          Não é só um vídeo. É tudo aquilo que vocês não viram enquanto estavam vivendo o momento.
        </p>
      </div>
    </Section>
  )
}
