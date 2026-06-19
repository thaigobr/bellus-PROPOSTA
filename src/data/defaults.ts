/**
 * Conteúdo padrão da marca Bellus, reutilizável por todas as propostas.
 *
 * Posicionamento, FAQ, prazos, condições de pagamento, nomes, preços e entregas
 * foram fornecidos pela empresa (tabela vigente). Como são padrão da casa, vivem
 * aqui no catálogo central; uma nova proposta herda tudo isto e só ajusta
 * cliente, evento, recomendação e links.
 */
import {
  Addon,
  FaqItem,
  Manifesto,
  Package,
  PaymentOption,
  PortfolioItem,
  ProcessStep,
  Testimonial,
} from './types'

// Manifesto (texto real da marca)
export const DEFAULT_MANIFESTO: Manifesto = {
  lead: 'O dia passa. O filme fica.',
  lines: [
    'Enquanto vocês vivem o dia, outras coisas estão acontecendo. Um olhar distante. Uma reação inesperada. Um momento que não volta.',
    'A maioria deles vocês nunca vão saber que existiu, a não ser que alguém tenha registrado.',
    'O que vocês não viram só existe no filme.',
  ],
  emphasis:
    'O que vocês sentem assistindo não é o mesmo que viveram. Porque agora vocês conseguem ver tudo: os detalhes, as reações, as emoções que passaram despercebidas enquanto o dia acontecia.',
  close:
    'A Bellus existe para transformar o casamento de vocês em uma memória viva. Uma forma de reviver esse dia, daqui a muitos anos, da maneira mais verdadeira possível.',
}

// Depoimentos reais (com autorização da empresa). Não exibidos no momento.
export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { quote: 'Foram alguns dos períodos mais importantes das nossas vidas.', author: 'Gabi & Michael' },
  { quote: 'Superou todas as nossas expectativas.', author: 'Ludmila & Wallace' },
]

// Portfólio: vídeos reais da Bellus (YouTube), tocam dentro da própria página.
export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  { title: 'A cerimônia, sem interrupções', proves: 'Emoção real e reações espontâneas no momento mais importante.', youtubeId: 'ePwx8bsoztI', posterZoom: 1.35 },
  { title: 'Os detalhes que passam despercebidos', proves: 'O olhar treinado para o que ninguém anuncia.', youtubeId: 'We-jTlYiLC4', posterZoom: 1.35 },
  { title: 'A história do dia inteiro', proves: 'Narrativa com profundidade, dos preparativos à festa.', youtubeId: '_O0Kialgkzo' },
]

// Como funciona (processo operacional, reduz insegurança)
export const DEFAULT_PROCESS: ProcessStep[] = [
  { title: 'Escolha da experiência', description: 'Você seleciona a experiência que combina com o seu dia.' },
  { title: 'Reserva com sinal', description: 'A data é garantida após a assinatura e o pagamento do sinal. O saldo é parcelado até o casamento.' },
  { title: 'Alinhamento', description: 'Conversamos sobre a história de vocês, o roteiro do dia e o que é importante.' },
  { title: 'Cobertura do evento', description: 'Estamos presentes com discrição, atentos ao que acontece de verdade, sem conduzir.' },
  { title: 'Produção', description: 'Selecionamos, montamos e damos forma à narrativa do seu dia.' },
  { title: 'Entrega', description: 'Prévia em até 15 dias; filme e trailer entre 60 e 90 dias (prazo máximo de 150), por link ou pendrive.' },
]

