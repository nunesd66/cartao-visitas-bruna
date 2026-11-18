# N3 — Plano de execução por macrotarefas (PRs)

Escopo: SEO, mensuração, privacidade, acessibilidade e qualidade verificável. N4 está fora do escopo. Não alterar textos comerciais, imagens, URLs de WhatsApp ou propriedade GA4 sem autorização específica.

## N3-01 — Gestão e rastreabilidade (este PR)
- [x] Mapear macrotarefas e decompor em microtarefas e subtarefas.
- [x] Definir ordem, bloqueadores e critérios de aceite.
- [ ] Registrar SHA publicado, URL, data, dispositivo e evidências por validação.
  - [ ] Estado de cada verificação: aprovado, falhou, não executado, bloqueado.
- [ ] Consolidar decisão de homologação; não confundir testes automatizados com operação real.

## N3-02 — Privacidade e analytics (PR separado)
- [ ] Adicionar testes estáticos para impedir regressões de carregamento de terceiros.
  - [ ] Garantir que Google Maps continue sob demanda e que analytics não tenha script remoto no HTML.
  - [ ] Verificar referrer e links seguros.
- [ ] Validar no Network primeira visita, aceitação, recusa, revogação e retorno.
- [ ] Verificar na propriedade GA4 mensuração otimizada, duplicidade, parâmetros e DebugView.
- [ ] Aprovar transparência, retenção, revogação e autorização para coleta antes de homologar.
**Aceite:** proteções automatizadas e validação externa documentada; não declarar LGPD atendida só pelo banner.

## N3-03 — Acessibilidade, UX e integridade da jornada (PR separado)
- [ ] Adicionar guardas automatizadas de idioma, landmarks, IDs e âncoras.
  - [ ] Bloquear IDs duplicados e destinos internos quebrados.
- [ ] Verificar links externos target blank seguros e descrições acessíveis.
- [ ] Homologar navegação via teclado, foco, menu, FAQ, carrossel 9→10→11→1 e movimento reduzido.
- [ ] Fazer inspeção manual WCAG 2.2 AA com leitor de tela e documentar resultados.
**Aceite:** checks e inspeção manual; teste estático não prova WCAG.

## N3-04 — Publicação, desempenho e indexação (PR separado)
- [ ] Automatizar smoke checks HTTP para HTML, CSS, JS, robots e sitemap publicados.
  - [ ] Conferir status HTTP e tipo de conteúdo; relatório associado à URL/commit.
- [ ] Verificar CSS compilado e integridade dos ativos locais no CI.
- [ ] Confirmar canonical, Open Graph, JSON-LD, sitemap e Search Console (propriedade e indexação).
- [ ] Medir Lighthouse mobile/desktop do commit publicado e registrar LCP/CLS/INP quando disponíveis.
**Aceite:** verificação atual de produção, sem atribuir métricas históricas ao deploy corrente.

## Dependências e conclusão
- Ordem de revisão sugerida: N3-01 → N3-02 → N3-03 → N3-04. PRs independentes contra master, sem merge automático.
- PR #10 (mapa sob demanda) e PR #11 (validação SEO estática) já foram integrados.
- Dependências externas: autorização de privacidade, acesso GA4/Search Console e teste manual em navegador.
- N3 concluído somente após os PRs serem aprovados, deploy auditado e bloqueadores externos resolvidos.
