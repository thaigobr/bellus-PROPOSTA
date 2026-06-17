import { ProcessStep } from '@/data/types'
import { Section } from './ui'

export function ProcessSection({ steps }: { steps: ProcessStep[] }) {
  return (
    <Section
      id="como-funciona"
      eyebrow="Como funciona"
      title="Do sim ao seu filme"
      intro="Um caminho simples e sem surpresas, do primeiro passo à entrega."
    >
      <ol className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 font-serif text-sm text-gold">
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <span className="mt-2 hidden w-px flex-1 bg-line sm:block" aria-hidden />
              )}
            </div>
            <div className="pb-2">
              <h3 className="font-serif text-lg text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
