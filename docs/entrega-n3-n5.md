# Entrega do N3 ao N5

Meta desta rodada: segunda-feira, 23 de novembro de 2026, no horário de Brasília. Cada nível é aceito com evidências da revisão e do ambiente correspondente.

Tarefas independentes de N3, N4 e N5 podem avançar em paralelo. Priorize as pendências acionáveis do N3 e registre o que depende de acesso, aprovação ou entrega anterior. Cada nível é homologado com as evidências e os aceites dos seus próprios critérios.

## Ciclo de trabalho

1. O orquestrador confere a branch padrão, os PRs, os critérios e o caminho crítico. Distribui capacidade entre os coordenadores visual e funcional.
2. Cada coordenador define uma macrotarefa por PR. Divide-a em microtarefas, delega aos especialistas e explicita escopo, arquivos, dependências e evidências de aceite.
3. Os especialistas trabalham em worktrees distintos e devolvem revisão base, commits, testes, resultados e pendências. Cada arquivo compartilhado tem um responsável por rodada, inclusive o HTML.
4. Os coordenadores reproduzem os testes, revisam os diffs e pedem ajustes na mesma branch. Enviam os resultados consolidados e a decisão de revisão ao orquestrador.
5. O orquestrador confere dependências e compatibilidade entre PRs, solicita correções ou envia para revisão, atualiza o quadro e inicia o ciclo seguinte.

| Equipe | Especialidades | Responsabilidade |
| --- | --- | --- |
| Visual | Responsividade e identidade | Layout, tipografia, componentes, imagens aprovadas e consistência visual |
| Visual | Acessibilidade e QA visual | Teclado, foco, contraste, movimento reduzido e evidências em diferentes telas |
| Funcional | Interações e privacidade | Menu, FAQ, galerias, contatos, Maps e consentimento |
| Funcional | SEO e operação | Metadados, smoke tests, CI, rastreabilidade de deploy e recuperação |

### Branches e revisão

- Partir da branch padrão atualizada. Neste repositório, ela é `master`. Manter entregas independentes em branches separadas e abrir PRs para revisão.
- Quando uma tarefa depender de PR aberto, testar em uma branch temporária de integração. Manter a mudança nova em commits identificáveis. Se necessário, abrir PR com base na dependência e retargetar após o merge.
- Se houver espera por revisão, conta externa ou aprovação comercial, registrar quem pode resolver a pendência e desenvolver a próxima tarefa independente. Preservar textos publicados, fotografias originais e canais comerciais aprovados.
- Antes de cada relatório, anotar nível, requisito, impacto esperado, base, commit, PR, ambiente, comando ou procedimento, resultado e próximo passo. Usar estados `implementado`, `em revisão`, `publicado`, `homologado` e `bloqueado` conforme a evidência.

## Critérios por nível

| Nível | Entregas | Evidência necessária |
| --- | --- | --- |
| N3 — SEO, métricas e refinamentos | Privacidade, indexabilidade, acessibilidade, fluxo até o contato e desempenho | [Gate N3](n3-gate.md), [smoke de publicação](n3-deploy-smoke.md), navegador, Search Console e validação autorizada do GA4 |
| N4 — Identidade visual e conversão | Direção visual aprovada pela profissional, sistema visual aplicado, jornada até o contato e hipótese de conversão documentada | Aceite visual responsivo, teste da jornada e protocolo de medição. Identificar cliques no WhatsApp como intenção de contato |
| N5 — Operação contínua (proposta) | Release rastreável, verificação pós-publicação, recuperação, manutenção e ciclo de melhoria orientado por dados | Associar verificações a um deploy, ensaiar recuperação em branch isolada, registrar responsável operacional e documentar a primeira revisão de indicadores autorizados |

## Situação em 23/11/2026

O [GitHub Pages publicou `d11e58db05a81dc902343186b4d3301b03dd29d2`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44605705990). A homologação dos três níveis segue pendente pelos critérios abaixo.

