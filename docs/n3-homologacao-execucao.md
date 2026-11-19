# Homologação reproduzível — N3

Este roteiro complementa [o gate N3](n3-gate.md). Não comprova execução nem conformidade LGPD/WCAG. Daniel é o avaliador e aprovador de PRs.

## Identificação

| Campo | Valor |
| --- | --- |
| Data, hora e fuso | PENDENTE |
| SHA publicado no GitHub Pages | PENDENTE |
| URL | https://nunesd66.github.io/cartao-visitas-bruna/ |
| Navegador, SO e viewport | PENDENTE |
| Evidência e responsável | PENDENTE |

Conferir o SHA do workflow de Pages: o HEAD de `master` pode não ser o deploy efetivo.

## Verificação de 18/11/2026

| Evidência | Resultado |
| --- | --- |
| Publicação | [GitHub Pages no SHA `e932c54f267a0c2cedec3921c1b3142c1e63814e`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44321742093) concluído com sucesso |
| Arquivos públicos | 30/30 iguais aos da revisão esperada; smoke HTTP passou 10/10 |
| Suíte da revisão | `npm test` passou 90/90; referências locais e comparação do CSS recompilado passaram |
| Chromium em cópia local da revisão verificada | 320, 390, 768 e 1440 px: sem overflow horizontal; botão principal acionável; FAQ, carrossel e fotos navegáveis por teclado; transferência de foco em movimento reduzido nos depoimentos |
| Network em Chromium com terceiros interceptados | Primeira visita e recusa sem requisições a terceiros; Maps solicitou o iframe somente após Enter. Aceite do GA4 solicitou uma tag simulada; revogação bloqueou evento e, no retorno, manteve a recusa |
| Lighthouse em cópia local da mesma revisão | LCP mobile 3,83 s / desktop 0,77 s; CLS mobile 0 / desktop 0,005. A ferramenta sinalizou `NO_SCREENSHOTS`, então a categoria Performance ficou sem nota. A medição completa em produção permanece pendente |
| Operação recorrente | Workflow diário configurado em #71. Na consulta desta rodada, sua primeira execução ainda não constava no GitHub Actions |

## Verificação após integrar os PRs #79–84

- O [deploy de `dad77bfc097ba830a4d802652f23352d58467f37`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44325988297) concluiu com sucesso. A revisão passou 94 testes e a checagem de referências locais.
- Os 30 arquivos públicos conferiram byte a byte. Cinco imagens atingiram o limite de tempo na primeira passagem e conferiram na segunda, com requisições individuais.
- Na cópia dessa revisão, Chromium validou 320, 390, 768 e 1440 px sem overflow horizontal, com CTA principal acionável, navegação por teclado em FAQ e carrosséis e Maps solicitado sob demanda.
- Em Chromium, duas abas da mesma origem sincronizaram o consentimento e a revogação. A recusa bloqueou eventos, removeu cookies sintéticos `_ga` na raiz e `_ga_TEST` no caminho do projeto, preservou um cookie de preferência e persistiu no retorno. A tag do GA4 foi interceptada; DebugView e Mensuração otimizada continuam pendentes.
- A tentativa de medir o site publicado pela API PageSpeed em mobile retornou HTTP 429. O Lighthouse completo em produção e o leitor de tela real permanecem pendentes.

## Medição em produção de 18/11/2026

O [Lighthouse 13.6 no Chrome do GitHub Actions](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44328020671) auditou a URL pública por volta de 11h47, horário de Brasília. A comparação antes e depois confirmou 30 arquivos idênticos à revisão `575002861952a5e336adf3da527a5194e6a2a2e2`.

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 98 | 100 | 100 | 100 | 1,57 s | 0 | 157 ms |
| Desktop | 100 | 100 | 100 | 100 | 0,54 s | 0,0055 | 42 ms |

A tabela apresenta uma execução de laboratório por perfil. Versão do Chrome, ambiente e parâmetros estão nos artefatos do run. O baseline histórico foi coletado em outro ambiente; diferenças entre as medições não isolam o efeito de uma mudança. INP de campo segue sem medição nesta rodada.

