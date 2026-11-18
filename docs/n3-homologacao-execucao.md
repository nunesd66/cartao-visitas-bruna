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
- Daniel informou que a Bruna aprovou o uso de todas as fotos e imagens. A aprovação do aviso de privacidade e o canal de contato para esse assunto aguardam confirmação.

### Revisão do aviso com a responsável

| Ponto | Evidência ou decisão |
| --- | --- |
| Preferência | O navegador guarda a opção em `localStorage` e permite alterá-la pelo escudo de Privacidade. |
| Analytics | O código aguarda Aceitar e limita eventos próprios a categorias e parâmetros definidos. Métrica otimizada desativada na propriedade GA4. Confirmar coleta real e retenção. |
| Outros canais | O iframe de Maps depende de solicitação explícita. Os links externos vão ao respectivo serviço. O FAQ monta localmente a mensagem que é encaminhada ao WhatsApp. |
| Informação ao visitante | Confirmar quem responde pelo tratamento, canal de contato, finalidades, fornecedores e retenção antes de aprovar ou atualizar o aviso. Usar o [guia de cookies da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file). |

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
| GA4: verificar duplicidades e parâmetros | NÃO EXECUTADO | DebugView |
| Viewports 320, 390, 768, 1440 px | NÃO EXECUTADO | Capturas, overflow e CTAs |
| Teclado, menu, FAQ, carrossel, zoom 200%, leitor de tela | NÃO EXECUTADO | Passos e resultado |
| Movimento reduzido | NÃO EXECUTADO | Configuração e observação |
| Lighthouse mobile e desktop | NÃO EXECUTADO | Relatório, SHA, LCP, CLS |
| WhatsApp, Instagram, telefone, Maps externos | NÃO EXECUTADO | Destino real de cada link |
| Search Console: indexação da página inicial | PASS | Inspeção de URL, aba Índice do Google |
| Search Console: processamento do sitemap | NÃO EXECUTADO | Status no relatório Sitemaps |

Registrar PASS, FAIL, BLOQUEADO ou NÃO EXECUTADO por cenário, com justificativa. A revogação não apaga dados já transmitidos. Clique no WhatsApp não confirma lead/agendamento. INP real depende de dados de campo: não inferir de um Lighthouse isolado.

**Decisão:** N3 só pode ser homologado após resolução dos bloqueadores do gate e aprovação humana. N4/N5 não são automaticamente aprovados com o N3.
