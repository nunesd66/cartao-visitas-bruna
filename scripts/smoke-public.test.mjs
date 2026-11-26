import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const smokeCommand = fileURLToPath(new URL('./smoke-public.mjs', import.meta.url));
const execFileAsync = promisify(execFile);
const runSmoke = (base) => execFileAsync(process.execPath, [smokeCommand, base], { timeout: 5000 });

const contentTypes = new Map([
  ['/site/', 'text/html'],
  ['/site/css/style.css', 'text/css'],
  ['/site/js/main.js', 'application/javascript'],
  ['/site/js/analytics.js', 'text/javascript'],
  ['/site/js/privacy.js', 'application/x-javascript'],
  ['/site/js/map.js', 'text/javascript'],
  ['/site/js/accessibility/index.js', 'text/javascript'],
  ['/site/js/carousel/index.js', 'text/javascript'],
  ['/site/js/faq/index.js', 'text/javascript'],
  ['/site/js/header/index.js', 'text/javascript'],
  ['/site/js/parallax/index.js', 'text/javascript'],
  ['/site/js/whatsapp/index.js', 'text/javascript'],
  ['/site/robots.txt', 'text/plain'],
  ['/site/sitemap.xml', 'text/xml'],
  ['/site/images/primeira-foto.jpg', 'image/jpeg'],
  ['/site/images/bruna-profissional.jpg', 'image/jpeg'],
]);

async function fixture(t, override = new Map()) {
  const requests = [];
  const server = createServer((request, response) => {
    const path = request.url;
    requests.push(path);
    let body = '';
    if (override.has(path)) {
      const { status = 200, headers, body: payload = '' } = override.get(path);
      body = payload;
      response.writeHead(status, headers);
    } else if (contentTypes.has(path)) {
      body = 'resource fixture';
      response.writeHead(200, { 'Content-Type': `${contentTypes.get(path).toUpperCase()}; charset=utf-8` });
    } else {
      response.writeHead(404);
    }
    response.end(body);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return { base: `http://127.0.0.1:${server.address().port}/site/`, requests };
}

test('smoke aceita os tipos esperados com variação de caixa e charset', async (t) => {
  const { base } = await fixture(t);
  const { stdout } = await runSmoke(base);
  assert.match(stdout, /Resultado: 16\/16/);
});

test('smoke rejeita Content-Type com substring enganosa', async (t) => {
  const { base } = await fixture(t, new Map([
    ['/site/css/style.css', { headers: { 'Content-Type': 'text/css-malformado' } }],
    ['/site/js/main.js', { headers: { 'Content-Type': 'application/notjavascript' } }],
  ]));
  await assert.rejects(runSmoke(base), ({ code, stdout }) => {
    assert.equal(code, 1);
    assert.match(stdout, /FAIL CSS: 200 text\/css-malformado/);
    assert.match(stdout, /FAIL JS principal: 200 application\/notjavascript/);
    return true;
  });
});

test('smoke rejeita recurso vazio com status 200 e Content-Type correto', async (t) => {
  const { base } = await fixture(t, new Map([
    ['/site/css/style.css', { headers: { 'Content-Type': 'text/css', 'Content-Length': '0' } }],
    ['/site/js/main.js', { headers: { 'Content-Type': 'application/javascript', 'Transfer-Encoding': 'chunked' } }],
  ]));
  await assert.rejects(runSmoke(base), ({ code, stdout }) => {
    assert.equal(code, 1);
    assert.match(stdout, /FAIL CSS: 200 text\/css .* corpo vazio/);
    assert.match(stdout, /FAIL JS principal: 200 application\/javascript .* corpo vazio/);
    assert.match(stdout, /Resultado: 14\/16/);
    return true;
  });
});

test('smoke registra 302 e não segue o redirecionamento', async (t) => {
  const { base, requests } = await fixture(t, new Map([
    ['/site/js/map.js', { status: 302, headers: { Location: './main.js' } }],
  ]));
  await assert.rejects(runSmoke(base), ({ code, stdout }) => {
    assert.equal(code, 1);
    assert.match(stdout, /FAIL JS mapa: 302/);
    return true;
  });
  assert.equal(requests.filter((path) => path === '/site/js/main.js').length, 1);
});

test('smoke rejeita URL com dados de autenticação antes de registrar ou requisitar', async (t) => {
  const { base, requests } = await fixture(t);
  const url = new URL(base);
  url.username = 'usuario_ficticio';
  url.password = 'senha_ficticia';
  url.search = '?token=token_ficticio';
  for (const input of [url.href, url.href.replace(/:\d+\//, ':invalida/')]) {
    await assert.rejects(runSmoke(input), ({ code, stdout, stderr }) => {
      assert.equal(code, 1);
      assert.doesNotMatch(stdout + stderr, /(?:usuario|senha|token)_fictici[oa]/);
      return true;
    });
  }
  assert.equal(requests.length, 0);
});


test('smoke reprova release com qualquer recurso obrigatório retornando 404', async (t) => {
  const { base } = await fixture(t, new Map([
    ['/site/images/primeira-foto.jpg', { status: 404 }],
  ]));
  await assert.rejects(runSmoke(base), ({ code, stdout }) => {
    assert.equal(code, 1);
    assert.match(stdout, /FAIL imagem social: 404/);
    assert.match(stdout, /Resultado: 15\/16/);
    return true;
  });
});

test('smoke reprova release se um módulo importado não estiver publicado', async (t) => {
  const { base } = await fixture(t, new Map([
    ['/site/js/faq/index.js', { status: 404 }],
  ]));
  await assert.rejects(runSmoke(base), ({ code, stdout }) => {
    assert.equal(code, 1);
    assert.match(stdout, /FAIL JS perguntas frequentes: 404/);
    assert.match(stdout, /Resultado: 15\/16/);
    return true;
  });
});


test('workflow de produção aceita deploy do Pages, execução manual e agendamento', () => {
  const yaml = readFileSync(new URL('../.github/workflows/production-smoke.yml', import.meta.url), 'utf8');
  assert.match(yaml, /on:\s*\n\s*workflow_dispatch:/);
  assert.match(yaml, /schedule:\s*\n\s*- cron: '17 12 \* \* \*'/);
  assert.match(yaml, /\n  deployment_status:/);
  assert.match(yaml, /github\.event\.deployment_status\.state == 'success'\s*&&/);
  assert.match(yaml, /github\.event\.deployment_status\.environment == 'github-pages'\s*&&/);
  assert.match(yaml, /github\.event\.deployment\.ref == 'master'/);
  assert.match(yaml, /github\.event\.deployment\.sha/);
  assert.match(yaml, /--published-sha "\$DEPLOYMENT_SHA"/);
  assert.match(yaml, /permissions:\s*\n\s*contents: read/);
  assert.match(yaml, /set -o pipefail/);
  assert.match(yaml, /node scripts\/smoke-public\.mjs/);
});