### Acessibilidade no navegador

- Em 320, 390, 768 e 1440 px, o axe não reportou violações automáticas nos estados de primeira visita e menu aberto. A árvore de acessibilidade do Chromium expôs o nome da região de privacidade, as duas escolhas e as setas de depoimentos.
- A verificação de contraste por pixels nos casos inconclusivos do hero e dos 11 rótulos de depoimentos encontrou mínimos de 5,10:1 para a linha introdutória, 6,13:1 para o título, 5,41:1 para a descrição, 7,82:1 para a legenda da foto e 10,53:1 para os rótulos de origem.
- O teste manual com leitor de tela permanece pendente. As inspeções de árvore e do axe registram a evidência disponível no navegador.

### Search Console, GA4 e autorização de imagens

- Em 18/11/2026 às 14h51, o print da Inspeção de URL para a página inicial mostrou, na aba Teste em tempo real, que a página estava disponível para o Google e podia ser indexada.
- Em 18/11/2026, a aba Índice do Google confirmou que a página inicial está indexada. Um print separado mostrou a página inicial como resultado orgânico para `Bruna Eduarda Beauty`.
- O `sitemap.xml` abriu no navegador e listou a página inicial. A inspeção indicou que nenhum sitemap de referência foi detectado para a URL. O processamento no relatório Sitemaps permanece sem evidência.
- Em 18/11/2026, o print do fluxo Web do GA4 mostrou a Métrica otimizada ativada, incluindo visualizações de página, rolagens, cliques de saída, pesquisa no site e interações com formulário. Uma nova captura do mesmo dia confirmou a chave desativada. O painel continuou exibindo o indicador padrão de visualizações de página. A validação dos eventos recebidos pelo DebugView permanece pendente.
- Daniel informou que a Bruna aprovou o uso de todas as fotos e imagens. Daniel confirmou o WhatsApp já publicado como canal para dúvidas e solicitações sobre dados e autorizou o ajuste do aviso no site.

### Revisão do aviso com a responsável

| Ponto | Evidência ou decisão |
| --- | --- |
| Preferência | O navegador guarda a opção em `localStorage` e permite alterá-la pelo escudo de Privacidade. |
| Analytics | O código aguarda Aceitar e limita eventos próprios a categorias e parâmetros definidos. Métrica otimizada desativada na propriedade GA4. Confirmar coleta real e retenção. |
| Outros canais | O iframe de Maps depende de solicitação explícita. Os links externos vão ao respectivo serviço. O FAQ monta localmente a mensagem que é encaminhada ao WhatsApp. |
| Informação ao visitante | O aviso informa que o Google Analytics depende de aceite e indica como recusar, mudar a escolha e contatar a Bruna pelo WhatsApp. Daniel confirmou a aprovação do aviso publicado e informou os valores de retenção configurados. Usar o [guia de cookies da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file). |

## Verificação complementar em 18/11/2026

