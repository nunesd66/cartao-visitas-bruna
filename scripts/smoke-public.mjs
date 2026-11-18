#!/usr/bin/env node
// Executar após publicação: node scripts/smoke-public.mjs [base-url]
import assert from 'node:assert/strict';

const base = new URL(process.argv[2] || 'https://nunesd66.github.io/cartao-visitas-bruna/');
if (base.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(base.hostname)) {
  throw new Error('Somente HTTPS ou localhost são permitidos');
}
if (!base.pathname.endsWith('/')) base.pathname += '/';
const resources = [
  ['HTML', './', 'text/html'],
  ['CSS', 'css/style.css', 'text/css'],
  ['JS principal', 'js/main.js', 'javascript'],
  ['JS analytics', 'js/analytics.js', 'javascript'],
  ['JS privacidade', 'js/privacy.js', 'javascript'],
  ['JS mapa', 'js/map.js', 'javascript'],
  ['robots', 'robots.txt', 'text/plain'],
  ['sitemap', 'sitemap.xml', 'xml'],
];

const results = [];
for (const [name, relative, mime] of resources) {
  const url = new URL(relative, base);
  const started = Date.now();
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(12000) });
    const type = response.headers.get('content-type') || '';
    const ok = response.status === 200 && type.toLowerCase().includes(mime);
    results.push({ name, url: url.href, status: response.status, contentType: type, ms: Date.now() - started, ok });
  } catch (error) {
    results.push({ name, url: url.href, status: 'ERROR', contentType: '', ms: Date.now() - started, ok: false, error: String(error) });
  }
}
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}: ${r.status} ${r.contentType} ${r.ms}ms ${r.url}${r.error ? ' '+r.error : ''}`);
}
console.log(`Resultado: ${results.filter((r) => r.ok).length}/${results.length}; SHA testado: ${process.env.GITHUB_SHA || 'informar manualmente'}`);
assert.ok(results.every((r) => r.ok), 'Smoke público falhou; investigar antes de homologar');
