# Bruna Eduarda Beauty

Landing page estática de design e micropigmentação de sobrancelhas em Coromandel (MG). Objetivo principal: facilitar o contato e o pedido de agendamento via WhatsApp.

**[Site publicado](https://nunesd66.github.io/cartao-visitas-bruna/)** · **[Repositório](https://github.com/nunesd66/cartao-visitas-bruna)** · **[Pull Requests](https://github.com/nunesd66/cartao-visitas-bruna/pulls)**

## Prévia

| Desktop · 1440 px | Celular · 390 px |
| --- | --- |
| ![Desktop](docs/screenshots/desktop-visao-geral.png) | ![Mobile](docs/screenshots/mobile-visao-geral.png) |

[Captura completa](docs/screenshots/desktop.png) — imagens de referência produzidas em 17/11/2026; podem não representar o último commit.

## Funcionalidades

- Apresentação profissional, serviços, galerias de resultados, depoimentos e FAQ.
- CTAs de WhatsApp, canais de contato e Google Maps carregado **somente após clique explícito**, com link externo alternativo.
- Layout responsivo, menu móvel, navegação por teclado, cabeçalho adaptativo, carrossel de avaliações e respeito à preferência por movimento reduzido.

## Stack e execução

HTML semântico, SCSS compilado em CSS e JavaScript nativo. Sem framework nem dependências de runtime. Node.js >=20.19.0 e npm são usados apenas no desenvolvimento (Sass fixado no lockfile).

```bash
npm ci
npm run build:html
npm run build:css
python -m http.server 8080
```

Acesse `http://localhost:8080`. Edite a estrutura da página em `src/index.html`, o conteúdo por seção em `src/sections/` e a interface compartilhada em `src/components/`. Execute `npm run build:html` e inclua o HTML gerado na PR enquanto o Pages publicar a partir da raiz da branch. Edite o SCSS junto à seção ou componente. O arquivo `src/styles/main.scss` define a ordem da cascata. Gere `css/style.css` com `npm run build:css`.

### Verificação local

Para conferir o pacote estático isolado, execute `npm run build` e sirva `dist/` com `python -m http.server 8080 --directory dist`. O pacote inclui o HTML e o CSS gerados, os módulos JavaScript usados pelo site, as imagens versionadas, o sitemap e o robots. O workflow de publicação atual ainda usa a raiz da branch.

O `js/main.js` inicializa os módulos por funcionalidade. Os testes de comportamento ficam ao lado dos módulos em `js/`. Os testes estruturais e de publicação ficam em `scripts/`.

```bash
node --check js/main.js
node --check js/analytics.js
node --check js/privacy.js
node --check js/map.js
npm test
node scripts/check-local-assets.mjs
```

O workflow `Pull request checks` valida build, sintaxe, testes Node e referências de assets. **Checks verdes não substituem testes visuais, Network, acessibilidade manual nem Lighthouse.**

## SEO e publicação

Para migrar a publicação para `dist/`, selecione **GitHub Actions** como origem em **Settings → Pages** e execute **Publish static site to GitHub Pages** na `master`. Confira o smoke e execute `node scripts/verify-release.mjs <SHA-do-deploy>` depois da publicação. Durante a transição, os arquivos gerados continuam na raiz. Para voltar ao fluxo anterior, selecione **Deploy from a branch**, com `master` e `/ (root)`.

A branch protegida `master` publica no GitHub Pages por workflow. O HTML declara canonical, Open Graph e JSON-LD `BeautySalon`. O sitemap fica em `/cartao-visitas-bruna/sitemap.xml`. O Google lê as regras de rastreamento no `robots.txt` da raiz do host. Confira os endereços de publicação no [gate do N3](docs/n3-gate.md). O favicon de marca depende de aprovação. Depois do deploy, verifique os recursos públicos, rode Lighthouse e confirme a indexação no Search Console.

## Analytics e privacidade

O site contém o Measurement ID de GA4 `G-YVS4N0BZ9S` (Stream ID `16362293759`) e utiliza `js/analytics.js` + `js/privacy.js` com **Consent Mode básico**:

- A tag Google e os eventos próprios dependem de consentimento. O painel guarda a escolha em `localStorage` quando disponível.
- Ao receber o aceite ou restaurar uma escolha aceita, a implementação pode carregar `gtag.js`. A tag pode enviar uma visualização de página após o carregamento.
- O consentimento inicial nega todos os tipos de armazenamento; após aceite, apenas `analytics_storage` passa a `granted`. Estados de publicidade, Google Signals e personalização de anúncios permanecem desabilitados.
- Revogação bloqueia novos eventos próprios, sinaliza `denied`, ativa `ga-disable-<ID>` e tenta excluir cookies GA acessíveis. Não elimina dados previamente transmitidos.

O comando `config` mantém `send_page_view: false` e passa a URL da página sem query ou fragmento. O site delega a visualização inicial à tag de destino após o aceite. Os eventos próprios são `contact_intent` (cliques no WhatsApp), `contact_channel_click` e `faq_open`, com parâmetros filtrados por lista permitida. O clique no WhatsApp mede intenção de contato.

Daniel confirmou a aprovação do aviso publicado. As evidências registram Métrica otimizada desativada no fluxo Web, um `contact_intent` no DebugView e, após o #96, um único `page_view` lógico na abertura observada em produção. Primeira visita, aceite, recusa, retorno e revogação também foram exercitados em Chromium com terceiros interceptados. A homologação do N3 segue pendente. [Evidências e limites](docs/n3-homologacao-execucao.md) · [Gate de aceite do N3](docs/n3-gate.md)

Para orientações de privacidade, consulte o [guia de cookies da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).

## Evolução e próximos passos

O progresso é acompanhado por [commits](https://github.com/nunesd66/cartao-visitas-bruna/commits/master/), [PRs](https://github.com/nunesd66/cartao-visitas-bruna/pulls?q=is%3Apr) e pelo [roadmap de N3](docs/n3-roadmap.md). O [gráfico histórico](docs/evolucao-commits.svg) é um retrato do período anterior, **não um contador atualizado nem medida de qualidade**. Evite manter totais fixos de commits no README.

**N3 — em andamento:** SEO e testes estruturais, privacidade/analytics, acessibilidade/UX e homologação de publicação/performance. Consulte [gate de aceite do N3](docs/n3-gate.md). Não marcar N3 concluído sem as evidências externas exigidas.

## Regras de mudança

- Preservar textos comerciais, títulos, serviços, FAQ, avaliações, contatos, mensagens de WhatsApp e metadados existentes sem autorização explícita.
- Mudanças em texto alternativo, ARIA ou SEO que sejam necessárias à correção técnica devem ser propostas e aprovadas separadamente.
- Antes do merge, conferir diff textual, testes, links e impacto em acessibilidade/privacidade.
- Em rollback, preferir `git revert` seguido de novo deploy; não usar force-push na `master`.

**Conteúdo a validar pela responsável:** preços/serviços, textos, telefone, endereço, horário de atendimento e links externos.
