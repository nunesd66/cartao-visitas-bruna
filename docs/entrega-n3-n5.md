# Entrega do N3 ao N5

Meta desta rodada: segunda-feira, 23 de novembro de 2026, no horário de Brasília. Cada nível é aceito com evidências da revisão e do ambiente correspondente.

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

### Fila de entrega

| Ordem | Macrotarefa | Microtarefas |
| --- | --- | --- |
| 1 | N3 — Verificar o estado publicado | Confirmar deploy e identidade dos arquivos; rodar smoke; registrar baseline responsivo, acessibilidade, Network e Lighthouse |
| 2 | N3 — Corrigir regressões observadas | Reproduzir, corrigir, adicionar cobertura pertinente e repetir a verificação |
| 3 | N4 — Consolidar identidade visual | Inventariar tokens e componentes; aplicar refinamentos; comparar em mobile e desktop; solicitar validação da direção |
| 4 | N4 — Validar jornada comercial | Mapear entrada, serviços, provas sociais e WhatsApp; verificar CTAs e links em todos os pontos; definir hipótese e evidência possível |
| 5 | N5 — Rastrear release e recuperação | Vincular smoke ao deploy; registrar ambiente, revisão e procedimento de recuperação; ensaiar em branch isolada |
| 6 | N5 — Definir operação e evolução | Registrar responsáveis, verificação de links e ativos, interpretação das métricas e abertura da próxima rodada |

## Protocolo de publicação e recuperação

1. Registre o SHA de `master` aprovado no PR e o último SHA estável já servido. Localize a execução de publicação em GitHub Actions, registre o link e confirme a conclusão.
2. Execute `node scripts/smoke-public.mjs`. Confira HTML e recursos públicos contra os arquivos esperados do SHA publicado. Registre horário, URL, SHA, saída do comando e problemas observados.
3. Se houver regressão, reproduza e avalie o impacto. Crie uma branch a partir de `master` atualizada para reverter o commit responsável ou restaurar os arquivos afetados. Valide a proposta e abra PR de recuperação, mantendo o histórico.
4. Após o deploy corretivo, repita o smoke e o cenário que falhou. Registre o encerramento, a revisão restaurada e o teste de regressão associado.

A revisão técnica pode avançar em paralelo. Aprovação de identidade, revisão de privacidade, acesso ao GA4/Search Console e dados reais continuam com seus respectivos responsáveis.
