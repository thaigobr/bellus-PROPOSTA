import { ProcessStep } from '@/data/types'
import { Section } from './ui'

/** "Como o seu dia é reconstruído" — Entender · Observar · Construir. */
export function MethodSection({ steps }: { steps: ProcessStep[] }) {
  return (
    <Section
      id="metodo"
      className="bg-ivory"
      eyebrow="O método"
      title="Como o seu dia é reconstruído"
    >
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
        {steps.map((step, i) => (
          <article key={step.title}>
            <span className="font-serif text-5xl text-gold-soft">0{i + 1}</span>
            <h3 className="mt-4 font-serif text-2xl text-ink">{step.title}</h3>
            <p className="mt-3 leading-relaxed text-ink-soft">{step.description}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
