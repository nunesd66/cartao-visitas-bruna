import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const mapSource = read('js/map.js');
const analyticsSource = read('js/analytics.js');
const privacySource = read('js/privacy.js');

test('nenhum script remoto de analytics carrega diretamente pelo HTML', () => {
  const scriptTags = [...html.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  assert.ok(scriptTags.length > 0);
  for (const tag of scriptTags) {
    const src = tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (src) assert.ok(!/^https?:\/\//i.test(src), `script externo não aprovado: ${src}`);
  }
  assert.match(html, /<script\s+type="module"\s+src="js\/main\.js"><\/script>/);
  assert.match(analyticsSource, /!consentGranted\s*\|\|\s*!measurementId/);
  assert.match(privacySource, /analytics\?\.setConsent\(false\)/);
});

test('iframe do Maps não dispara solicitação antes de interação explícita', () => {
  const frames = [...html.matchAll(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi)];
  assert.ok(frames.length > 0, 'iframe esperado não encontrado');
  for (const [frame] of frames) {
    assert.doesNotMatch(frame, /\ssrc\s*=\s*["']https?:\/\//i, 'iframe remoto imediato');
  }
  assert.match(html, /data-map-src="https:\/\/www\.google\.com\/maps\/embed\?pb=/);
  assert.match(html, /data-map-load/);
  assert.match(html, /referrerpolicy="no-referrer"/);
  assert.match(mapSource, /button\.addEventListener\('click'/);
  assert.match(html, /href="https:\/\/maps\.app\.goo\.gl\//);
});

test('meta de identificação GA4 é configuração, não autorização de coleta', () => {
  assert.match(html, /<meta\s+name="ga4-measurement-id"/);
  assert.doesNotMatch(html, /<script[^>]+src="https:\/\/www\.googletagmanager\.com/i);
  assert.match(analyticsSource, /'consent', 'default'/);
  assert.match(analyticsSource, /analytics_storage:\s*'denied'/);
});
