import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name), 'utf8');
const html = read('index.html');
const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => tag);
const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
    .map(([, key, value]) => [key.toLowerCase(), value]),
);

test('scripts locais necessários preservam ordem de execução e não usam async', () => {
  const local = scripts
    .map(attributes)
    .filter((attrs) => /^js\/(analytics|privacy|main|map)\.js$/.test(attrs.src || ''));
  const sources = local.map((attrs) => attrs.src);
  for (const required of ['js/analytics.js', 'js/privacy.js', 'js/main.js']) {
    assert.equal(sources.filter((source) => source === required).length, 1, required);
  }
  assert.ok(sources.indexOf('js/analytics.js') < sources.indexOf('js/privacy.js'));
  assert.ok(sources.indexOf('js/privacy.js') < sources.indexOf('js/main.js'));
  for (const attrs of local) {
    assert.ok(Object.hasOwn(attrs, 'defer'), 'script sem defer: ' + attrs.src);
    assert.ok(!Object.hasOwn(attrs, 'async'), 'script async pode romper ordem: ' + attrs.src);
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
