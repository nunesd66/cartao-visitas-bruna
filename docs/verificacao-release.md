# Verificar a revisão servida pelo GitHub Pages

1. Abra a execução de deploy em GitHub Actions e registre o link e o SHA indicado para a publicação.
2. Com essa revisão no clone, execute `node scripts/verify-release.mjs <ref-do-deploy>`.
3. Registre URL, horário, revisão esperada, total de arquivos iguais e eventuais divergências. O comando compara os bytes do HTML, CSS compilado, JavaScript, imagens, robots e sitemap da revisão com as respostas públicas. Um HTTP 200 com conteúdo antigo resulta em falha.
4. Se também precisar checar os tipos MIME e a disponibilidade dos recursos principais, execute o [smoke de publicação](n3-deploy-smoke.md).

O SHA é a revisão **esperada**, obtida da execução do deploy. A igualdade dos arquivos comprova a equivalência do conteúdo conferido com essa revisão. Revisões com os mesmos bytes públicos são indistinguíveis dessa forma. Em caso de divergência, confira a conclusão do deploy, a revisão registrada e a propagação antes de avaliar uma reversão.

## Execução pelo GitHub Actions

Em **Actions → Verify published Pages release → Run workflow**, informe o SHA completo da publicação bem-sucedida. O resumo da execução guarda a verificação dos arquivos e o smoke HTTP, com resultado associado à revisão esperada. O workflow é somente leitura e pode ser executado novamente após a propagação do deploy.

## Verificação em ambiente isolado

Sirva um worktree em `http://127.0.0.1:8080/` e rode o mesmo comando com essa URL como segundo argumento. Assim é possível detectar uma regressão simulada, reverter o commit numa branch de ensaio e verificar se os bytes esperados foram restaurados sem publicar.

## Evidência de 17/11/2026

- Produção: [deploy do GitHub Pages](https://github.com/nunesd66/cartao-visitas-bruna/actions/runs/44217016301) concluído com êxito para `ce2b242f7d9a3b5c40cc971c1ddbb9540361593c`. A verificação retornou 30/30 arquivos idênticos.
- Ensaio isolado: 30/30 no início, 29/30 após divergência simulada no HTML e 30/30 após reverter o commit de ensaio. O conteúdo final da branch de ensaio ficou idêntico ao da revisão base.

## Ensaio de recuperação em 20/11/2026

Em ambiente HTTP local isolado, o verificador partiu da revisão publicada `d11e58db05a81dc902343186b4d3301b03dd29d2` com **33/33 arquivos idênticos**. Após uma alteração simulada no HTML, encontrou **32/33** e encerrou com código 1, identificando apenas `index.html`. Depois de `git revert`, o verificador retornou **33/33** e a árvore Git voltou a corresponder à revisão base. O site público ficou fora do ensaio.
