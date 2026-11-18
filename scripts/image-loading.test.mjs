import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(([tag]) => {
  const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
    .map(([, name, value]) => [name.toLowerCase(), value]));
  return { attrs, tag };
});

test('imagens possuem dimensões explícitas para reduzir mudanças de layout', () => {
  assert.ok(images.length > 0, 'Nenhuma imagem HTML encontrada');
  for (const { attrs } of images) {
    assert.ok(attrs.src, 'Imagem sem src');
    for (const dimension of ['width', 'height']) {
      assert.match(attrs[dimension] || '', /^[1-9]\d*$/, attrs.src + ' sem ' + dimension + ' válido');
    }
    assert.ok(Number.isSafeInteger(Number(attrs.width)) && Number.isSafeInteger(Number(attrs.height)),
      'Dimensão fora da faixa segura: ' + attrs.src);
  }
});

test('imagem principal é prioritária e imagens secundárias carregam sob demanda', () => {
  const hero = images.filter(({ attrs }) => attrs.src === 'images/primeira-foto.jpg');
  assert.equal(hero.length, 1, 'Imagem principal duplicada ou ausente');
  assert.equal(hero[0].attrs.fetchpriority, 'high');
  assert.notEqual(hero[0].attrs.loading, 'lazy', 'Imagem principal não deve ser lazy-loaded');
  for (const { attrs } of images) {
    assert.equal(attrs.decoding, 'async', 'Imagem sem decodificação assíncrona: ' + attrs.src);
    if (attrs.src === 'images/primeira-foto.jpg') continue;
    assert.equal(attrs.loading, 'lazy', 'Imagem secundária não usa lazy loading: ' + attrs.src);
    assert.notEqual(attrs.fetchpriority, 'high', 'Imagem secundária priorizada indevidamente: ' + attrs.src);
  }
});
