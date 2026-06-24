# Bellus · ecossistema digital · estado

> atualizado: 2026-06-23T01:30:00Z · sessão #4

## Objetivo
Ecossistema digital da Bellus Eventos (filmes de casamento, Teresópolis/RJ, diretor Thiago Rodrigues) no HostGator próprio (belluseventos.com.br, cPanel) + Supabase como backend compartilhado. Três apps no ar: institucional, painel de propostas/admin e proposta pública por cliente.

## Estado atual
- **Painel** (/painel/) v16, **Institucional** (/novo/) v13, **Proposta** (/p/) v21 (detalhes no journal).
- **PROPOSTA pós-pagamento humanizada (v19-v21):** saldo no Pix (sem taxa, = saldo exato) ou cartão parcelado (com taxa); painel da reserva com parabéns + data em destaque + contagem regressiva + experiência contratada (lida de pagamento.pacote_id); seleção de experiências oculta após reserva; estado quitado mostra "Pagamento concluído" sem botão. Lógica genérica p/ os 4 pacotes. get-proposta v9 retorna pacote_id; asaas-cobranca v10 grava pkg_id (coluna nova em proposta_pagamentos).
- **PAINEL 4 frentes (v15-v16):** (a) bloco de pagamento completo no detalhe (experiência, condição, momento, sinal/total/saldo, %, histórico); (b) cores de status unificadas com a visão geral (vars --st-*); (c) calendário interativo (Agenda + Dashboard) com dias coloridos, hoje, navegação, clique→proposta + aviso de segurança "Próximo casamento (faltam N dias)"; (d) agenda com link público /p/slug.
- **PAGAMENTO migrou de Stripe para ASAAS** (menor taxa + funciona no Brasil). Stripe descartada (Pix invite-only/indisponível, conta travada, e NÃO faz parcelado no Brasil só MX/JP). MP e Inter descartados (MP mais caro; Inter exige mTLS que o Deno do Supabase não suporta bem).
- **PIX via Asaas FEITO e TESTADO end-to-end no SANDBOX:** migração aditiva (colunas asaas_* em proposta_pagamentos), edge function `asaas-cobranca` (calcula sinal 20% no servidor, cria cobrança Pix, retorna QR dinâmico imagem+copia-e-cola; cartão via invoiceUrl preparado) e `asaas-webhook` (reconsulta status no Asaas, fecha data=reservada, trava duplo-booking, estorno em conflito). Ciclo provado: cobrança→pagamento→webhook→proposta "reservada"+pagamento "pago" (testado na beatriz-e-thiago-3k9p, revertido). Webhook configurado no sandbox.
- **FRONTEND da proposta (v14) FEITO e testado no preview:** botão **Pix** abre modal com **QR dentro da proposta** + CPF + acompanhamento automático (polling `asaas-status`); condição **"parcelar no cartão"** pede CPF e redireciona pro **checkout hospedado do Asaas** (invoiceUrl, valor total parcelável). Funções: `asaas-cobranca` (v3: pix=sinal 20% / card=total), `asaas-webhook`, `asaas-status`. Tudo em sandbox; arquivos LOCAIS, não subiu pro HostGator ainda.

## Próxima ação
**GO-LIVE FEITO (2026-06-23).** Site novo na RAIZ belluseventos.com.br (era WordPress+Ecwid; copiei /novo->raiz server-side + .htaccess novo com DirectoryIndex index.html e RedirectMatch ^/novo->raiz; WP preservado em index.php; /novo movido p/ _novo-bak; reversao via .htaccess.wp-bak). **Asaas em PRODUCAO** (Thiago trocou ASAAS_API_KEY p/ chave sem `hmlg`; cobranca real testada OK). QR Pix com retry (asaas-cobranca v14). Supabase ZERADO (0 propostas/leads de teste). Outros dominios isolados em /home2/bellus38/<dom> (noivadossonhos/souclone/proposta.bellus) intactos. ARMADILHA HostGator: .htaccess nao aceita save_file_content nem upload direto -> subir nome normal + fileop op=copy por cima.
Pendencias do Thiago: (a) cancelar 3 cobrancas teste no Asaas prod (cliente "Teste Ambiente" CPF 12345678909); (b) ROTACIONAR token HostGator (exposto no chat); (c) ajustes visuais finos do site; (d) opcional: apagar WordPress antigo de vez. Melhorias futuras mapeadas (nao bloqueiam): confirmacao email/wpp pos-pagamento, contrato automatico, export leads+UTM, pixel/analytics, Google Calendar, upsell.

## Decisões travadas
- Hospedagem = HostGator + Supabase (NÃO Vercel). Apps = HTML/CSS/JS puro, sem build.
- **Pagamento = ASAAS (Pix + cartão), um provedor só.** Pix tarifa fixa R$1,99 (R$0,99 promo 3m); cartão à vista 2,99%+R$0,49, parcelado até 21x (3,49/3,99/4,29%). Revoga a decisão anterior (Stripe).
- Supabase base_noivadossonhos compartilhada: mudança sempre aditiva/isolada; nunca quebrar Noiva dos Sonhos; Bellus usa `proposta_pagamentos` (NÃO a `payments` do NdS) e secrets ASAAS_* próprios.
- Nunca usar travessões na copy. Institucional: mudar de uma em uma com aprovação visual. Chat: PT-BR e enxuto.

## Armadilhas conhecidas
- Cloudflare cacheia .js/.css ~4h → SEMPRE bumpar `?v=N`.
- **Asaas:** `value` é em REAIS (não centavos); criar customer EXIGE cpfCnpj (front coleta o CPF do pagador); QR Pix só gera com chave Pix ativa na conta (a do Thiago já tem); autentica por header `access_token` (não Bearer); base sandbox `api-sandbox.asaas.com/v3`, prod `api.asaas.com/v3` (função detecta por "hmlg" na key).
- Webhook Asaas: validar reconsultando o status real na API (não confiar no payload); idempotente.
- Preview innerHeight=0 trava scroll/IO; screenshot trava com animação contínua. gh CLI não instalado → git puro.

## Arquivos-chave
- Proposta `Desktop\bellus-proposta-publica\` → /p/ · Painel `Desktop\bellus-proposta-app\` → /painel/ · Institucional `Desktop\bellus-institucional\` → /novo/
- Edge functions: `get-proposta` (v3), `asaas-cobranca`, `asaas-webhook`. (Stripe `create-checkout`/`stripe-webhook` a aposentar.) Tabela `proposta_pagamentos` (+colunas asaas_*).
- Supabase project: nngvxucybligmanbedrs. Secrets: ASAAS_API_KEY (sandbox `aact_hmlg`), ASAAS_WALLET_ID `2b9ffb4d-7183-4f8d-b211-0f22be1f4e09`.
- Backup GitHub: institucional→thaigobr/bellus; painel+proposta→thaigobr/bellus-PROPOSTA.
