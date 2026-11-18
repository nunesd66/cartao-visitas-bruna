# N3-04 — Smoke test após publicação

Este smoke test verifica disponibilidade HTTP **no ambiente apontado**; não certifica desempenho, renderização, indexação, consentimento nem conversão.

```bash
node scripts/smoke-public.mjs --published-sha "$PAGES_DEPLOY_SHA"
# Disponibilidade local sem SHA de publicação
node scripts/smoke-public.mjs http://localhost:8080/
```

Obtenha o SHA completo nos detalhes do deploy bem-sucedido do GitHub Pages e use esse valor em `PAGES_DEPLOY_SHA`. O relatório registra o SHA informado, o horário UTC e o ambiente. A opção associa a evidência HTTP ao SHA confirmado pelo operador. Para uma consulta de disponibilidade sem essa confirmação, execute o comando sem `--published-sha`. Redirecionamentos nos recursos testados são tratados como falhas.

## Microtarefas e subtarefas
- [x] Verificar HTML, CSS, JS, robots, sitemap, imagem social e foto de apresentação por HTTP 200 e Content-Type esperado.
- [x] Retornar erro de processo quando um recurso não responder como esperado.
- [ ] Relacionar execução ao SHA real publicado e manter saída no relatório de deploy.
  - [ ] Guardar data, URL, commit, relatório HTTP e responsável.
- [ ] Executar Lighthouse mobile e desktop no site implantado.
  - [ ] Guardar LCP, CLS, Speed Index e regressões; INP requer dados reais de campo.
- [ ] Verificar Search Console (indexação e processamento do sitemap) na propriedade.
- [ ] Conferir SEO, CTAs, consentimento e Maps via navegador/Network.
- [ ] Validar imagens de galerias e imagens de depoimentos por verificação em navegador.

## Gate de aceite
Smoke HTTP aprovado **e** inspeção visual/Network concluída, Lighthouse atual, Search Console verificado. Baselines anteriores não são evidência do commit novo.

Não executar este script automaticamente em PRs, porque a URL do GitHub Pages pode estar servindo outra revisão da master, gerando falsos positivos ou negativos.
