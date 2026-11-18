# Homologação reproduzível — N3

Este roteiro complementa [o gate N3](n3-gate.md). Não comprova execução nem conformidade LGPD/WCAG. Daniel é o avaliador e aprovador de PRs.

## Identificação

| Campo | Valor |
| --- | --- |
| Data, hora e fuso | PENDENTE |
| SHA publicado no GitHub Pages | PENDENTE |
| URL | https://nunesd66.github.io/cartao-visitas-bruna/ |
| Navegador, SO e viewport | PENDENTE |
| Evidência e responsável | PENDENTE |

Conferir o SHA do workflow de Pages: o HEAD de `master` pode não ser o deploy efetivo.

## Verificação local

```sh
npm ci
npm run build:css
git diff --exit-code -- css/style.css
node --check js/main.js
node --check js/analytics.js
node --check js/privacy.js
node --check js/map.js
npm test
node scripts/check-local-assets.mjs
```

Registrar comandos, falhas, saída e SHA. Checks verdes não substituem validação no navegador.

## Matriz de testes manuais

Usar aba anônima sem dados anteriores; em Network ativar Preserve log. Filtrar `googletagmanager`, `google-analytics`, `collect` e `google.com/maps`.

| Cenário | Resultado inicial | Evidência necessária |
| --- | --- | --- |
| Primeira visita sem escolha: não carregar GA4/Maps | NÃO EXECUTADO | Network, cookies |
| Recusar, navegar, recarregar e retornar | NÃO EXECUTADO | Network, escolha persistida |
| Aceitar em sessão limpa: tag e pageview só após ação | NÃO EXECUTADO | Waterfall e DebugView |
| Revogar: bloquear eventos futuros, limpar cookies acessíveis | NÃO EXECUTADO | Network, cookies |
| Alterar consentimento em outra aba | NÃO EXECUTADO | Estado das duas abas |
| Maps: iframe apenas após clique | NÃO EXECUTADO | Network antes/depois |
| GA4 Mensuração otimizada: verificar duplicidades e parâmetros | NÃO EXECUTADO | Configuração e DebugView |
| Viewports 320, 390, 768, 1440 px | NÃO EXECUTADO | Capturas, overflow e CTAs |
| Teclado, menu, FAQ, carrossel, zoom 200%, leitor de tela | NÃO EXECUTADO | Passos e resultado |
| Movimento reduzido | NÃO EXECUTADO | Configuração e observação |
| Lighthouse mobile e desktop | NÃO EXECUTADO | Relatório, SHA, LCP, CLS |
| WhatsApp, Instagram, telefone, Maps externos | NÃO EXECUTADO | Destino real de cada link |
| Search Console, sitemap e inspeção de URL | NÃO EXECUTADO | Capturas da propriedade |

Registrar PASS, FAIL, BLOQUEADO ou NÃO EXECUTADO por cenário, com justificativa. A revogação não apaga dados já transmitidos. Clique no WhatsApp não confirma lead/agendamento. INP real depende de dados de campo: não inferir de um Lighthouse isolado.

**Decisão:** N3 só pode ser homologado após resolução dos bloqueadores do gate e aprovação humana. N4/N5 não são automaticamente aprovados com o N3.