| Nível | Evidências verificadas | O que falta para o aceite |
| --- | --- | --- |
| N3 | 33/33 arquivos públicos conferidos. O [Lighthouse](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44798447655) mediu performance de 98 no mobile e 100 no desktop, com zero requisições aos destinos bloqueados do GA4. [Orca e Firefox](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44595293760) registraram anúncios no percurso automatizado. | Confirmar o processamento do sitemap no Search Console, completar a inspeção manual com leitor de tela e confirmar o destino do botão de avaliação. |
| N4 | Direção e jornada documentadas. O Chromium exercitou a jornada de contato em quatro larguras e em duas janelas em paisagem, com destinos externos interceptados. [Registro do teste em paisagem](https://github.com/nunesd66/cartao-visitas-bruna/pull/119). | Aceite da direção visual e da hipótese prioritária, teste de tarefa com público representativo e medição após coleta autorizada. |
| N5 | Os [smokes agendados e de contingência](n5-production-smoke.md#verificação-do-release-de-19112026) têm resultados identificados pelo gatilho. O [ensaio de recuperação](verificacao-release.md#ensaio-de-recuperação-em-20112026) restaurou 33/33 arquivos em ambiente isolado. | Indicar o responsável operacional e registrar a primeira revisão de indicadores autorizados. |

O sitemap público respondeu HTTP 200 com XML. A página inicial consta como indexada na evidência de 18/11. A confirmação de processamento do sitemap depende do relatório da propriedade. O destino atual de “Avaliar no Google” segue publicado enquanto se aguarda o link oficial, pois a verificação de tráfego impediu confirmar a abertura do formulário.

### Pendências por responsável

| Responsável | Pendências |
| --- | --- |
| Daniel | Revisar os PRs #118 a #122. Confirmar o processamento do sitemap no Search Console (N3), indicar quem acompanha a operação (N5) e disponibilizar os indicadores autorizados do GA4 quando houver dados suficientes (N4/N5). |
| Bruna | Obter, com quem administra o Perfil da Empresa no Google, o link direto para solicitar avaliações (N3). Dar o aceite visual, confirmar a hipótese prioritária e indicar a pessoa representativa para o teste de tarefa (N4). |
| Codex | Retomar a inspeção manual com leitor de tela quando houver sessão gráfica compatível. A tentativa de 23/11 voltou a receber `EPERM` ao abrir um socket Unix. Validar o CTA com o link oficial e analisar os dados quando houver acesso autorizado. |

### Prioridades de entrega

| Prioridade | Macrotarefa | Microtarefas |
| --- | --- | --- |
| 1 | N3 — Verificar o estado publicado | Confirmar deploy e identidade dos arquivos; rodar smoke; registrar baseline responsivo, acessibilidade, Network e Lighthouse |
| 2 | N3 — Corrigir regressões observadas | Reproduzir, corrigir, adicionar cobertura pertinente e repetir a verificação |
| 3 | N4 — Consolidar identidade visual | Inventariar tokens e componentes; aplicar refinamentos; comparar em mobile e desktop; solicitar validação da direção |
| 4 | N4 — Validar jornada comercial | Mapear entrada, serviços, provas sociais e WhatsApp; verificar CTAs e links em todos os pontos; definir hipótese e evidência possível |
| 5 | N5 — Rastrear release e recuperação | Vincular smoke ao deploy; registrar ambiente, revisão e procedimento de recuperação; ensaiar em branch isolada |
| 6 | N5 — Definir operação e evolução | Registrar responsáveis, verificação de links e ativos, interpretação das métricas e abertura da próxima rodada |

## Protocolo de publicação e recuperação

1. Registre o SHA de `master` aprovado no PR e o último SHA estável já servido. Localize a execução de publicação em GitHub Actions, registre o link e confirme a conclusão.
2. Siga a [verificação de release](verificacao-release.md) para comparar os bytes públicos com o SHA do deploy e conferir HTTP e tipos de mídia. Registre URL, horário, SHA, link da execução e resultados de ambas as verificações.
3. Se houver regressão, reproduza e avalie o impacto. Crie uma branch a partir de `master` atualizada para reverter o commit responsável ou restaurar os arquivos afetados. Valide a proposta e abra PR de recuperação, mantendo o histórico.
4. Após o deploy corretivo, repita a verificação de release e o cenário que falhou. Registre o encerramento, a revisão restaurada e o teste de regressão associado.

## Manutenção e responsáveis

Cada PR registra quem executou as verificações e quem validou a mudança. A responsável pelo negócio valida os dados e materiais comerciais. Daniel aprova as PRs. A pessoa indicada para a manutenção executa a validação técnica e acompanha o deploy e a recuperação.

| Mudança | Onde editar | O que validar antes da revisão |
| --- | --- | --- |
| Serviços, FAQ, horário e fotos | [`index.html`](../index.html) e [`images/`](../images/) | Aprovação da responsável, texto alternativo, ativos publicados e apresentação em celular e desktop |
| Telefone, WhatsApp, endereço e Maps | [`index.html`](../index.html) e o envio de dúvidas em [`js/main.js`](../js/main.js) | Consistência entre contato visível, CTAs, ficha do Maps e dados estruturados. Conferir o link direto e o mapa sob demanda |
| Layout e interações | [Módulos SCSS](../src/styles/main.scss) e [`js/main.js`](../js/main.js) | Gerar `css/style.css`, rodar `npm test` e conferir teclado, foco e movimento reduzido no navegador |
| URL pública, sitemap e metadados | [`index.html`](../index.html), [`sitemap.xml`](../sitemap.xml) e [`robots.txt`](../robots.txt) | Rodar `npm test`, conferir a URL publicada e registrar a inspeção no Search Console com o titular da propriedade |
| Consentimento e eventos | [`js/privacy.js`](../js/privacy.js) e [`js/analytics.js`](../js/analytics.js) | Revisão de privacidade e evidências do [gate N3](n3-gate.md), incluindo Network e validação autorizada na propriedade GA4 |

Em cada revisão de operação, confira o histórico do [smoke de produção](n5-production-smoke.md). No primeiro erro, registre o horário, a execução e o recurso afetado. Compare com o último deploy verificado e siga o protocolo de recuperação se confirmar regressão. Na revisão de indicadores, use as definições e os limites da [estratégia de conversão](n4-conversao.md).

A revisão técnica pode avançar em paralelo. Aprovação de identidade, revisão de privacidade, acesso ao GA4/Search Console e dados reais continuam com seus respectivos responsáveis.
