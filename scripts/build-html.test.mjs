import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { renderHtml } from './build-html.mjs';

const committedHtml = new URL('../index.html', import.meta.url);

function fixture(t, files) {
  const directory = mkdtempSync(join(tmpdir(), 'build-html-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    const path = join(directory, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  return directory;
}

test('fragmentos do site reproduzem os bytes do index.html versionado', () => {
  assert.deepEqual(Buffer.from(renderHtml()), readFileSync(committedHtml));
});

test('inclui fragmentos aninhados sem alterar indentação ou quebras de linha', (t) => {
  const directory = fixture(t, {
    'index.html': '<body>\r\n  <!-- include: sections/footer/footer.html -->\r\n</body>\r\n',
    'sections/footer/footer.html': '  <footer>\r\n    <!-- include: components/privacy/footer-toggle.html -->\r\n  </footer>\r\n',
    'components/privacy/footer-toggle.html': '    <button>Privacidade</button>\r\n',
  });
  assert.equal(renderHtml(directory), '<body>\r\n  <footer>\r\n    <button>Privacidade</button>\r\n  </footer>\r\n</body>\r\n');
});

test('rejeita inclusão inválida, ausente ou circular', (t) => {
  const directory = fixture(t, {
    'components/privacy/privacy.html': '<!-- include: components/links/links.html -->\n',
    'components/links/links.html': '<!-- include: components/privacy/privacy.html -->\n',
  });
  const entry = join(directory, 'index.html');

  writeFileSync(entry, '<!-- include: ../private.html -->\n');
  assert.throws(() => renderHtml(directory), /Fragmento HTML inválido em index\.html/);

  writeFileSync(entry, '<!-- include: sections/missing/missing.html -->\n');
  assert.throws(() => renderHtml(directory), { code: 'ENOENT' });

  writeFileSync(entry, '<!-- include: components/privacy/privacy.html -->\n');
  assert.throws(() => renderHtml(directory), /Inclusão HTML circular/);
});

test('CLI aceita caminho de saída relativo ao diretório de execução', (t) => {
  const directory = fixture(t, {});
  const script = fileURLToPath(new URL('./build-html.mjs', import.meta.url));

  execFileSync(process.execPath, [script, 'dist/index.html'], { cwd: directory });

  assert.deepEqual(readFileSync(join(directory, 'dist', 'index.html')), readFileSync(committedHtml));
});
