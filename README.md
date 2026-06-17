# Bellus — Propostas

Landing page **privada, personalizada e orientada ao fechamento** para a Bellus Eventos
(filmes de casamento). Cada cliente recebe um link exclusivo `/{proposta}/{slug}` com os
dados do próprio evento, os pacotes, os adicionais, o cálculo em tempo real e o checkout.

> Construída com **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.
> Mobile‑first (a maioria acessa por Instagram/WhatsApp). Páginas com `noindex, nofollow`.

---

## 1. Rodando o projeto

```bash
npm install
cp .env.local.example .env.local   # preencha os valores
npm run dev                        # http://localhost:3000
```

Proposta de demonstração: **http://localhost:3000/proposta/mariana-e-lucas**

Build de produção:

```bash
npm run build && npm start
```

---

## 2. Onde ficam os dados (modelo central)

Nenhum preço ou texto comercial está espalhado pelos componentes. Tudo vive em `src/data`:

| Arquivo | O que contém |
|---|---|
| `src/data/types.ts` | Tipos do modelo (`Proposal`, `Package`, `Addon`, `PaymentOption`…) e o helper `PENDENTE()`. |
| `src/data/defaults.ts` | Conteúdo **da marca**, reutilizável: manifesto, método, FAQ (real), processo, **catálogo das 4 experiências com nomes e preços reais**, adicionais e condições de pagamento. |
| `src/data/proposals/<slug>.ts` | Uma proposta = um cliente. Define dados do evento, recomendação e links de pagamento. Herda o catálogo. |
| `src/data/proposals/index.ts` | Registro central. Liga `slug → proposta`. |

### Marcadores de pendência

Sempre que um dado comercial ainda não foi definido, use `PENDENTE('descrição')`.
Na tela ele aparece como `[PREENCHER: descrição]` — impossível enviar sem perceber.

---

## 3. Como cadastrar uma nova proposta

1. **Duplique** `src/data/proposals/mariana-e-lucas.ts` → ex.: `ana-e-joao.ts`.
2. Ajuste os dados do cliente e do evento:

```ts
client: { name: 'Ana', partnerName: 'João' },
event: {
  type: 'Casamento',
  date: '2026-11-22',            // ISO: AAAA-MM-DD
  venue: 'Fazenda Santa Clara',
  city: 'Petrópolis, RJ',
  guestCount: '≈ 150 convidados',
  notes: 'Cerimônia ao ar livre e festa no salão.',
},
```

3. Os preços já vêm do catálogo real (`defaults.ts`) — só ajuste se este cliente tiver condição especial.
4. Ajuste `meta`:
   - `availabilityStatus`: `'available' | 'on_hold' | 'unavailable'`
   - `recommendedPackageId`: id do pacote recomendado (ex.: `'memoria'`)
   - `recommendationReason`: **justificativa real** baseada no evento (aparece como “Recomendado”).
   - `expiresAt`: validade da proposta.
   - `personalMessage`: bilhete de abertura, assinado.
5. **Remova** `demo: true` (some o selo de demonstração).
6. Registre em `src/data/proposals/index.ts`:

```ts
import { anaEJoao } from './ana-e-joao'
const PROPOSALS: Proposal[] = [marianaELucas, anaEJoao]
```

Pronto: a proposta fica em `/proposta/ana-e-joao`.

> Dica: em desenvolvimento, a home (`/`) lista os slugs cadastrados.

---

## 4. Como configurar os preços e os links de pagamento

### 4.1 Preços

As 4 experiências e seus preços reais ficam no catálogo central `src/data/defaults.ts`
(`DEFAULT_PACKAGES`): **Cerimônia R$ 2.670 · Rubi R$ 4.470 · Diamante R$ 5.970 ·
Aliança R$ 6.970**. Para mudar um preço da tabela, edite ali — vale para todas as
propostas. Para um preço especial só de um cliente, sobrescreva no arquivo da proposta:

```ts
import { DEFAULT_PACKAGES } from '../defaults'
const packages = DEFAULT_PACKAGES.map((p) =>
  p.id === 'diamante' ? { ...p, price: 5500 } : p, // condição especial deste casal
)
```

O cálculo (subtotal, desconto à vista, sinal, parcelas) é automático
(`src/lib/pricing.ts`) — você nunca soma à mão.

### 4.2 Links de checkout (por proposta e condição)

Cada **condição de pagamento** tem um `checkoutUrl`. Use o link gerado pelo seu provedor
(Mercado Pago, Pagar.me, InfinitePay, Stripe, Asaas, etc.). **Não capturamos cartão na
aplicação** — sempre o checkout seguro do provedor.

```ts
const paymentOptions = DEFAULT_PAYMENT_OPTIONS.map((o) => {
  if (o.id === 'sinal')  return { ...o, checkoutUrl: 'https://link-do-provedor/sinal-ana-joao' }
  if (o.id === 'avista') return { ...o, checkoutUrl: 'https://link-do-provedor/avista-ana-joao' }
  if (o.id === 'cartao') return { ...o, checkoutUrl: 'https://link-do-provedor/cartao-ana-joao' }
  return o
})
```

- Se `checkoutUrl` ficar `null`, o botão é desativado e o cliente é levado ao WhatsApp
  (com aviso `[PREENCHER]`) — nenhum botão “morto”.
- Após o pagamento, configure o provedor para **redirecionar** o cliente para
  `/proposta/obrigado` (página de confirmação já incluída).

### 4.3 Variáveis de ambiente

`.env.local` (a partir de `.env.local.example`):

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp comercial (só dígitos, DDI+DDD). |
| `NEXT_PUBLIC_CONSULTANT_NAME` | Nome do consultor. |
| `NEXT_PUBLIC_GTM_ID` | (Opcional) Google Tag Manager para analytics. Vazio = desativado. |

---

## 5. Analytics (sem dados pessoais)

`src/lib/analytics.ts` empurra eventos para `window.dataLayer` (Google Tag Manager).
**Nunca** registramos nome, e‑mail ou telefone — só ids/slugs.

Eventos: `proposal_view`, `portfolio_play`, `package_view`, `package_select`,
`addon_select`, `payment_option_select`, `begin_checkout`, `whatsapp_click`.

Sem `NEXT_PUBLIC_GTM_ID`, os eventos saem no console em dev e ficam silenciosos em produção.

---

## 6. Estrutura de componentes

`src/components/` — `ProposalHero`, `EventSummary`, `ValueSection`, `PortfolioSection`,
`PackageSelector`, `PackageComparison`, `AddonSelector`, `Testimonials`, `ProcessSection`,
`Faq`, `PaymentSelector`, `OrderSummary`, `CheckoutButton`, `MobileSummaryBar`,
`WhatsAppFallback`, `ProposalFooter`. O orquestrador de estado é `ProposalShell`.

---

## 7. Conteúdo que ainda depende de decisão comercial

Nomes, preços, entregas, depoimentos (Gabi & Michael, Ludmila & Wallace) e manifesto
já são reais. Procure por `[PREENCHER:` no código/tela para o que falta:

- **Horas de cobertura** por experiência.
- **Disponibilidade/valor** dos adicionais (hora extra, versão vertical para redes).
- **Links de checkout** por condição (Pix/cartão/sinal) e **nº de parcelas** no cartão.
- **Políticas**: deslocamento, alteração de data, cancelamento, escolha de músicas.
- **Links** dos Termos de contratação e da Política de privacidade.
- **Vídeos do portfólio** (IDs do YouTube da Bellus) e mais depoimentos, se houver.

---

## 8. Checklist de testes

Veja `TESTES.md`.
