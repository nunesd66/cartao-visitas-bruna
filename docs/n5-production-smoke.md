# N5 — Smoke da publicação

Workflow: [Production smoke](https://github.com/nunesd66/cartao-visitas-bruna/actions/workflows/production-smoke.yml).

## Execução automatizada

O mesmo smoke será executado diariamente pelo GitHub Actions às **12:17 UTC (09:17 em Brasília)**. O agendamento é do tipo best-effort do GitHub: execuções podem atrasar ou ser desabilitadas pela plataforma em determinadas condições. Consulte o histórico de Actions para conferir se foi executado; falhas do job não fazem rollback e não enviam alertas externos por conta própria.

Um evento de implantação bem-sucedida da `master` no ambiente `github-pages` também pode iniciar o smoke. O resumo identifica o gatilho, e a saída registra o SHA indicado no evento. A primeira execução por evento foi confirmada no histórico, conforme o registro abaixo.

## Como executar manualmente

1. Após um deploy, abra **Actions → Production smoke → Run workflow**, escolhendo a branch `master`.
2. Confira o resultado do job **Validate published assets**, o resumo e o artefato `production-smoke-result`.
3. Registre URL, data, execução do workflow e SHA **efetivamente publicado** (obtido separadamente no workflow do Pages).
4. Se houver falhas, investigue os arquivos indicados antes de homologar. Não realizar rollback automático.
5. Complete as verificações manuais de [N3](n3-gate.md) e [homologação](n3-homologacao-execucao.md).

O workflow consulta uma URL pública fixa, valida status HTTP 200, Content-Type e presença de conteúdo em dez recursos e termina com falha se qualquer recurso falhar. Não publica nem altera o site, e não requer secrets.

## Verificação do release de 19/11/2026

O [GitHub Pages publicou `92ef788`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44513373457). Em 19/11 às 08h17, horário de Brasília, a execução local do mesmo script do workflow verificou **10/10 recursos públicos** com HTTP 200 e tipo esperado. A verificação de release comparou **30/30 arquivos idênticos** ao SHA completo `92ef788a66dda1976d6abf780de30471f9fedd58`.

Em 19/11 às 12h05, horário de Brasília, o [primeiro smoke disparado pelo deploy](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44550850363) verificou 10/10 recursos públicos para o SHA indicado pelo Pages, `d236ab7880ffe9c0ab9bb5676b966eae99de668e`.

Em 19/11 às 17h39, horário de Brasília, o [primeiro smoke com gatilho `schedule`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44610894810) verificou **10/10 recursos públicos**. A execução usou a revisão `d11e58db05a81dc902343186b4d3301b03dd29d2`. O SHA servido foi confirmado separadamente pelo [deploy do Pages](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44605705990). O horário foi o de início observado, posterior ao horário configurado.

Em 20/11 às 16h00, horário de Brasília, o [histórico filtrado por `schedule`](https://github.com/nunesd66/cartao-visitas-bruna/actions/workflows/production-smoke.yml?event=schedule) ainda mostrava apenas a execução de 19/11. O smoke público de contingência executado por Codex às 16h00 verificou **10/10 recursos** com HTTP 200 e o tipo esperado no mesmo deploy `d11e58db05a81dc902343186b4d3301b03dd29d2`. A execução agendada de 20/11 continuava sem evidência no momento da consulta.

Em 20/11 às 17h23, horário de Brasília, o [GitHub iniciou a segunda execução com gatilho `schedule`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44810995011). O [job confirmou 10/10 recursos públicos](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44810995011/job/136547189248). O checkout usou `d11e58db05a81dc902343186b4d3301b03dd29d2`, mesma revisão identificada separadamente no deploy do Pages.

Em 21/11 às 15h56, horário de Brasília, o [histórico filtrado por `schedule`](https://github.com/nunesd66/cartao-visitas-bruna/actions/workflows/production-smoke.yml?event=schedule) ainda não mostrava execução de 21/11. O smoke público de contingência executado por Codex verificou **10/10 recursos** com HTTP 200 e o tipo esperado no deploy `d11e58db05a81dc902343186b4d3301b03dd29d2`.

Em 21/11 às 16h18, horário de Brasília, o [smoke com gatilho `schedule`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44940185703) confirmou **10/10 recursos públicos**. O checkout usou `d11e58db05a81dc902343186b4d3301b03dd29d2`, mesma revisão identificada no deploy.

O [ensaio de recuperação de 20/11](verificacao-release.md#ensaio-de-recuperação-em-20112026) registra a detecção de conteúdo divergente e a restauração dos arquivos em branch isolada.

## Limites da evidência

- `GITHUB_SHA` é o commit da branch selecionada, **não prova o SHA efetivamente publicado pelo GitHub Pages**.
- A presença de conteúdo não confirma igualdade de bytes nem conteúdo correto. Não valida Lighthouse, acessibilidade, privacidade, indexação nem GA4.
- Disponibilidade e comportamento podem mudar entre execuções. Resultados são fotografias daquele instante.
- Avaliação e aprovação de PRs continuam com Daniel. Não automatizar merge ou rollback por este workflow.

## Peso dos arquivos em revisão

O job de PR inclui no resumo o peso total de `images/`, `css/` e `js/`, além da diferença em bytes por arquivo em relação à revisão base usada no merge de teste. O relatório é informativo. Use-o para investigar aumentos e confirme o efeito na navegação com [Lighthouse em produção](https://github.com/nunesd66/cartao-visitas-bruna/actions/workflows/n3-published-lighthouse.yml). O tamanho no repositório pode diferir do volume transferido ao navegador.

O resumo do Lighthouse traz a quantidade de requisições capturadas e o volume transferido na navegação, além de LCP, CLS e TBT. Compare execuções do mesmo perfil e registre o SHA e as condições da medição. Esses números descrevem uma visita de laboratório e variam com cache e carregamento sob demanda.

## Medição pública após a otimização das galerias

O [Lighthouse em produção de 19/11](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44543696312) verificou a revisão `aedfdce` antes e depois da medição, incluindo o tipo `image/webp` e a igualdade dos bytes das três imagens.

| Perfil | Performance | LCP | CLS | TBT | Transferência |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobile | 100 | 1,54 s | 0 | 38 ms | 1.108,4 KiB |
| Desktop | 100 | 0,40 s | 0,0075 | 0 ms | 1.417,9 KiB |

O mobile transferiu 1.986,8 KiB a menos em relação à [medição anterior](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44526263473). São medições de laboratório. A variação de TBT pode incluir diferenças no ambiente de execução.