// FAQ: respostas reais. Pendências marcadas com PENDENTE.
export const DEFAULT_FAQ: FaqItem[] = [
  {
    question: 'Quais são as formas de pagamento?',
    answer:
      'Entrada de 20% do valor total para reservar a data, com parcelamento do saldo até a data do casamento. Para pagamento à vista, há 5% de desconto.',
  },
  {
    question: 'Como funciona a reserva da data?',
    answer:
      'A data é confirmada após a assinatura do contrato e o pagamento do sinal. Até lá, ela permanece disponível, mas não reservada.',
  },
  {
    question: 'Quantas horas de cobertura estão incluídas?',
    answer:
      'Dependendo da experiência contratada, a cobertura vai de 6 a 10 horas contínuas, com 1 hora de tolerância. A Cerimônia, por registrar apenas a cerimônia, não exige todo esse tempo.',
  },
  {
    question: 'Qual é o prazo de entrega?',
    answer:
      'A prévia sai em até 15 dias. O filme e o trailer são entregues, em média, entre 60 e 90 dias, com prazo máximo de 150 dias.',
  },
  {
    question: 'Posso pedir ajustes no filme?',
    answer:
      'Sim. Uma rodada de ajustes está inclusa, em até 15 dias após a entrega, para correções pontuais como troca de trilha, reordenação de cenas ou cortes específicos.',
  },
  {
    question: 'Posso escolher as músicas?',
    answer: 'Sim. A trilha pode ser combinada e ainda ajustada na rodada de revisão inclusa.',
  },
  {
    question: 'Como vou receber meus vídeos?',
    answer: 'Por link para download, com um pendrive de cortesia nas experiências completas.',
  },
  {
    question: 'Como funciona o custo de deslocamento?',
    answer:
      'Em Teresópolis (RJ), o deslocamento está incluso. Para outros locais do estado do Rio de Janeiro, calcula-se R$ 1,00 por km rodado (ida e volta), mais hospedagem quando necessário. Fora do estado, soma-se também o transporte aéreo.',
  },
  {
    question: 'E se precisarmos mudar a data?',
    answer:
      'É possível conforme a disponibilidade da agenda, com taxa de remarcação de 10% do valor total. Em casos de força maior, a taxa pode ser isenta.',
  },
  {
    question: 'Como funciona o cancelamento?',
    answer:
      'No cancelamento sem justa causa há multa progressiva conforme a proximidade do evento, de 10% (até 300 dias antes) a 70% (a menos de 59 dias). A escala completa fica no contrato.',
  },
  {
    question: 'Vocês usam o nosso vídeo nas redes sociais?',
    answer:
      'Podemos usar trechos no portfólio e nas redes da Bellus. Se preferirem restringir, basta pedir por escrito na assinatura.',
  },
  {
    question: 'Qual a diferença entre a Cerimônia e as outras experiências?',
    answer:
      'A experiência Cerimônia preserva a cerimônia na íntegra: entradas, votos, troca de alianças e o "sim" completo. Rubi e Diamante focam no filme cinematográfico do dia. A Aliança une as duas coisas.',
  },
  {
    question: 'Precisamos dirigir alguma cena ou posar?',
    answer:
      'Nosso olhar é documental: registramos o que acontece de verdade, sem pedir poses ou repetições. Vocês só precisam viver o seu dia.',
  },
]

