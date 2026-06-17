import { Manifesto } from '@/data/types'
import { Section } from './ui'

export function ValueSection({ manifesto }: { manifesto: Manifesto }) {
  return (
    <Section id="o-valor" eyebrow="Por que registrar">
      <div className="max-w-3xl">
        <p className="text-balance font-serif text-4xl leading-[1.05] text-ink sm:text-5xl">
          {manifesto.lead}
        </p>

        <div className="mt-8 max-w-prose space-y-5 text-lg leading-relaxed text-ink-soft">
          {manifesto.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <blockquote className="mt-10 border-l-2 border-gold pl-6 font-serif text-2xl leading-snug text-ink sm:text-[1.7rem]">
          {manifesto.emphasis}
        </blockquote>

        <p className="mt-10 max-w-prose text-lg leading-relaxed text-ink-soft">{manifesto.close}</p>
      </div>
    </Section>
  )
}
