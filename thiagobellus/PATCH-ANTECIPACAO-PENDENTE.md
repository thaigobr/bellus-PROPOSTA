# CONCLUÍDO: repasse da antecipação ao cliente do cartão

Status em 30/07/2026: **no ar nos dois lados e conferido.**

## Regra
Quem escolhe cartão paga todas as taxas (cartão + custo de antecipar), para o Thiago receber o valor cheio de uma vez. PIX à vista e 50% + 50% continuam sem acréscimo nenhum.

## Fórmula (idêntica nos dois lados)
```
antecipação = (pct_mes / 100) * (n + 1) / 2      // prazo médio das parcelas em meses
líquido     = base / (1 - antecipação)
total       = arredonda2((líquido + 0,49) / (1 - taxa_cartão))   // 2,99% em 1x, 3,49% em 2 a 6x
```
`pct_mes` vem de `integracao_config.asaas_antecipacao_pct_mes` (hoje `1.15`). Colocar `0` desliga o repasse sem novo deploy.

## Onde está publicado
- **Front:** `thiagobellus/p/app.js` função `totalCart`, enviado ao cPanel em `public_html/thiagobellus/p`. O `index.html` chama `app.js?v=12`.
- **Backend:** edge function `asaas-cobranca-pro`, versão 5, no Supabase `nngvxucybligmanbedrs`.

## Valores em produção
| Base | À vista PIX | 50% + 50% | Cartão 3x |
|---|---|---|---|
| R$ 3.150 (André, Bossa Carioca) | R$ 3.150 | R$ 1.575 + R$ 1.575 | 3x R$ 1.113,75 (total R$ 3.341,26) |
| R$ 5.000 (Rodrigo, Vinhos na Serra) | R$ 5.000 | R$ 2.500 + R$ 2.500 | 3x R$ 1.767,76 (total R$ 5.303,28) |

Landings atualizadas com esses mesmos números: `proposta-banda-bossa-carioca.vercel.app` e `proposta-vinhos-na-serra.vercel.app`.

## Ao mexer nisso de novo, lembre
1. Mudou a conta? Mude **nos dois lugares**, bumpe o `?v=N` do `index.html` e suba os dois ao cPanel.
2. **Não faça requisição de teste à URL nova antes do upload:** o Cloudflare cacheia o `?v=N` por ~4h e você envenena a versão. Se acontecer, é só pular para o próximo número.
3. Depois de publicar, **atualize as landings** que anunciam o valor da parcela, senão o anunciado deixa de bater com o checkout.
4. Deploy do front pela Vercel **não muda o site**: `belluseventos.com.br` é servido pelo cPanel (o projeto `bellus-proposta` na Vercel não serve esta pasta).

## Único item ainda com o Thiago
Ligar a **antecipação automática** no painel do Asaas (Configurações de recebimento). O repasse já está cobrado do cliente; falta o Asaas efetivamente antecipar. Confirmar lá a taxa real da conta: se for diferente de 1,15% a.m., basta ajustar `integracao_config.asaas_antecipacao_pct_mes` no banco, sem deploy.