// Catálogo de experiências (tabela real da Bellus)
export const DEFAULT_PACKAGES: Package[] = [
  {
    id: 'cerimonia',
    name: 'Cerimônia',
    positioning: 'Momento na íntegra.',
    bestFor: 'Para casais que desejam reviver cada detalhe da cerimônia com autenticidade e emoção.',
    promise: 'Existem partes do casamento que não são sobre imagem, são sobre palavras. E merecem ser lembradas exatamente como aconteceram.',
    deliverables: [
      { label: 'Cerimônia completa editada', highlight: true },
      { label: 'Entradas' },
      { label: 'Votos', highlight: true },
      { label: 'Troca de alianças' },
      { label: '“Sim” completo' },
      { label: 'Edição profissional' },
      { label: 'Entrega digital' },
    ],
    price: 2670,
    deliveryTime: '60 a 90 dias (máximo 150)',
    ceremonyOnly: true,
  },
  {
    id: 'rubi',
    name: 'Rubi',
    positioning: 'Leve, emocional e essencial.',
    bestFor: 'Para casais que querem reviver os momentos mais importantes do dia, do jeito que aconteceram.',
    promise: 'O essencial preservado, sem perder a emoção mais profunda.',
    deliverables: [
      { label: 'Filme de 8 minutos', highlight: true },
      { label: 'Trailer de até 2 minutos' },
      { label: 'Preparativos da noiva' },
      { label: 'Cerimônia (trechos)' },
      { label: 'Festa' },
      { label: 'Prévia em até 15 dias' },
      { label: 'Entrega digital' },
    ],
    price: 4470,
    deliveryTime: '60 a 90 dias (máximo 150)',
    differentiator: 'Acrescenta filme, trailer, preparativos e festa à cobertura.',
  },
  {
    id: 'diamante',
    name: 'Diamante',
    positioning: 'A experiência cinematográfica Bellus.',
    bestFor: 'Para casais que querem reviver também os detalhes e as reações que passaram despercebidos.',
    promise: 'O seu dia transformado em uma experiência cinematográfica, profunda e atemporal.',
    deliverables: [
      { label: 'Filme cinematográfico de até 15 minutos', highlight: true },
      { label: 'Trailer de até 2 minutos' },
      { label: 'Preparativos completos' },
      { label: 'Cerimônia (trechos)' },
      { label: 'Festa' },
      { label: 'Captação aprofundada de detalhes e conexões espontâneas', highlight: true },
      { label: 'Drone quando possível' },
      { label: 'Prévia em até 15 dias' },
      { label: 'Pendrive personalizado mais entrega digital' },
    ],
    price: 5970,
    deliveryTime: '60 a 90 dias (máximo 150)',
    differentiator: 'Filme mais longo, captação aprofundada, drone e pendrive.',
  },
  {
    id: 'alianca',
    name: 'Aliança',
    positioning: 'A experiência completa.',
    bestFor: 'Para quem quer guardar também as palavras, os votos e a cerimônia na íntegra.',
    promise: 'A forma mais completa de preservar tudo aquilo que realmente importa.',
    deliverables: [
      { label: 'Tudo da experiência Diamante', highlight: true },
      { label: 'Cerimônia completa editada' },
      { label: 'Entradas completas' },
      { label: 'Votos completos' },
      { label: 'Troca de alianças' },
      { label: '“Sim” completo' },
      { label: 'Preservação integral da cerimônia', highlight: true },
    ],
    price: 6970,
    deliveryTime: '60 a 90 dias (máximo 150)',
    differentiator: 'Soma a cerimônia na íntegra ao Diamante.',
    valueNote: 'Separado: Diamante R$ 5.970 mais Cerimônia R$ 2.670 daria R$ 8.640. Na Aliança, vocês economizam R$ 1.670.',
    valueHighlight: 'Economize R$ 1.670',
  },
]

// Serviços adicionais
export const DEFAULT_ADDONS: Addon[] = [
  {
    id: 'tempo-extra-filme',
    name: 'Tempo extra de filme',
    description: 'Mais minutos de edição no seu filme.',
    benefit: 'Seu filme com mais momentos e mais respiro narrativo.',
    kind: 'quantity',
    unitPrice: 990,
    downsellPrice: 900,
    unitMinutes: 5,
    maxUnits: 6,
    hideForCeremonyOnly: true,
  },
  {
    id: 'previa',
    name: 'Prévia',
    description: 'Um primeiro recorte do filme, entregue em até 2 semanas após o casamento.',
    benefit: 'A emoção mais recente, enquanto ainda está viva.',
    kind: 'bonus',
    hideForCeremonyOnly: true,
  },
]

// Condições de pagamento (reais). checkoutUrl é preenchido por proposta.
export const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'sinal',
    kind: 'signal',
    label: 'Reservar a data com sinal',
    description: 'Sinal de 20% para garantir a data. O saldo é parcelado até o casamento.',
    signalRate: 0.2,
    checkoutUrl: null,
  },
  {
    id: 'avista',
    kind: 'full',
    label: 'Pagamento integral',
    description: 'Quitação à vista, com 5% de desconto sobre o total.',
    discountRate: 0.05,
    checkoutUrl: null,
  },
  {
    id: 'cartao',
    kind: 'installments',
    label: 'Parcelar no cartão',
    description: 'Parcelamento no cartão de crédito via checkout seguro.',
    maxInstallments: 12, // [PREENCHER: nº real de parcelas]
    checkoutUrl: null,
  },
]
