#!/usr/bin/env node
// Executar após publicação: node scripts/smoke-public.mjs [base-url] [--published-sha SHA]
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { 'published-sha': { type: 'string' } },
});
const publishedSha = values['published-sha'];
assert.ok(positionals.length <= 1, 'Informe no máximo uma URL');
if (publishedSha !== undefined) {
  assert.match(publishedSha, /^[a-f0-9]{40}$/i, 'Informe o SHA completo do deploy');
}

let base;
try {
  base = new URL(positionals[0] || 'https://nunesd66.github.io/cartao-visitas-bruna/');
} catch {
  throw new Error('Informe uma URL base válida');
}
if (base.username || base.password || base.search || base.hash) {
  throw new Error('Informe a URL base sem credenciais, parâmetros ou fragmento');
}
const isLocalHttp = base.protocol === 'http:' &&
  ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
if (base.protocol !== 'https:' && !isLocalHttp) {
  throw new Error('Use HTTPS ou HTTP em localhost');
}
if (!base.pathname.endsWith('/')) base.pathname += '/';
const javascriptTypes = ['text/javascript', 'application/javascript', 'application/x-javascript'];
const resources = [
  ['HTML', './', ['text/html']],
  ['CSS', 'css/style.css', ['text/css']],
  ['JS principal', 'js/main.js', javascriptTypes],
  ['JS analytics', 'js/analytics.js', javascriptTypes],
  ['JS privacidade', 'js/privacy.js', javascriptTypes],
  ['JS mapa', 'js/map.js', javascriptTypes],
  ['JS atalhos e acessibilidade', 'js/accessibility/index.js', javascriptTypes],
  ['JS carrossel', 'js/carousel/index.js', javascriptTypes],
  ['JS perguntas frequentes', 'js/faq/index.js', javascriptTypes],
  ['JS cabeçalho', 'js/header/index.js', javascriptTypes],
  ['JS parallax', 'js/parallax/index.js', javascriptTypes],
  ['JS formulário do WhatsApp', 'js/whatsapp/index.js', javascriptTypes],
  ['robots', 'robots.txt', ['text/plain']],
  ['sitemap', 'sitemap.xml', ['application/xml', 'text/xml']],
  ['imagem social', 'images/primeira-foto.jpg', ['image/jpeg']],
  ['foto de apresentação', 'images/bruna-profissional.jpg', ['image/jpeg']],
];

console.log(`Data UTC: ${new Date().toISOString()}`);
console.log(`Ambiente: ${base.href}`);
console.log(`SHA publicado informado: ${publishedSha ?? 'não informado'}`);

const results = [];
for (const [name, relative, mediaTypes] of resources) {
  const url = new URL(relative, base);
  const started = Date.now();
  try {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(12000) });
    const type = response.headers.get('content-type') || '';
    const mediaType = type.split(';', 1)[0].trim().toLowerCase();
    const expectedResponse = response.status === 200 && mediaTypes.includes(mediaType);
    let error;
    if (expectedResponse) {
      const reader = response.body?.getReader();
      try {
        const chunk = await reader?.read();
        if (!chunk?.value?.byteLength) error = 'corpo vazio';
      } finally {
        await reader?.cancel();
      }
    } else {
      await response.body?.cancel();
    }
    const ok = expectedResponse && !error;
    results.push({ name, url: url.href, status: response.status, contentType: type, ms: Date.now() - started, ok, error });
  } catch (error) {
    results.push({ name, url: url.href, status: 'ERROR', contentType: '', ms: Date.now() - started, ok: false, error: String(error) });
  }
}
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}: ${r.status} ${r.contentType} ${r.ms}ms ${r.url}${r.error ? ' '+r.error : ''}`);
}
console.log(`Resultado: ${results.filter((r) => r.ok).length}/${results.length}`);
assert.ok(results.every((r) => r.ok), 'Smoke público falhou; investigar antes de homologar');
