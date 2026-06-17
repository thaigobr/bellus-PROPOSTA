# Checklist de testes — Bellus Proposta

> Marcados com ✅ os itens já verificados na build de demonstração
> (`/proposta/mariana-e-lucas`).

## Critérios de aceitação (do briefing)

- [x] ✅ A proposta carrega por um identificador individual (`/proposta/<slug>`).
- [x] ✅ Dados do cliente e do evento aparecem corretamente (hero + resumo do evento).
- [x] ✅ O cliente pode selecionar um pacote (cards e tabela comparativa).
- [x] ✅ O cliente pode selecionar adicionais (com preço definido).
- [x] ✅ O valor total atualiza em tempo real (testado: troca de experiência e desconto à vista; ex.: Aliança = R$ 6.970).
- [x] ✅ O cliente pode escolher uma condição de pagamento (sinal / à vista / cartão).
- [x] ✅ O botão de checkout usa o link correto (href reflete a condição selecionada).
- [x] ✅ O resumo funciona em desktop (coluna fixa) e celular (barra inferior).
- [x] ✅ Não há botões sem função (checkout sem link → cai no WhatsApp com aviso).
- [x] ✅ Informações ausentes aparecem como `[PREENCHER: ...]`.
- [x] ✅ Nova proposta exige apenas alterar os dados centralizados (`src/data`).
- [x] ✅ Build de produção sem erros (`npm run build`).

## Funcional (refazer ao cadastrar uma proposta real)

- [ ] Trocar o pacote atualiza o resumo e a barra inferior.
- [ ] Marcar/desmarcar adicional soma/subtrai no total imediatamente.
- [ ] Condição **sinal**: mostra valor do sinal (20%) e saldo.
- [ ] Condição **à vista**: aplica 5% de desconto.
- [ ] Condição **cartão**: mostra nº de parcelas e valor da parcela.
- [ ] Aceite dos termos habilita o botão de pagamento.
- [ ] Botão de pagamento abre o link do provedor (Pix/cartão) configurado.
- [ ] Após pagar, o provedor redireciona para `/proposta/obrigado`.
- [ ] WhatsApp abre com mensagem preenchida (nome, data, pacote).
- [ ] Adicional “sob consulta” (sem preço) não entra na conta e oferece “Consultar”.
- [ ] Slug inexistente mostra a página “Proposta não encontrada”.

## Responsivo / mobile-first

- [x] ✅ 375 px (mobile): hero, cards, comparação e resumo legíveis.
- [x] ✅ 1280 px (desktop): pacotes em 3 colunas; resumo fixo na lateral.
- [ ] 768 px (tablet): conferir grid intermediário.
- [ ] Barra inferior respeita a área segura (notch/gesture bar) no iOS.
- [ ] Tabela de comparação rola horizontalmente sem quebrar o layout.

## Acessibilidade

- [x] ✅ Foco visível (anel dourado) em links e botões.
- [x] ✅ `prefers-reduced-motion` desativa animações.
- [x] ✅ Ícones SVG (sem emoji); botões com rótulo.
- [ ] Navegação por teclado: Tab percorre na ordem visual; FAQ abre com Enter.
- [ ] Leitor de tela: pacotes e condições anunciam estado selecionado.
- [ ] Contraste AA conferido em ambos os fundos (claro e carvão).

## Privacidade / SEO

- [x] ✅ `noindex, nofollow` via metadata e header HTTP `X-Robots-Tag`.
- [ ] Nenhum dado pessoal enviado ao analytics (somente ids/slugs).
- [ ] `.env.local` não versionado; links de checkout fora do repositório público.

## Conteúdo (antes de enviar a um cliente real)

- [ ] Nenhum `[PREENCHER:` visível na proposta (faltam: horas de cobertura, políticas, links).
- [ ] Remover `demo: true` da proposta.
- [x] ✅ Depoimentos reais inseridos (Gabi & Michael, Ludmila & Wallace).
- [ ] Vídeos do portfólio (IDs do YouTube) inseridos.
