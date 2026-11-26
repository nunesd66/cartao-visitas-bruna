import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const checker = fileURLToPath(new URL('./check-local-assets.mjs', import.meta.url));
function fixture(t, reference) {
  const root = mkdtempSync(path.join(tmpdir(), 'bruna-asset-case-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'css'));
  mkdirSync(path.join(root, 'images'));
  mkdirSync(path.join(root, 'src'));
  writeFileSync(path.join(root, 'index.html'), '<img src="' + reference + '">');
  writeFileSync(path.join(root, 'css/style.css'), '');
  return root;
}
const run = (root) => spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8' });

test('asset com grafia exata passa e referência com caixa divergente falha', (t) => {
  const root = fixture(t, 'images/Foto.jpg');
  writeFileSync(path.join(root, 'images/Foto.jpg'), 'image');
  assert.equal(run(root).status, 0);
  writeFileSync(path.join(root, 'index.html'), '<img src="images/foto.jpg">');
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /file does not exist \(or its case differs\)/);
});

test('symlink para fora do projeto não é aceito como asset local', (t) => {
  const root = fixture(t, 'images/externa.jpg');
  const outside = mkdtempSync(path.join(tmpdir(), 'bruna-outside-'));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  writeFileSync(path.join(outside, 'externa.jpg'), 'fixture');
  symlinkSync(path.join(outside, 'externa.jpg'), path.join(root, 'images/externa.jpg'));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /asset symlink escapes the project root/);
});
