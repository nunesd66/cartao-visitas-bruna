import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const checker = fileURLToPath(new URL('./check-local-assets.mjs', import.meta.url));

function fixture(t, { html, css = '', scss = '', assets = [] }) {
  const root = mkdtempSync(path.join(tmpdir(), 'bruna-asset-check-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'css'));
  writeFileSync(path.join(root, 'index.html'), html);
  writeFileSync(path.join(root, 'css/style.css'), css);
  writeFileSync(path.join(root, 'css/style.scss'), scss);
  for (const asset of assets) {
    const location = path.join(root, asset);
    mkdirSync(path.dirname(location), { recursive: true });
    writeFileSync(location, 'fixture');
  }
  return root;
}

function check(root) {
  return spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8', timeout: 5000 });
}

test('assets locais existentes e links externos são aceitos', (t) => {
  const root = fixture(t, {
    html: '<img src="images/foto.jpg"><a href="#contato">Contato</a><a href="https://example.com">Externo</a><link href="css/style.css">',
    css: 'body { background: url("../images/foto.jpg"); }',
    scss: '$image: url("../images/foto.jpg");',
    assets: ['images/foto.jpg'],
  });
  const result = check(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /All local HTML, CSS and SCSS asset references resolve/);
});

test('assets ausentes são informados com referência e saída diferente de zero', (t) => {
  const root = fixture(t, {
    html: '<img src="images/inexistente.jpg">',
    css: 'body { background: url("../images/outro.jpg"); }',
  });
  const result = check(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /images\/inexistente\.jpg/);
  assert.match(result.stderr, /images\/outro\.jpg/);
  assert.match(result.stderr, /file does not exist/);
});

test('referências que saem do diretório do projeto são recusadas', (t) => {
  const root = fixture(t, { html: '<a href="../fora-do-projeto.html">fora</a>' });
  const result = check(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /path escapes the project root/);
});

test('caminhos com query e fragmento resolvem o arquivo local', (t) => {
  const root = fixture(t, {
    html: '<script src="js/app.js?v=3#hash"></script>',
    assets: ['js/app.js'],
  });
  const result = check(root);
  assert.equal(result.status, 0, result.stderr);
});
