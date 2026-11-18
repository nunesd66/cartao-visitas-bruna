# N3-04 — Smoke test após publicação

Este smoke test verifica disponibilidade HTTP **no ambiente apontado**; não certifica desempenho, renderização, indexação, consentimento nem conversão.

```bash
node scripts/smoke-public.mjs
# ou ambiente local:
node scripts/smoke-public.mjs http://localhost:8080/
```

## Microtarefas e subtarefas
- [x] Verificar HTML, CSS, JS, robots e sitemap por HTTP 200 e Content-Type esperado.
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
