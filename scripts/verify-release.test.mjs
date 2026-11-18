import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const source = fileURLToPath(new URL('./verify-release.mjs', import.meta.url));

async function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'bruna-release-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'scripts'));
  mkdirSync(path.join(root, 'css'));
  mkdirSync(path.join(root, 'js'));
  mkdirSync(path.join(root, 'images'));
  writeFileSync(path.join(root, 'scripts/verify-release.mjs'), await import('node:fs/promises').then(fs => fs.readFile(source)));
  writeFileSync(path.join(root, 'package.json'), '{"type":"module"}');
  const expected = new Map([
    ['/site/', 'published html'],
    ['/site/css/style.css', 'body{}'],
    ['/site/js/main.js', 'void 0;'],
    ['/site/images/hero.jpg', 'image fixture'],
    ['/site/robots.txt', 'User-agent: *'],
    ['/site/sitemap.xml', '<urlset/>'],
  ]);
  for (const [url, body] of expected) {
    const local = url === '/site/' ? 'index.html' : url.replace(/^\/site\//, '');
    writeFileSync(path.join(root, local), body);
  }
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' }).toString().trim();
  git('init', '-q');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('add', '.');
  git('commit', '-qm', 'fixture');
  const sha = git('rev-parse', 'HEAD');
  const responses = new Map(expected);
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request.url);
    const body = responses.get(request.url);
    if (body === undefined) { response.writeHead(404); response.end(); return; }
    response.writeHead(200);
    response.end(body);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  return {
    root, sha, responses, requests,
    base: 'http://127.0.0.1:' + server.address().port + '/site/',
  };
}

const execFileAsync = promisify(execFile);
async function run(root, sha, url) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, ['scripts/verify-release.mjs', sha, url], { cwd: root, encoding: 'utf8', timeout: 15000 });
    return { status: 0, stdout, stderr };
  } catch (error) {
    return { status: error.code, stdout: error.stdout || '', stderr: error.stderr || '' };
  }
}

test('verificação detecta diferenças de bytes e não confunde HTTP 200 com igualdade', async (t) => {
  const f = await fixture(t);
  const success = await run(f.root, f.sha, f.base);
  assert.equal(success.status, 0, success.stderr);
  assert.match(success.stdout, /6\/6 arquivos iguais/);
  f.responses.set('/site/js/main.js', 'different content');
  const failure = await run(f.root, f.sha, f.base);
  assert.equal(failure.status, 1);
  assert.match(failure.stdout, /FAIL js\/main\.js.*conteúdo diverge/);
});

test('verificação rejeita bases inseguras e malformadas antes de registrar ou fazer requisições', async (t) => {
  const f = await fixture(t);
  const protectedBase = new URL(f.base);
  protectedBase.username = 'usuario-ficticio';
  protectedBase.password = 'senha-ficticia';
  const validationError = /sem parâmetros, fragmento ou credenciais/;
  const inputs = [
    [f.base + '?token=token-ficticio', validationError],
    [f.base + '#token-ficticio', validationError],
    [protectedBase.href, validationError],
    [protectedBase.href.replace(/:\d+\//, ':invalida/'), /URL base válida/],
  ];

  for (const [address, expectedError] of inputs) {
    const invalid = await run(f.root, f.sha, address);
    assert.equal(invalid.status, 1);
    assert.doesNotMatch(invalid.stdout + invalid.stderr, /(?:usuario|senha|token)-fictici[oa]/);
    assert.match(invalid.stderr, expectedError);
  }
  assert.equal(f.requests.length, 0);
});
