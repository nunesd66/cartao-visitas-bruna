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

test('galerias servem WebP mais leve e preservam os JPEG originais como fallback', () => {
  const pairs = [
    ['2.JPG', '2-1200.webp'],
    ['IMG_3113.JPG', 'IMG_3113-1200.webp'],
    ['IMG_3114.JPG', 'IMG_3114-1200.webp'],
  ];
  const pictures = [...html.matchAll(/<picture>\s*([\s\S]*?)<\/picture>/g)].map(([, content]) => content);
  const photo = (name) => readFileSync(new URL('../images/' + name, import.meta.url));
  for (const [original, derivative] of pairs) {
    const expectedSource = `<source srcset="images/${derivative}" type="image/webp">`;
    const picture = pictures.find((content) => content.includes(expectedSource));
    assert.ok(picture?.includes(`<img src="images/${original}"`), 'Fallback JPEG ausente: ' + original);

    const optimized = photo(derivative);
    assert.equal(optimized.toString('ascii', 0, 4), 'RIFF');
    assert.equal(optimized.toString('ascii', 8, 12), 'WEBP');
    assert.ok(optimized.length < photo(original).length, 'WebP deve ser menor que o JPEG');
  }
});
