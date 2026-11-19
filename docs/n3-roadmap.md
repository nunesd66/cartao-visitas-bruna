# N3 — Plano de execução por macrotarefas (PRs)

Escopo: SEO, mensuração, privacidade, acessibilidade e qualidade verificável. N4 está fora do escopo. Não alterar textos comerciais, imagens, URLs de WhatsApp ou propriedade GA4 sem autorização específica.

## N3-01 — Gestão e rastreabilidade (este PR)
- [x] Mapear macrotarefas e decompor em microtarefas e subtarefas.
- [x] Definir ordem, bloqueadores e critérios de aceite.
- [x] Registrar SHA publicado, URL, data e evidências dos cenários executados no [roteiro de homologação](n3-homologacao-execucao.md).
- [ ] Consolidar decisão de homologação; não confundir testes automatizados com operação real.

## N3-02 — Privacidade e analytics (PR separado)
- [x] Adicionar [guardas de terceiros](../scripts/third-party-guards.test.mjs) para Maps sob demanda, política de referência do iframe e ausência de script remoto de analytics no HTML.
- [x] Exercitar primeira visita, aceite, recusa, revogação e retorno no Network em Chromium com terceiros interceptados. [Evidência](n3-homologacao-execucao.md#verificação-de-18112026)
- [x] Registrar a aprovação do aviso e a configuração de retenção informada por Daniel. [Evidência](n3-homologacao-execucao.md#evidências-da-publicação-em-18112026)
- [x] Registrar Métrica otimizada desativada, parâmetros do clique observado no DebugView e a verificação de `page_view` em uma abertura após o #96. [Cobertura e limites](n3-gate.md#analytics-e-privacidade)
- [ ] Consolidar o aceite da frente com as evidências aplicáveis do [gate](n3-gate.md).
**Aceite:** proteções automatizadas e validação externa documentada; não declarar LGPD atendida só pelo banner.

## N3-03 — Acessibilidade, UX e integridade da jornada (PR separado)
- [x] Adicionar [guardas automatizadas](../scripts/a11y-structure.test.mjs) de idioma, landmarks, IDs únicos, destinos internos, texto alternativo e links em nova aba.
- [x] Registrar verificação técnica de teclado, foco, menu, FAQ, carrossel e movimento reduzido. A sequência 9→10→11→1 tem [cobertura automatizada](../scripts/carousel.test.mjs).
- [ ] Fazer inspeção manual WCAG 2.2 AA com leitor de tela e documentar resultados.
**Aceite:** checks e inspeção manual; teste estático não prova WCAG.

## N3-04 — Publicação, desempenho e indexação (PR separado)
- [x] Automatizar [smoke HTTP](n3-deploy-smoke.md) para HTML, CSS, JS, robots e sitemap e registrar sinais de disponibilidade no [gate](n3-gate.md#publicação-e-indexabilidade).
- [x] Verificar CSS compilado e integridade dos ativos locais no [CI](../.github/workflows/pr-checks.yml).
- [x] Conferir canonical, Open Graph, JSON-LD e sitemap e registrar a indexação da página inicial no Search Console.
- [ ] Confirmar o processamento do sitemap no relatório Sitemaps após o reenvio.
- [x] Medir [Lighthouse mobile e desktop em produção](n5-production-smoke.md#medição-pública-após-a-otimização-das-galerias) na revisão `aedfdce` e registrar LCP, CLS e TBT. INP de campo segue sem medição.
**Aceite:** verificação atual de produção, sem atribuir métricas históricas ao deploy corrente.

## Dependências e conclusão
- Ordem de revisão sugerida: N3-01 → N3-02 → N3-03 → N3-04. PRs independentes contra master, sem merge automático.
- PR #10 (mapa sob demanda) e PR #11 (validação SEO estática) já foram integrados.
- Pendências: confirmação do processamento do sitemap por quem tem acesso ao Search Console, inspeção manual da jornada com leitor de tela e confirmação dos destinos externos indicados no [gate](n3-gate.md). Revisões adicionais na propriedade GA4 exigem acesso autorizado.
- N3 concluído somente após os PRs serem aprovados, deploy auditado e bloqueadores externos resolvidos.
