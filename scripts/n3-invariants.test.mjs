import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { initializeSite } from '../js/main.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name), 'utf8');
const html = read('index.html');
const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => tag);
const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
    .map(([, key, value]) => [key.toLowerCase(), value]),
);

test('HTML carrega um único módulo inicializador, com execução após a leitura do documento', () => {
  const withSource = scripts.filter((tag) => attributes(tag).src);
  assert.equal(withSource.length, 1);
  assert.deepEqual(attributes(withSource[0]), { type: 'module', src: 'js/main.js' });
  assert.doesNotMatch(withSource[0], /\sasync(?:\s|=|>)/i);
});

test('inicializador restaura a escolha antes de permitir coleta do GA4', () => {
  for (const choice of [null, 'rejected', 'accepted']) {
    const scripts = [];
    const button = { addEventListener() {} };
    const toggle = { addEventListener() {}, setAttribute() {} };
    const panel = {
      addEventListener() {},
      querySelector: () => button,
      contains: () => false,
      classList: { remove() {} },
    };
    const document = {
      head: { appendChild(script) { scripts.push(script); } },
      activeElement: null,
      cookie: '',
      addEventListener() {},
      createElement: () => ({}),
      querySelector(selector) {
        if (selector === '[data-privacy-panel]') return panel;
        if (selector === 'meta[name="ga4-measurement-id"]') return { content: 'G-TEST123456' };
        return null;
      },
      querySelectorAll: (selector) => selector === '[data-privacy-toggle]' ? [toggle] : [],
    };
    const window = {
      document,
      localStorage: { getItem: () => choice },
      location: { origin: 'https://example.test', pathname: '/' },
      navigator: { maxTouchPoints: 0 },
      matchMedia: () => ({ matches: false }),
      addEventListener() {},
    };

    initializeSite(window);

    const accepted = choice === 'accepted';
    assert.equal(scripts.length, accepted ? 1 : 0);
    assert.equal(window.BrunaAnalytics.isEnabled(), accepted);
    assert.equal(panel.hidden, choice !== null);
  }
});

test('GA4 utiliza apenas meta configurada e script dinâmico condicionado a consentimento', () => {
  const ids = [...html.matchAll(/<meta\s+name="ga4-measurement-id"\s+content="([^"]+)"\s*\/?\s*>/gi)];
  assert.equal(ids.length, 1);
  assert.match(ids[0][1], /^G-[A-Z0-9]{6,}$/);
  const analytics = read('js/analytics.js');
  assert.match(analytics, /!consentGranted\s*\|\|\s*!measurementId/);
  assert.match(analytics, /send_page_view:\s*false/);
  assert.match(analytics, /allow_google_signals:\s*false/);
  assert.match(analytics, /allow_ad_personalization_signals:\s*false/);
  assert.doesNotMatch(html, /<script\b[^>]*src=["']https?:\/\//i);
});
