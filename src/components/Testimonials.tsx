import { Testimonial, isPending } from '@/data/types'
import { Section, PendingMark } from './ui'

function Card({ t }: { t: Testimonial }) {
  const quotePending = isPending(t.quote)
  const authorPending = isPending(t.author)

  return (
    <figure className="flex h-full flex-col rounded-xl2 border border-line bg-cream p-6 sm:p-7">
      <span className="font-serif text-5xl leading-none text-gold-soft" aria-hidden>
        “
      </span>
      <blockquote className="mt-2 flex-1 font-serif text-lg leading-relaxed text-ink">
        {quotePending ? (
          <span className="text-ink-soft">
            Depoimento real a incluir <PendingMark note={(t.quote as { note: string }).note} />
          </span>
        ) : (
          (t.quote as string)
        )}
      </blockquote>
      <figcaption className="mt-5 text-sm text-ink-soft">
        {authorPending ? (
          <PendingMark note={(t.author as { note: string }).note} />
        ) : (
          <span className="font-medium text-ink">{t.author as string}</span>
        )}
        {t.context && <span className="block">{t.context}</span>}
      </figcaption>
    </figure>
  )
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null
  const anyPending = testimonials.some((t) => isPending(t.quote))

  return (
    <Section
      id="depoimentos"
      eyebrow="Quem já reviveu"
      title="“Eu vi coisas que não tinha percebido no dia”"
      intro="O que mais ouvimos de quem assiste ao próprio filme pela primeira vez."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <Card key={i} t={t} />
        ))}
      </div>

      {anyPending && (
        <p className="mt-6 text-sm text-ink-soft">
          A Bellus tem depoimentos em vídeo de casais reais no site. Substitua os marcadores acima
          pelas transcrições e/ou IDs de vídeo (com autorização). Nunca usar depoimentos inventados.
        </p>
      )}
    </Section>
  )
}
