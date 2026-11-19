# N5 — Smoke da publicação

Workflow: [Production smoke](https://github.com/nunesd66/cartao-visitas-bruna/actions/workflows/production-smoke.yml).

## Execução automatizada

O mesmo smoke será executado diariamente pelo GitHub Actions às **12:17 UTC (09:17 em Brasília)**. O agendamento é do tipo best-effort do GitHub: execuções podem atrasar ou ser desabilitadas pela plataforma em determinadas condições. Consulte o histórico de Actions para conferir se foi executado; falhas do job não fazem rollback e não enviam alertas externos por conta própria.

Um evento de implantação bem-sucedida da `master` no ambiente `github-pages` também pode iniciar o smoke. O resumo identifica o gatilho, e a saída registra o SHA indicado no evento. A primeira execução por evento deve ser confirmada no histórico.

## Como executar manualmente

1. Após um deploy, abra **Actions → Production smoke → Run workflow**, escolhendo a branch `master`.
2. Confira o resultado do job **Validate published assets**, o resumo e o artefato `production-smoke-result`.
3. Registre URL, data, execução do workflow e SHA **efetivamente publicado** (obtido separadamente no workflow do Pages).
4. Se houver falhas, investigue os arquivos indicados antes de homologar. Não realizar rollback automático.
5. Complete as verificações manuais de [N3](n3-gate.md) e [homologação](n3-homologacao-execucao.md).

O workflow consulta uma URL pública fixa, valida status HTTP 200, Content-Type e presença de conteúdo em dez recursos e termina com falha se qualquer recurso falhar. Não publica nem altera o site, e não requer secrets.

## Verificação do release de 19/11/2026

O [GitHub Pages publicou `92ef788`](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44513373457). Em 19/11 às 08h17, horário de Brasília, a execução local do mesmo script do workflow verificou **10/10 recursos públicos** com HTTP 200 e tipo esperado. A verificação de release comparou **30/30 arquivos idênticos** ao SHA completo `92ef788a66dda1976d6abf780de30471f9fedd58`.

A execução recorrente ainda precisa ser confirmada no histórico de Actions. O [ensaio de recuperação](verificacao-release.md#evidência-de-17112026) registra a detecção de conteúdo divergente e a restauração dos arquivos em branch isolada.

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
