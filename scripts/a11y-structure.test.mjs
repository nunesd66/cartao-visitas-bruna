import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const html = readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../index.html'), 'utf8');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((m) => [m[1].toLowerCase(), m[2]]));

test('estrutura semântica básica e navegação interna consistente', () => {
  assert.match(html, /<html\s+lang="pt-BR"/);
  assert.match(html, /<main\b/);
  assert.match(html, /<nav\b/);
  assert.match(html, /<h1\b/);
  assert.match(html, /<a\s+class="skip-link"\s+href="#conteudo"/);
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'IDs duplicados prejudicam navegação e leitores de tela');
  const targets = new Set(ids);
  const anchors = [...html.matchAll(/\shref=["']#([^"']+)["']/g)].map((m) => m[1]);
  for (const target of anchors) assert.ok(targets.has(target), `âncora sem destino: #${target}`);
  assert.ok(targets.has('conteudo'), 'skip link sem destino');
});

test('imagens informativas devem ter alt explícito', () => {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  assert.ok(images.length > 0);
  for (const image of images) {
    const a = attrs(image);
    assert.ok(Object.hasOwn(a, 'alt'), `imagem sem alt: ${image.slice(0, 100)}`);
    assert.ok(a.alt.trim() || a['aria-hidden'] === 'true' || a.role === 'presentation', `alt vazio sem marca decorativa: ${image.slice(0, 100)}`);
  }
});

test('links em nova aba usam noopener e noreferrer', () => {
  const links = [...html.matchAll(/<a\b[^>]*>/gi)].map((m) => m[0]);
  assert.ok(links.length > 0);
  for (const link of links) {
    const a = attrs(link);
    if (a.target !== '_blank') continue;
    const rel = new Set((a.rel || '').split(/\s+/));
    assert.ok(rel.has('noopener') && rel.has('noreferrer'), `link externo sem proteção: ${link.slice(0, 150)}`);
  }
});

test('componentes de privacidade e carrossel possuem controles nomeados', () => {
  assert.match(html, /data-privacy-choice="accepted"/);
  assert.match(html, /data-privacy-choice="rejected"/);
  assert.match(html, /data-carousel-prev/);
  assert.match(html, /data-carousel-next/);
  assert.match(html, /data-carousel-rotation/);
  assert.match(html, /data-carousel-status/);
});


test('referências ARIA e associações de labels apontam para IDs existentes', () => {
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(([, id]) => id));
  const references = ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for'];
  for (const attribute of references) {
    const matcher = new RegExp('\\b' + attribute + '=["\\x27]([^"\\x27]+)["\\x27]', 'gi');
    for (const [, rawValue] of html.matchAll(matcher)) {
      for (const id of rawValue.trim().split(/\s+/)) {
        assert.ok(ids.has(id), attribute + ' referencia ID inexistente: ' + id);
      }
    }
  }
});

test('hierarquia de títulos mantém um H1 e não salta níveis', () => {
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map(([, level]) => Number(level));
  assert.ok(headings.length >= 2, 'página sem hierarquia de títulos');
  assert.equal(headings.filter((level) => level === 1).length, 1, 'esperado exatamente um H1');
  assert.equal(headings[0], 1, 'H1 deve iniciar a hierarquia');
  for (let i = 1; i < headings.length; i++) {
    assert.ok(headings[i] <= headings[i - 1] + 1, 'salto de nível entre títulos');
  }
});
