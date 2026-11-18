# N5 — Smoke manual da publicação

Workflow: [Production smoke (manual)](https://github.com/nunesd66/cartao-visitas-bruna/actions/workflows/production-smoke.yml).

## Execução automatizada

O mesmo smoke será executado diariamente pelo GitHub Actions às **12:17 UTC (09:17 em Brasília)**. O agendamento é do tipo best-effort do GitHub: execuções podem atrasar ou ser desabilitadas pela plataforma em determinadas condições. Consulte o histórico de Actions para conferir se foi executado; falhas do job não fazem rollback e não enviam alertas externos por conta própria.

## Como executar manualmente

1. Após um deploy, abra **Actions → Production smoke (manual) → Run workflow**, escolhendo a branch `master`.
2. Confira o resultado do job **Validate published assets**, o resumo e o artefato `production-smoke-result`.
3. Registre URL, data, execução do workflow e SHA **efetivamente publicado** (obtido separadamente no workflow do Pages).
4. Se houver falhas, investigue os arquivos indicados antes de homologar. Não realizar rollback automático.
5. Complete as verificações manuais de [N3](n3-gate.md) e [homologação](n3-homologacao-execucao.md) quando esse último documento estiver integrado.

O workflow consulta uma URL pública fixa, valida status HTTP 200 e Content-Type de dez recursos e termina com falha se qualquer recurso falhar. Não publica nem altera o site, e não requer secrets.

## Limites da evidência

- `GITHUB_SHA` é o commit da branch selecionada, **não prova o SHA efetivamente publicado pelo GitHub Pages**.
- HTTP 200 não confirma igualdade de bytes nem conteúdo correto. Não valida Lighthouse, acessibilidade, privacidade, indexação nem GA4.
- Disponibilidade e comportamento podem mudar entre execuções. Resultados são fotografias daquele instante.
- Avaliação e aprovação de PRs continuam com Daniel. Não automatizar merge ou rollback por este workflow.
