import { FaqItem, isPending } from '@/data/types'
import { Section, PendingMark } from './ui'
import { ChevronDown } from './icons'

export function Faq({ items }: { items: FaqItem[] }) {
  if (!items.length) return null
  return (
    <Section
      id="duvidas"
      eyebrow="Perguntas frequentes"
      title="Para decidir com tranquilidade"
    >
      <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
        {items.map((item, i) => (
          <details key={i} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
              <span className="font-medium text-ink">{item.question}</span>
              <ChevronDown
                width={20}
                height={20}
                className="shrink-0 text-ink-soft transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            <div className="pb-5 pr-8 text-[0.975rem] leading-relaxed text-ink-soft">
              {isPending(item.answer) ? (
                <PendingMark note={item.answer.note} />
              ) : (
                item.answer
              )}
            </div>
          </details>
        ))}
      </div>
    </Section>
  )
}
