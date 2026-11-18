# Gate de aceite — Nível 3 (SEO, métricas e refinamentos)

> Estado em 18/11/2026: **N3 com medição de produção, revisão externa pendente**. Os resultados desta rodada estão no [roteiro de homologação](n3-homologacao-execucao.md).

## O que foi automatizado

- [x] Checagem estática em PR de consistência entre canonical, Open Graph, sitemap, robots e JSON-LD.
- [x] Checagem de existência local da imagem social e de metadados essenciais.
- [x] Confirmar CI da rodada auditada e executar a suíte no SHA publicado.

## Critérios externos para fechar N3

### Publicação e indexabilidade
- [x] Confirmar `master` e commit publicado no GitHub Pages. O [deploy de `5750028`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44327342837) concluiu com êxito.
- [x] Validar recursos públicos. A verificação de conteúdo confirmou 30/30 arquivos idênticos a `5750028` antes e depois do [Lighthouse](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44328020671).
- [x] Confirmar indexação da página inicial na aba Índice do Google do Search Console.
- [ ] Confirmar envio e processamento do sitemap no relatório Sitemaps.

Para regras de rastreamento, o Google consulta o [`robots.txt` da raiz do host](https://nunesd66.github.io/robots.txt), que respondeu HTTP 404 na verificação do deploy `35528da`. Nesse estado, o Google considera o host sem regras de `robots.txt`. O [arquivo no caminho do projeto](https://nunesd66.github.io/cartao-visitas-bruna/robots.txt) respondeu HTTP 200 e permanece no smoke de artefatos. Envie o [sitemap do projeto](https://nunesd66.github.io/cartao-visitas-bruna/sitemap.xml) à propriedade correspondente no Search Console. Veja as referências do Google sobre [localização](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt) e [códigos HTTP](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec?hl=pt-br).

### Analytics e privacidade
- [ ] Aprovar política/aviso, base e procedimento de consentimento/revogação com responsável.
- [x] Verificar em Network ausência de solicitações de analytics antes de aceite e após recusa em Chromium com integrações interceptadas.
- [x] Verificar tecnicamente a revogação entre abas, a persistência da recusa e a remoção de cookies sintéticos acessíveis.
- [x] Confirmar Métrica otimizada desativada no fluxo Web do GA4. A verificação de duplicidades e parâmetros em eventos reais segue abaixo.
- [x] Confirmar o evento de intenção de contato no DebugView e uma única visualização em uma abertura da revisão publicada após o aceite. Ver a limitação da interceptação no [roteiro](n3-homologacao-execucao.md#evidências-da-publicação-em-18112026).
- [x] Confirmar o link do WhatsApp no aviso publicado e registrar a retenção configurada no GA4.
- [x] Verificar Maps sob demanda com o destino interceptado em Chromium. A solicitação do iframe começou após ativação explícita.

### UX, acessibilidade e performance
- [x] Verificar 320, 390, 768 e 1440 px, sem overflow horizontal e com CTA principal acionável.
- [x] Testar teclado, foco, menu, FAQ, carrosséis e preferência de movimento reduzido em Chromium. A conferência com leitor de tela real segue abaixo.
- [ ] Fazer inspeção manual com leitor de tela e registrar limitações.
- [x] Medir Lighthouse mobile e desktop em produção no commit `5750028`. Resultados e condições no [roteiro de homologação](n3-homologacao-execucao.md#medição-em-produção-de-18112026).
- [ ] Verificar abertura real de todos os canais e CTAs, inclusive sem JavaScript onde aplicável.

## Evidências mínimas por execução

Registrar: data, commit, URL/ambiente, dispositivo/viewport, procedimento, resultado (passou/falhou/não executado), evidência e responsável.

## Não executar automaticamente

Alterações de textos comerciais, identidade visual, copy, mensagens de WhatsApp e parâmetros de propriedade GA4 dependem de validação específica. Não declarar N3 concluído apenas porque os testes estáticos passaram.
