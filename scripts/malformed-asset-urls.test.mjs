import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const checker = fileURLToPath(new URL('./check-local-assets.mjs', import.meta.url));

test('checker reports malformed encoded asset URL and continues checking remaining assets', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'bruna-invalid-url-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'css'));
  writeFileSync(path.join(root, 'index.html'),
    '<img src="images/%E0%A4%A"><img src="images/missing.jpg">');
  writeFileSync(path.join(root, 'css/style.css'), '');
  writeFileSync(path.join(root, 'css/style.scss'), '');
  const result = spawnSync(process.execPath, [checker], {
    cwd: root,
    encoding: 'utf8',
    timeout: 5000,
  });

  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /invalid percent-encoding in local asset URL/);
  assert.match(result.stderr, /images\/missing\.jpg.*file does not exist/);
  assert.doesNotMatch(result.stderr, /URIError|URI malformed/);
});
