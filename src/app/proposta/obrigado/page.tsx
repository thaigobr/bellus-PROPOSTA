import type { Metadata } from 'next'
import { ParticlesCanvas } from '@/components/ParticlesCanvas'

export const metadata: Metadata = {
  title: 'Recebemos sua reserva · Bellus Eventos',
  robots: { index: false, follow: false },
}

const COND_LABEL: Record<string, string> = {
  sinal: 'reserva da data com sinal',
  avista: 'pagamento integral',
  cartao: 'parcelamento no cartão',
}

export default function Obrigado({
  searchParams,
}: {
  searchParams: { demo?: string; cond?: string }
}) {
  const isDemo = searchParams.demo === '1'
  const cond = searchParams.cond ? COND_LABEL[searchParams.cond] : undefined

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-charcoal px-6 text-center text-cream">
      <div className="grain absolute inset-0" aria-hidden />
      <ParticlesCanvas className="pointer-events-none absolute inset-0 h-full w-full" fadeBottom={0.7} />
      <div className="relative z-10 animate-fade-up">
        <span
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-gold-soft/40"
          aria-hidden
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold-soft)" strokeWidth="1.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="eyebrow eyebrow--light mb-5">Bellus Eventos</p>
        <h1 className="font-serif text-3xl text-cream sm:text-4xl">Recebemos o seu pedido</h1>
        <p className="mx-auto mt-5 max-w-prose text-cream/75">
          {cond
            ? `Seu pedido de ${cond} foi registrado. `
            : 'Seu pedido foi registrado. '}
          Em breve nossa equipe entra em contato para confirmar os detalhes e dar o próximo passo.
          A data é garantida após a assinatura do contrato e a confirmação do pagamento.
        </p>

        {isDemo && (
          <p className="mx-auto mt-8 max-w-prose rounded-lg border border-gold-soft/30 bg-white/5 px-4 py-3 text-sm text-cream/70">
            Esta é uma página de demonstração. Em produção, o cliente chega aqui após concluir o
            pagamento no provedor (Pix/cartão).
          </p>
        )}

        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '5521981636666'}`}
          className="btn-ghost mt-9 border-cream/25 text-cream hover:border-cream/60"
        >
          Falar no WhatsApp
        </a>
      </div>
    </main>
  )
}
