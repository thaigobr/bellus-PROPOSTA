import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Termos de Contratação · Bellus Eventos',
  robots: { index: false, follow: false },
}

const INTRO =
  'Este é um resumo das principais condições de contratação dos serviços da Bellus Eventos. O contrato assinado entre as partes é o documento que rege a prestação na íntegra e prevalece em caso de divergência.'

const SECTIONS: LegalSection[] = [
  {
    title: 'Objeto',
    body: [
      'A Bellus Eventos presta serviços de filmagem e edição de vídeo do evento, conforme a experiência escolhida na proposta.',
    ],
  },
  {
    title: 'Reserva e pagamento',
    body: [
      'A data é reservada após a assinatura do contrato e o pagamento do sinal. Os pagamentos são feitos por Pix ou transferência. À vista há 5% de desconto, e o parcelamento vai até a data do evento.',
    ],
  },
  {
    title: 'Cobertura',
    body: [
      'A cobertura vai de 6 a 10 horas contínuas, conforme a experiência, com 1 hora de tolerância. Horas além desse limite são combinadas à parte.',
    ],
  },
  {
    title: 'Prazos de entrega',
    body: [
      'A prévia é entregue em até 15 dias. O filme e o trailer são entregues, em média, entre 60 e 90 dias, com prazo máximo de 150 dias.',
    ],
  },
  {
    title: 'Ajustes',
    body: [
      'Está inclusa uma rodada de ajustes pontuais, solicitada em até 15 dias após a entrega, como troca de trilha, reordenação de cenas ou cortes específicos.',
    ],
  },
  {
    title: 'Deslocamento',
    body: [
      'Em Teresópolis (RJ) o deslocamento está incluso. Para outros locais do estado do Rio de Janeiro, calcula-se R$ 1,00 por km rodado, ida e volta, mais hospedagem quando necessário. Fora do estado, soma-se também o transporte aéreo.',
    ],
  },
  {
    title: 'Mudança de data',
    body: [
      'Permitida conforme a disponibilidade da agenda, com taxa de remarcação de 10% do valor total. Em casos de força maior comprovada, a taxa pode ser isenta.',
    ],
  },
  {
    title: 'Cancelamento',
    body: [
      'No cancelamento sem justa causa, aplica-se multa progressiva conforme a proximidade do evento: 10% até 300 dias antes, 20% de 299 a 240 dias, 30% de 239 a 180 dias, 40% de 179 a 120 dias, 50% de 119 a 60 dias e 70% a menos de 59 dias.',
    ],
  },
  {
    title: 'Uso de imagem',
    body: [
      'A Bellus pode utilizar trechos do material no portfólio e nas redes sociais, para fins de divulgação. O cliente pode restringir esse uso por escrito no momento da assinatura.',
    ],
  },
  {
    title: 'Entrega e guarda do material',
    body: [
      'A entrega é feita por link, com pendrive de cortesia nas experiências completas. Após a entrega, a guarda e o backup do material são de responsabilidade do cliente.',
    ],
  },
  {
    title: 'Estilo e limitações técnicas',
    body: [
      'O cliente declara conhecer e aprovar o estilo documental e cinematográfico da Bellus. Não há refilmagem por insatisfação subjetiva, salvo defeito técnico comprovado. Não estão inclusas alterações estéticas como correção de pele ou modificação corporal.',
    ],
  },
]

export default function TermosPage() {
  return <LegalPage title="Termos de Contratação" intro={INTRO} sections={SECTIONS} />
}
