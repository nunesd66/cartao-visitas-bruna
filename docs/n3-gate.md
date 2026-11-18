# Gate de aceite — Nível 3 (SEO, métricas e refinamentos)

> Estado em 17/11/2026: **N2 consolidado, N3 em evolução**. Este documento define critérios verificáveis; não implica que a página esteja homologada. N4 (identidade e estratégia de conversão) não integra este gate.

## O que foi automatizado

- [x] Checagem estática em PR de consistência entre canonical, Open Graph, sitemap, robots e JSON-LD.
- [x] Checagem de existência local da imagem social e de metadados essenciais.
- [ ] Confirmar execução verde do workflow deste PR.

## Critérios externos para fechar N3

### Publicação e indexabilidade
- [ ] Confirmar `master` e commit publicado no GitHub Pages.
- [ ] Validar HTTP 200 de HTML, CSS, JS, imagens, robots e sitemap no site público.
- [ ] Confirmar propriedade do Search Console, sitemap enviado/processado e resultado da inspeção da URL. **Código indexável não equivale a indexação confirmada.**

### Analytics e privacidade
- [ ] Aprovar política/aviso, base e procedimento de consentimento/revogação com responsável.
- [ ] Verificar em Network ausência de solicitações de analytics antes de aceite e após recusa.
- [ ] Verificar revogação e retorno de visita, inclusive cookies acessíveis.
- [ ] Revisar Mensuração otimizada na propriedade GA4 para impedir eventos redundantes e vazamento de parâmetros de URL.
- [ ] Confirmar eventos em Tag Assistant / DebugView depois de autorização; **clique no WhatsApp não significa lead ou agendamento concluído**.
- [ ] Verificar carregamento sob demanda do Google Maps após clique, sem requisições de Maps antecipadas.

### UX, acessibilidade e performance
- [ ] Executar checklist visual em 320, 390, 768 e 1440 px, sem overflow horizontal e com CTAs utilizáveis.
- [ ] Testar teclado, foco, menu, FAQ, carrossel e preferência de movimento reduzido.
- [ ] Fazer inspeção manual com leitor de tela e registrar limitações.
- [ ] Executar Lighthouse mobile e desktop no commit publicado, registrar métricas e regressões em relação ao baseline histórico.
- [ ] Verificar abertura real de todos os canais e CTAs, inclusive sem JavaScript onde aplicável.

## Evidências mínimas por execução

Registrar: data, commit, URL/ambiente, dispositivo/viewport, procedimento, resultado (passou/falhou/não executado), evidência e responsável.

## Não executar automaticamente

Alterações de textos comerciais, identidade visual, copy, mensagens de WhatsApp e parâmetros de propriedade GA4 dependem de validação específica. Não declarar N3 concluído apenas porque os testes estáticos passaram.
