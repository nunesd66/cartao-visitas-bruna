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


test('controles dependentes de JavaScript ficam ocultos no HTML inicial', () => {
  assert.match(html, /<button\b[^>]*\bdata-header-pin\b[^>]*\shidden(?:\s|>)/);
  assert.match(html, /<details class="accessibility-tools" hidden>/);
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

test('tokens de texto mantêm contraste WCAG AA sobre superfícies padrão', () => {
  const scss = readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../css/style.scss'), 'utf8');
  const palette = Object.fromEntries([...scss.matchAll(/\$(color-[\w-]+):\s*(#[0-9a-f]{6});/gi)]
    .map(([, name, color]) => [name, color]));
  const luminance = (color) => {
    const channels = [1, 3, 5].map((position) => parseInt(color.slice(position, position + 2), 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const foreground of ['color-text', 'color-text-muted']) {
    for (const background of ['color-bg', 'color-surface', 'color-surface-soft']) {
      assert.ok(palette[foreground] && palette[background], 'token de cor ausente');
      const light = Math.max(luminance(palette[foreground]), luminance(palette[background]));
      const dark = Math.min(luminance(palette[foreground]), luminance(palette[background]));
      const ratio = (light + 0.05) / (dark + 0.05);
      assert.ok(ratio >= 4.5, foreground + ' sobre ' + background + ': contraste ' + ratio.toFixed(2) + ' < 4.5');
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
