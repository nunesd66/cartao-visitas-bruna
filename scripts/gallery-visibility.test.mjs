import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const services = html.match(/<section class="section services"[\s\S]*?<\/section>/)?.[0];

test('fotos de serviços preservam o texto alternativo e compartilham a mesma marca d’água', () => {
  assert.ok(services);
  const photos = [...services.matchAll(/<div class="service-card__photo"(?: data-inactive)?>([\s\S]*?)<\/div>/g)];
  assert.equal(photos.length, 6);
  for (const [, photo] of photos) {
    assert.match(photo, /<img\b[^>]*\balt="[^"]+"/);
    assert.match(photo, /class="photo-watermark" aria-hidden="true">@abrunasobrancelhas<\/span>/);
  }
});

test('galerias de serviços trocam fotos sem controles manuais nem rolagem', () => {
  assert.ok(services);
  const galleries = [...services.matchAll(/<div class="service-card__gallery"[^>]*>/g)];
  assert.equal(galleries.length, 2);
  for (const [gallery] of galleries) {
    assert.doesNotMatch(gallery, /tabindex=/);
    assert.match(gallery, /aria-label="[^"]+"/);
  }
  assert.doesNotMatch(services, /data-image-rotator|data-gallery-next|data-gallery-toggle|aria-hidden="true"[^>]*alt=/);
  assert.match(css, /\.service-card__gallery\s*\{[^}]*overflow:\s*clip/);
});
