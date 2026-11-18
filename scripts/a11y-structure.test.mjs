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


test('links navegáveis usam somente protocolos e destinos esperados', () => {
  const links = [...html.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => attrs(tag));
  assert.ok(links.length > 0);
  for (const link of links) {
    assert.ok(link.href, 'link sem href');
    const href = link.href.trim();
    if (href.startsWith('#')) {
      assert.ok(href.length > 1, 'âncora vazia');
      continue;
    }
    const url = new URL(href);
    assert.ok(['https:', 'tel:'].includes(url.protocol), 'protocolo inseguro: ' + url.protocol);
    if (url.protocol === 'https:') assert.ok(url.hostname, 'URL HTTPS sem domínio');
    if (url.protocol === 'tel:') assert.match(url.pathname, /^\+\d{10,15}$/, 'número de telefone inválido');
  }
});