| Critério | Evidência e limite |
| --- | --- |
| Revisão e PRs | `master` em [`112c625`](https://github.com/nunesd66/cartao-visitas-bruna/commit/112c62597b3bf476303cae0d20f27879db9a76e0), com #86–88 integrados. Não foi possível associar a última publicação a um SHA nesta rodada. |
| Testes locais | No checkout `3e65411`, que contém o ajuste visual do #87, `npm test` passou 94/94 e a checagem de referências locais passou. Os blobs de `index.html` e `js/analytics.js` correspondem à `master`. A suíte simula a tag localmente. |
| GA4: agendamento | O DebugView mostrou um `contact_intent`, com `channel=whatsapp` e `cta_location=header_desktop`. A lista exibida não trouxe texto da mensagem ou campo de URL do WhatsApp. Evidência fornecida por Daniel. |
| GA4: visualizações | Uma única abertura relatada por Daniel resultou em dois `page_view` no DebugView. Outro par mostrou o mesmo `batch_page_id`. O resumo do Tag Assistant apresentou seis visualizações na mesma tag de GA4. Na captura de Config, `send_page_view:false` está presente e o destino exibido tem prefixo `GTM-`, enquanto o HTML da `master` configura um ID `G-`. As capturas posteriores mostram o mesmo identificador de página para dois envios: o hit nº 1 foi atribuído a Inicialização, e o nº 2 à chamada explícita `gtag('event', 'page_view', {})`, exibida como Alteração do histórico. Config e Contêiner carregado não mostraram hits. O estado da tag de destino e do acionador de Inicialização na interface do Google ainda precisa ser conferido. |
| Search Console | Página inicial indexada. O relatório Sitemaps mostrou falha de busca e zero páginas. O teste em tempo real conseguiu buscar o XML e o reenvio foi confirmado. A leitura posterior com status Processado e uma página ainda não foi confirmada. |
| Canais em navegador | Na verificação anterior em produção, agendamento e FAQ abriram o WhatsApp com destino e mensagem esperados. O Maps abriu o perfil da empresa no endereço aprovado. Nenhuma mensagem foi enviada. O `tel:` corresponde ao número publicado, sem discagem. O Instagram pediu login. O teste em navegador sem JavaScript não foi concluído. |
| Lighthouse e leitor de tela | As notas de produção 98 mobile e 100 desktop continuam vinculadas a `5750028`. A nova inspeção da produção no navegador foi bloqueada por limite do ambiente. O teste manual com leitor de tela real permanece pendente. |

Para corrigir a duplicidade, conferir a configuração da tag de destino e do acionador de Inicialização no contêiner antes de mudar o JavaScript. O [guia de compatibilidade do Google](https://support.google.com/tagmanager/answer/18411054?hl=pt-BR) explica quando a tag aguarda o `gtag('config')` e quando os parâmetros da interface têm precedência. Se for necessário reproduzir, bloquear os destinos de coleta antes de carregar a tag ou usar um fluxo de testes. Esta rodada não enviou dados sintéticos à propriedade real. O [guia de pageviews do Google](https://developers.google.com/analytics/devguides/collection/ga4/views) distingue os disparos de Config dos baseados em alterações do histórico.

## Rodada de privacidade em 18/11/2026

- Base: `master` em `372d45729af623ed48c2ba7900cdaa8c3c273c7b`, com os PRs #91–94 mesclados. O aviso inclui o WhatsApp já publicado, sem preencher nem enviar uma mensagem.
- A cópia de trabalho dos ajustes do N3 passou 88 testes, checagem de referências e comparação byte a byte do CSS recompilado. O teste confere o destino do link contra o telefone publicado. Não houve coleta de dados sintéticos na propriedade de produção.
- Seguem pendentes a configuração que gerou o `page_view` em Inicialização, o status Processado do sitemap, a confirmação da publicação mais recente e a rodada manual de acessibilidade e canais.

## Correção da visualização duplicada

O Tag Assistant mostrou dois hits à mesma URL e com o mesmo identificador de página. A tag Google Analytics usa Initialization – All Pages. O primeiro hit foi atribuído à Inicialização; o segundo veio da chamada manual do site. O [guia do Google sobre tags de destino](https://support.google.com/tagmanager/answer/17326492?hl=en) descreve o envio automático de visualizações.

O patch remove a chamada manual e mantém o bloqueio da tag até o aceite e o tratamento de revogação. A cópia local passou 88 testes e a checagem de referências. Nenhum dado sintético foi enviado ao fluxo real. O cenário de um único hit por abertura precisa ser verificado usando a tag carregada, com coleta interceptada ou fluxo de teste, após o deploy.

## Evidências da publicação em 18/11/2026

- O GitHub confirmou a integração do [PR #96](https://github.com/nunesd66/cartao-visitas-bruna/pull/96) em `d1b3f236b056d39d68d34cc55a13350300256ca9`. A captura dos jobs mostrou deploy concluído e Daniel confirmou a presença do marcador de implementação do #96 no `js/analytics.js` servido pelo Pages. O teste identifica o script corrigido; não representa uma comparação byte a byte de todo o deploy.
- Após o aceite em uma abertura, a aba Network mostrou `page_view` em duas tentativas com o mesmo ID de página, sequência e parâmetros do evento. A requisição para `www.google-analytics.com` foi bloqueada, e a tentativa alternativa para `www.google.com/g/collect` obteve HTTP 204. Isso sustenta um único evento lógico e um único envio com resposta de sucesso na abertura observada. A tentativa alternativa passou pelo bloqueio. Em novas reproduções, interceptar todos os destinos de coleta, inclusive o alternativo, ou usar um fluxo de testes.
- O aviso publicado mostrou o link para falar com a Bruna pelo WhatsApp. A configuração de retenção exibiu 2 meses para eventos, 14 meses para dados do usuário e redefinição por nova atividade ativada. A consulta não alterou as configurações.
- O relatório Sitemaps ainda mostrou falha, zero páginas e última leitura em 18/11, sem horário nem motivo específico. O XML público lista a página inicial indexada. A leitura posterior ao reenvio continua sem confirmação.
- Daniel confirmou a aprovação do aviso publicado. Daniel também confirmou que os dois links dos depoimentos abriram o perfil correto no Instagram. Daniel confirmou em produção o arraste dos depoimentos e a abertura do discador pelo link de telefone. Leitor de tela e navegação sem JavaScript seguem pendentes.

## Verificação da publicação em 19/11/2026

| Critério | Evidência |
| --- | --- |
| Publicação | [GitHub Pages](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44405397713) concluiu o deploy de `7db7833a4489a571b762603752a64114369d6c8f` às 18h49 de 18/11, horário de Brasília. |
| Integridade em produção | Em 19/11 às 07h37, `node scripts/verify-release.mjs <SHA>` confirmou 30/30 arquivos byte a byte. O `smoke-public.mjs --published-sha <SHA>` confirmou status 200 e Content-Type esperado nos 10 recursos. |
| Testes da revisão | 90/90 em `npm test`. Checagem de referências locais e de sintaxe dos scripts passou. Sass 1.108.2 recompilou CSS idêntico ao versionado. |
| Navegador em produção | Em Chrome, a 1363×936 px (1348 px de área útil), sem overflow horizontal. Após recusar Analytics, o primeiro FAQ abriu por Enter. Nove links de agendamento identificados na revisão, quatro deles nos cards de serviço. O botão “Avaliar no Google” abriu o endereço configurado por Enter. O destino final aguardou verificação de tráfego do Google nesse navegador. O Maps tinha link direto disponível e iframe ainda sem origem antes de interação. |
| Search Console | Daniel enviou captura com “Sitemap enviado”. O XML em produção respondeu 200 com `application/xml`; confirmação de leitura com sucesso pelo Search Console segue pendente. A home já consta como indexada nas evidências de 18/11. |
| Acessibilidade e performance pendentes | Leitor de tela real ainda aguarda execução. A última medição completa de Lighthouse em produção é a de `5750028`, registrada acima. |

### Continuação do N3 em 19/11/2026

- **Base publicada.** O [deploy de `7db7833`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44405397713) continuava sendo a publicação mais recente. A nova comparação encontrou 30/30 arquivos idênticos. O PR #99 ainda estava aberto, com base em `7db7833`.
- **Sem JavaScript.** No Chromium 140.0.7339.0, com cópia local e JavaScript desativado, 320×568, 390×844, 768×1024 e 1440×900 ficaram sem overflow horizontal. Menu e FAQ nativos abriram por Enter. Em cada viewport, o navegador abriu CTAs do início, fim e serviço, uma fonte de depoimento, avaliação e Maps. A abertura foi até a URL configurada com o serviço externo interceptado. O `tel:` foi conferido no HTML renderizado. Nenhuma solicitação externa ocorreu automaticamente.
- **Correção candidata do PR #99.** A cópia publicada expunha controles de rolagem inativos sem JavaScript e anunciava “Abrir menu de navegação” depois de o menu já estar aberto. No candidato, a fixação do cabeçalho e o painel auxiliar aparecem após a inicialização do script, e o menu nativo mantém nome estável com estado recolhido ou expandido. Com JavaScript ligado e Analytics recusado, 390×844 e 1440×900 passaram nas verificações de visibilidade, teclado, foco e axe-core 4.11.1, com zero violações nas regras WCAG 2.0/2.1 A e AA executadas. O resultado de axe e da árvore de acessibilidade do Chromium é parcial. A sessão com leitor de tela real segue pendente.
- **Lighthouse 13.6.0.** O acesso de Lighthouse à produção falhou por confiança no certificado do ambiente. Na cópia local de `7db7833`, LCP foi 3,83 s mobile e 0,76 s desktop, com CLS de 0 e 0,0032. A execução reportou `NO_SCREENSHOTS` e ficou sem nota de performance em ambos os perfis. O resultado completo de produção continua vinculado a `5750028`.
- **GA4 e Search Console.** Todos os destinos externos foram interceptados durante os testes de interação. Nenhum dado sintético foi enviado ao GA4. O sitemap público continuou listando a home indexada. A confirmação de processamento no Search Console requer acesso à propriedade.

## Lighthouse na publicação em 19/11/2026

A [execução 44526263473](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44526263473) conferiu os arquivos publicados antes e depois da medição e associou os resultados ao deploy `1a693276ffd3404fa6514b796a1631573239e8a0`. Lighthouse 13.6.0, com Chrome em runner do GitHub Actions.

| Perfil | Performance | LCP | CLS | TBT | Requisições | Transferência |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 80 | 1,65 s | 0 | 821 ms | 14 | 3.095,2 KiB |
| Desktop | 100 | 0,40 s | 0,0075 | 0 ms | 19 | 3.404,6 KiB |

Mobile e desktop obtiveram 100 em acessibilidade automatizada, boas práticas e SEO. No mobile, três fotos das galerias responderam por aproximadamente 2,3 MiB. O TBT é resultado de laboratório desta rodada. Investigue o trabalho de layout e confirme a variação em execuções comparáveis antes de atribuir o bloqueio a uma causa.

## Leitor de tela e publicação do PR 110

- Em 19/11, o teste do PR #110 usou Orca 50.3 e Firefox 160.0 em Linux/X11, com tela virtual de 1440 × 900 e perfil novo. Em `http://127.0.0.1:8765/`, a navegação por Tab produziu os anúncios “Pular para o conteúdo” e “Recusar” em português do Brasil. A execução foi automatizada por Codex no GitHub Actions. [Execução e logs de fala](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44577554207).
- O teste usou a revisão `c62a94284c4ad3040cb18a88aed01344d94df826`. O merge `5791e5adfb0f1179b1b36801f91580036268f43b` alterou apenas o workflow em relação à base, e os arquivos públicos do candidato e do merge são idênticos pela árvore Git. A interação por Tab ocorreu sem aceitar analytics.
- O GitHub Pages publicou `5791e5a` em 19/11. A comparação com a URL pública retornou 33/33 arquivos idênticos. O smoke disparado pelo deploy retornou 10/10. [Deploy](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44579384341) · [Smoke](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44579545896).
- A evidência com Orca cobre os dois anúncios no ambiente local do CI. A inspeção manual da jornada permanece aberta. A última medição de Lighthouse segue vinculada a `aedfdce`, com performance 100 em mobile e desktop. [Medição](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44543696312).

## Matriz de regressão em produção de 19/11/2026

A revisão do [deploy `1fdfdfa`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44588383976) foi conferida com 33/33 arquivos idênticos antes e depois da medição. O [smoke pós-deploy](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44588556230) passou 10/10. Às 16h02, em Brasília, uma execução local de contingência também passou 10/10. O [histórico do workflow](https://github.com/nunesd66/cartao-visitas-bruna/actions/workflows/production-smoke.yml) ainda não registrava execução por agendamento.

| Motor em Debian 13 | Perfis emulados | Verificações aprovadas |
| --- | ---: | ---: |
| Chromium 151.0.7922.34 | 7 | 90/91 |
| Firefox 153.0 | 3 | 37/39 |
| WebKit 26.5 | 5 | 64/65 |

A rodada passou 45/45 verificações específicas de toque. O axe sinalizou conteúdo fora de regiões no menu auxiliar aberto e no WhatsApp flutuante a 768 px. Os controles responderam nos cenários testados. A coleta de analytics foi interceptada. Edge ficou bloqueado na inicialização, e Safari nativo e aparelhos físicos ficaram fora da cobertura.

O Lighthouse 13.6 registrou performance 93 com LCP de 1,55 s no mobile e 94 com LCP de 0,38 s no desktop. As notas variaram em execuções da mesma revisão. O sitemap serviu XML por HTTP 200. A confirmação de processamento no Search Console continua pendente.

## Verificação local

```sh
npm ci
npm run build:css
git diff --exit-code -- css/style.css
node --check js/main.js
node --check js/analytics.js
node --check js/privacy.js
node --check js/map.js
npm test
node scripts/check-local-assets.mjs
```

Registrar comandos, falhas, saída e SHA. Checks verdes não substituem validação no navegador.

## Matriz de testes manuais

Usar aba anônima sem dados anteriores; em Network ativar Preserve log. Filtrar `googletagmanager`, `google-analytics`, `collect` e `google.com/maps`.

| Cenário | Resultado inicial | Evidência necessária |
| --- | --- | --- |
| Primeira visita sem escolha: não carregar GA4/Maps | NÃO EXECUTADO | Network, cookies |
| Recusar, navegar, recarregar e retornar | NÃO EXECUTADO | Network, escolha persistida |
| Aceitar em sessão limpa: tag e pageview só após ação | NÃO EXECUTADO | Waterfall e DebugView |
| Revogar: bloquear eventos futuros, limpar cookies acessíveis | NÃO EXECUTADO | Network, cookies |
| Alterar consentimento em outra aba | NÃO EXECUTADO | Estado das duas abas |
| Maps: iframe apenas após clique | NÃO EXECUTADO | Network antes/depois |
| GA4: verificar configuração da Métrica otimizada | PASS | Chave desativada no fluxo Web |
| GA4: clique de agendamento sem texto da mensagem nos parâmetros | PASS | DebugView, capturas de Daniel |
| GA4: uma visualização por abertura | PASS | Abertura observada após o #96; duas tentativas do mesmo hit, uma com HTTP 204 |
| Viewports 320, 390, 768, 1440 px | NÃO EXECUTADO | Capturas, overflow e CTAs |
| Teclado, menu, FAQ, carrossel, zoom 200%, leitor de tela | PARCIAL | [Orca e Firefox](#leitor-de-tela-e-publicação-do-pr-110) confirmaram dois anúncios. Inspeção manual da jornada pendente |
| Movimento reduzido | NÃO EXECUTADO | Configuração e observação |
| Lighthouse mobile e desktop | NÃO EXECUTADO | Relatório, SHA, LCP, CLS |
| WhatsApp, Instagram, telefone, Maps externos | NÃO EXECUTADO | Destino real de cada link |
| Search Console: indexação da página inicial | PASS | Inspeção de URL, aba Índice do Google |
| Search Console: processamento do sitemap | PENDENTE | Busca ao vivo e reenvio confirmados; aguardar leitura posterior |

Registrar PASS, FAIL, BLOQUEADO ou NÃO EXECUTADO por cenário, com justificativa. A revogação não apaga dados já transmitidos. Clique no WhatsApp não confirma lead/agendamento. INP real depende de dados de campo: não inferir de um Lighthouse isolado.

**Decisão:** N3 só pode ser homologado após resolução dos bloqueadores do gate e aprovação humana. N4/N5 não são automaticamente aprovados com o N3.
