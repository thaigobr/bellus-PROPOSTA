import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Política de Privacidade · Bellus Eventos',
  robots: { index: false, follow: false },
}

const INTRO = 'Como a Bellus Eventos trata os seus dados ao longo da proposta e da prestação dos serviços.'

const SECTIONS: LegalSection[] = [
  {
    title: 'Quais dados coletamos',
    body: [
      'Coletamos os dados que você nos fornece: nome, e-mail, telefone ou WhatsApp e informações do evento, como data, local e cidade.',
    ],
  },
  {
    title: 'Para que usamos',
    body: [
      'Usamos esses dados para preparar e personalizar a sua proposta, manter contato e executar os serviços contratados.',
    ],
  },
  {
    title: 'Compartilhamento',
    body: [
      'Não vendemos seus dados. Podemos usar provedores de pagamento e ferramentas necessárias à prestação do serviço, que tratam os dados apenas para essa finalidade.',
    ],
  },
  {
    title: 'Imagem',
    body: [
      'O uso de imagem do material audiovisual segue o contrato. Você pode restringir esse uso por escrito no momento da assinatura.',
    ],
  },
  {
    title: 'Seus direitos',
    body: [
      'Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelos nossos canais de contato, conforme a Lei Geral de Proteção de Dados (LGPD).',
    ],
  },
]

export default function PrivacidadePage() {
  return <LegalPage title="Política de Privacidade" intro={INTRO} sections={SECTIONS} />
}
