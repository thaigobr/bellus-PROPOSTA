'use client'

import { Addon } from '@/data/types'
import { formatBRL } from '@/lib/format'
import { Section, DownsellBanner } from './ui'
import { Check, Plus, Minus, ArrowRight } from './icons'

function QuantityRow({
  addon,
  quantity,
  onChange,
}: {
  addon: Addon
  quantity: number
  onChange: (q: number) => void
}) {
  const max = addon.maxUnits ?? 6
  const minutes = quantity * (addon.unitMinutes ?? 0)
  const lineTotal = quantity * (addon.unitPrice ?? 0)
  const active = quantity > 0

  return (
    <div
      className={`rounded-xl2 border bg-bg p-5 transition-all ${
        active ? 'border-gold ring-1 ring-gold' : 'border-line'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-medium text-ink">{addon.name}</h3>
          <p className="mt-1 text-sm text-ink-soft">{addon.description}</p>
          <p className="mt-0.5 text-sm text-gold/90">{addon.benefit}</p>
          <p className="mt-1 text-xs text-ink-soft">
            {formatBRL(addon.unitPrice ?? 0)} a cada {addon.unitMinutes ?? 5} min
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(Math.max(0, quantity - 1))}
              disabled={quantity <= 0}
              aria-label="Diminuir minutos"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-[var(--green)] disabled:opacity-30"
            >
              <Minus width={16} height={16} />
            </button>
            <span className="w-16 text-center font-medium tabular-nums text-ink">{minutes} min</span>
            <button
              type="button"
              onClick={() => onChange(Math.min(max, quantity + 1))}
              disabled={quantity >= max}
              aria-label="Aumentar minutos"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-[var(--green)] disabled:opacity-30"
            >
              <Plus width={16} height={16} />
            </button>
          </div>
          <span className="w-20 text-right font-semibold tabular-nums text-ink">
            {active ? `+ ${formatBRL(lineTotal)}` : formatBRL(0)}
          </span>
        </div>
      </div>
    </div>
  )
}

function BonusRow({ addon }: { addon: Addon }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl2 border border-gold/30 bg-gold/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-ink">{addon.name}</h3>
          <span className="rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
            Bônus
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{addon.description}</p>
        <p className="mt-0.5 text-sm text-gold/90">{addon.benefit}</p>
      </div>
      <span className="shrink-0 font-medium text-gold">Cortesia</span>
    </div>
  )
}

function ToggleRow({
  addon,
  selected,
  onToggle,
}: {
  addon: Addon
  selected: boolean
  onToggle: () => void
}) {
  const price = typeof addon.price === 'number' ? addon.price : 0
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`flex w-full items-center gap-4 rounded-xl2 border bg-bg p-5 text-left transition-all ${
        selected ? 'border-gold ring-1 ring-gold' : 'border-line hover:border-ink-soft/40'
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
          selected ? 'border-gold bg-gold text-white' : 'border-ink-soft/40'
        }`}
        aria-hidden
      >
        {selected && <Check width={16} height={16} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-medium text-ink">{addon.name}</span>
          <span className="font-semibold text-ink">+ {formatBRL(price)}</span>
        </span>
        <span className="mt-1 block text-sm text-ink-soft">{addon.description}</span>
        <span className="mt-0.5 block text-sm text-gold/90">{addon.benefit}</span>
      </span>
    </button>
  )
}

/**
 * Convite (só na experiência Cerimônia): estimula conhecer as experiências
 * completas, explicando com honestidade o que a Cerimônia preserva e o que
 * só entra nos filmes do dia inteiro, sem desencorajar quem quer só a cerimônia.
 */
function CeremonyUpsell() {
  const beyond = [
    'O making of e os preparativos, antes de tudo começar',
    'A chegada, a espera e o olhar de quem ama',
    'As reações dos convidados durante a cerimônia',
    'A festa, do primeiro brinde à última música',
  ]
  return (
    <div className="rounded-xl2 border border-gold/30 bg-gold/[0.05] p-6 sm:p-8">
      <p className="text-[0.95rem] leading-relaxed text-ink">
        A experiência Cerimônia entrega a cerimônia inteira, sem cortes: as entradas, os votos, a troca
        de alianças e o “sim” completo. O que ela não conta é o restante da história do dia.
      </p>

      <p className="mt-5 text-sm font-medium text-ink">O que as experiências completas acrescentam:</p>
      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {beyond.map((t, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-ink">
            <Check width={17} height={17} className="mt-0.5 shrink-0 text-[var(--green)]" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
        Tudo isso vira um filme cinematográfico nas experiências Rubi, Diamante e Aliança. A Aliança, em
        especial, une as duas coisas: o dia inteiro em filme e a cerimônia na íntegra que você já valoriza.
      </p>

      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink">
        Se o seu desejo é guardar somente a cerimônia na íntegra, você já está no lugar certo. Mas se quiser
        reviver o dia do primeiro detalhe ao último abraço, vale conhecer as experiências completas.
      </p>

      <a
        href="#experiencias"
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded bg-[var(--green)] px-6 py-3 font-medium tracking-wide text-white transition-colors hover:bg-[var(--green-2)]"
      >
        Ver as experiências completas
        <ArrowRight width={18} height={18} />
      </a>
    </div>
  )
}

export function AddonSelector({
  addons,
  quantities,
  onChange,
  downsell,
  ceremonyOnly,
}: {
  addons: Addon[]
  quantities: Record<string, number>
  onChange: (id: string, quantity: number) => void
  downsell?: boolean
  ceremonyOnly?: boolean
}) {
  // Na Cerimônia não há adicionais, mas a seção permanece com um convite.
  if (ceremonyOnly) {
    return (
      <Section
        id="adicionais"
        eyebrow="Para ir além"
        title="Quer guardar também o resto do dia?"
        intro="A experiência Cerimônia preserva o momento mais importante na íntegra. Se quiser, as experiências completas guardam o dia inteiro, do making of à festa."
      >
        <CeremonyUpsell />
      </Section>
    )
  }

  if (!addons.length) return null

  return (
    <Section
      id="adicionais"
      eyebrow="Para ir além"
      title="Serviços adicionais"
      intro="Opcionais para complementar a sua experiência. O valor se ajusta na hora."
    >
      {downsell && <DownsellBanner />}
      <div className="grid gap-3">
        {addons.map((addon) => {
          const qty = quantities[addon.id] ?? 0
          if (addon.kind === 'quantity')
            return (
              <QuantityRow
                key={addon.id}
                addon={addon}
                quantity={qty}
                onChange={(q) => onChange(addon.id, q)}
              />
            )
          if (addon.kind === 'bonus') return <BonusRow key={addon.id} addon={addon} />
          return (
            <ToggleRow
              key={addon.id}
              addon={addon}
              selected={qty > 0}
              onToggle={() => onChange(addon.id, qty > 0 ? 0 : 1)}
            />
          )
        })}
      </div>
    </Section>
  )
}
