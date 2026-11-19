# N5 — Revisão de dependências e integrações

Ao alterar um pacote, uma ação de CI ou uma integração externa, registre na PR a versão ou o destino anterior e o proposto, o motivo, os resultados da verificação e como recuperar a versão anterior. Agrupe as alterações que precisam ser validadas juntas.

| Mudança | Revisão antes do merge | Evidência na PR |
| --- | --- | --- |
| Sass e dependências npm | Revise as notas da versão, a compatibilidade com o Node fixado no [CI](../.github/workflows/pr-checks.yml) e a diferença no [lockfile](../package-lock.json), incluindo dependências transitivas e scripts de instalação adicionados. | Rode `npm ci`, `npm run build:css` e `npm test`. Confira o diff do CSS gerado e, se houver mudança visual, confira as páginas afetadas no navegador. |
| Ações e ferramentas de CI | Confira a origem da ação, a versão selecionada, o gatilho, as permissões e o acesso a credenciais. Mantenha apenas as permissões exigidas pelo job. Revise as versões no workflow que as executa. | Vincule uma execução do workflow alterado. Em mudanças de publicação, siga o [procedimento de release e recuperação](verificacao-release.md). |
| Scripts, iframes e links externos | Identifique domínio, propósito, condição de carregamento e dados transmitidos. Confirme o destino de links alterados e registre as aprovações aplicáveis se mudar o canal ou a coleta. | Confira no navegador o fluxo afetado e as requisições relevantes. Analytics deve carregar após aceite, e Maps após ação explícita. Intercepte os destinos de coleta ou use um fluxo de testes isolado para impedir envios sintéticos ao GA4 real. Consulte o [gate do N3](n3-gate.md) e as [evidências de homologação](n3-homologacao-execucao.md#verificação-de-18112026). |

Daniel revisa as PRs e a Bruna valida alterações comerciais. Registre a decisão e a evidência no [acompanhamento da entrega](entrega-n3-n5.md).
