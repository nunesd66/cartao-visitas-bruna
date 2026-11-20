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

## Situação em 19/11/2026

| Nível | Evidências reutilizadas e verificações desta rodada | O que falta para o aceite |
| --- | --- | --- |
| N3 | `5791e5a` publicado no Pages com 33/33 arquivos idênticos e smoke HTTP 10/10. Orca e Firefox confirmaram os anúncios do link de salto e do botão de recusa. Home indexada, aviso aprovado e correção do `page_view` verificada em produção. | Leitura do sitemap no Search Console, inspeção manual da jornada com leitor de tela e confirmação do destino do botão de avaliação. |
| N4 | Direção e jornada documentadas. Chromium exercitou a jornada de contato em quatro tamanhos, com os quatro CTAs de serviço e os destinos de WhatsApp interceptados. [Evidência da jornada](n4-conversao.md#verificação-técnica-em-19112026). | Revisão responsiva da direção e aprovação da hipótese prioritária pela Bruna. Fechar a verificação dos destinos e registrar o teste de tarefa. Medir a hipótese após haver coleta autorizada e janela suficiente. |
| N5 | O [primeiro smoke agendado](n5-production-smoke.md#verificação-do-release-de-19112026) passou 10/10 na revisão `d11e58db`. O [ensaio de recuperação](verificacao-release.md#ensaio-de-recuperação-em-20112026) restaurou 33/33 arquivos. O mapa de manutenção e o guia de revisão de dependências estão registrados. | Indicar o responsável operacional e registrar a primeira revisão de indicadores autorizados. |

As evidências de 19/11 estão no [roteiro de homologação](n3-homologacao-execucao.md#verificação-da-publicação-em-19112026). O resultado do [ensaio de rollback](verificacao-release.md#evidência-de-17112026) continua vinculado à revisão usada no ensaio.

### Pendências por responsável

| Responsável | Pendências |
| --- | --- |
| Daniel | Confirmar o resultado do sitemap na propriedade do Search Console (N3), indicar quem acompanha a operação (N5) e disponibilizar os indicadores autorizados do GA4 para a primeira revisão quando houver dados suficientes (N4/N5). |
| Bruna | Fornecer, com o administrador do Perfil da Empresa no Google, o link direto para solicitar avaliações (N3). Dar o aceite visual e confirmar a hipótese prioritária de conversão (N4). Combinar o teste com uma pessoa representativa do público. |
| Codex | Completar a inspeção manual com leitor de tela em uma sessão interativa e verificar o CTA após obter o link direto (N3). Analisar os indicadores quando houver dados autorizados (N5). |

Em 19/11, o histórico do smoke registrou execuções por deploy e por agendamento. Os nove links de avaliações publicadas chegaram às respectivas avaliações do Google. A abertura do formulário pelo botão “Avaliar no Google” ficou sem confirmação após a verificação de tráfego do Google.

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
| Layout e interações | [`css/style.scss`](../css/style.scss) e [`js/main.js`](../js/main.js) | Gerar `css/style.css`, rodar `npm test` e conferir teclado, foco e movimento reduzido no navegador |
| URL pública, sitemap e metadados | [`index.html`](../index.html), [`sitemap.xml`](../sitemap.xml) e [`robots.txt`](../robots.txt) | Rodar `npm test`, conferir a URL publicada e registrar a inspeção no Search Console com o titular da propriedade |
| Consentimento e eventos | [`js/privacy.js`](../js/privacy.js) e [`js/analytics.js`](../js/analytics.js) | Revisão de privacidade e evidências do [gate N3](n3-gate.md), incluindo Network e validação autorizada na propriedade GA4 |

Em cada revisão de operação, confira o histórico do [smoke de produção](n5-production-smoke.md). No primeiro erro, registre o horário, a execução e o recurso afetado. Compare com o último deploy verificado e siga o protocolo de recuperação se confirmar regressão. Na revisão de indicadores, use as definições e os limites da [estratégia de conversão](n4-conversao.md).

A revisão técnica pode avançar em paralelo. Aprovação de identidade, revisão de privacidade, acesso ao GA4/Search Console e dados reais continuam com seus respectivos responsáveis.
