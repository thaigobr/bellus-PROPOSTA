# Bellus · ecossistema digital · estado

> atualizado: 2026-06-24 · sessão #5

## Objetivo
Ecossistema digital da Bellus Eventos (filmes de casamento premium, Teresópolis/RJ, diretor Thiago Rodrigues), ticket ≈ R$ 7,5k. HostGator próprio (belluseventos.com.br, cPanel) + 1 Supabase compartilhado. Narrativa-mãe: **Noiva dos Sonhos = imaginar** (isca, IA gera a noiva) → **Bellus = lembrar** (o filme). Quatro frentes: institucional, painel de propostas/admin, proposta pública por cliente e a isca.

## Estado atual
- **EM PRODUÇÃO e estável.** Go-live 23/06: site novo na raiz (era WordPress+Ecwid), Asaas em produção (Pix sem taxa + cartão até 12x), Supabase zerado.
- **Meta Pixel + CAPI** (pixel 574…101) feitos e validados (24/06): institucional (PageView/Lead/Contact), proposta (ViewContent/InitiateCheckout/Purchase) + Purchase server-side no `asaas-webhook` (dedup por event_id).
- **Pastas CONSOLIDADAS** hoje em `Desktop\Bellus-Ecossistema\` (3 repos vivos + isca). Cópias antigas/build isoladas em `Desktop\_LIXO-revisar\` (a descartar). Reorg íntegra (git + mtime conferem). `.context` versionado no repo bellus-PROPOSTA.

## Próxima ação
Fechar pendências do go-live com o Thiago: (a) **rotacionar token HostGator** (exposto no chat — segurança); (b) **teste real R$5** Pix ponta-a-ponta (valida webhook token Asaas↔Supabase + Purchase); (c) cancelar 3 cobranças teste no Asaas prod (cliente "Teste Ambiente", CPF 12345678909); (d) painel Meta: marcar Lead/Purchase como conversão + AEM; apagar edge function `capi-test`. **Depois:** vazamento #2 — destacar/ordenar leads quentes da isca (`origem='noiva-dos-sonhos'`) no painel, mostrar a imagem gerada junto do lead, e view de temperatura no Supabase (quente 4–10m / urgente <4m / nutrir >10m).

## Decisões travadas
- Estrutura consolidada em `Bellus-Ecossistema`. Repos: institucional=`thaigobr/bellus`, painel+proposta=`thaigobr/bellus-PROPOSTA`, isca=`thaigobr/noivadossonhos`. Apps = HTML/CSS/JS puro no cPanel, sem build. Hospedagem HostGator + Supabase (NÃO Vercel).
- **Pagamento macro (propostas) = Asaas** (Pix sem taxa = saldo exato; cartão até 12x com gross-up das taxas). Micro (isca) = Mercado Pago PIX. Stripe/Inter/MP-macro descartados.
- Supabase `base_noivadossonhos` é compartilhado: mudança sempre aditiva/isolada; nunca quebrar a isca. Bellus usa `proposta_pagamentos` + secrets ASAAS_*/META_*.
- Copy sem travessões. Institucional muda de uma em uma com aprovação visual. Chat PT-BR e enxuto.

## Armadilhas conhecidas
- **`deploy_edge_function` via MCP reseta `verify_jwt=TRUE`** → `asaas-webhook` (Asaas chama sem JWT) quebra 401; redeployar com `verify_jwt:false`.
- **cPanel HostGator:** `.htaccess` não aceita `save_file_content` nem upload direto → subir nome normal + `fileop op=copy` por cima. `upload_files` de arquivo existente exige `-F overwrite=1`.
- Cloudflare cacheia .js/.css ~4h → SEMPRE bumpar `?v=N`. Datas `YYYY-MM-DD` parsear como LOCAL (não UTC). Preview trava na `/v2` da isca (GSAP/Lenis).
- Asaas: `value` em REAIS; criar customer exige cpfCnpj; autentica por header `access_token` (não Bearer); detecta sandbox/prod por "hmlg" na key.

## Arquivos-chave
- `Bellus-Ecossistema\painel-proposta\` (repo bellus-PROPOSTA) → subpastas `painel\` (/painel/) e `proposta\` (/p/). `.context` aqui.
- `Bellus-Ecossistema\institucional\` (repo bellus) → raiz belluseventos.com.br (ex-/novo/).
- `Bellus-Ecossistema\isca-noivadossonhos\` (repo noivadossonhos) → noivadossonhos.com.br.
- Supabase ref `nngvxucybligmanbedrs`. Edge: `get-proposta`, `asaas-cobranca`, `asaas-webhook` (verify_jwt false). Secrets: ASAAS_API_KEY (prod), ASAAS_WALLET_ID `2b9ffb4d-7183-4f8d-b211-0f22be1f4e09`, ASAAS_WEBHOOK_TOKEN, META_CAPI_TOKEN.
- Handoff isca↔Bellus: `isca-noivadossonhos\.context\handoff-bellus.md`.
