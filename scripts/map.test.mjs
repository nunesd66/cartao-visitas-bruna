import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/map.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function setup(mapUrl = 'https://maps.google.com/maps?q=Coromandel&output=embed') {
  let onClick;
  let removed = false;
  const iframe = { dataset: { mapSrc: mapUrl } };
  const button = {
    addEventListener(type, callback) {
      if (type === 'click') onClick = callback;
    },
    closest(selector) {
      return selector === '.map-embed' ? { querySelector: () => iframe } : null;
    },
    remove() { removed = true; },
  };
  const document = { querySelectorAll: () => [button] };
  vm.runInNewContext(source, { document });
  return { iframe, click: () => onClick(), removed: () => removed };
}

test('mapa nao faz solicitacao a terceiros antes da interacao', () => {
  assert.match(html, /data-map-src="https:\/\/maps\.google\.com\/maps\?/);
  assert.doesNotMatch(html, /<iframe[^>]+\ssrc="https:\/\/maps\.google\.com/s);
  const map = setup();
  assert.equal(map.iframe.src, undefined);
  assert.equal(map.removed(), false);
});

test('mapa e carregado apenas apos clique explicito', () => {
  const map = setup();
  map.click();
  assert.equal(map.iframe.src, 'https://maps.google.com/maps?q=Coromandel&output=embed');
  assert.equal(map.removed(), true);
});

test('mapa nao aceita URL arbitraria como origem', () => {
  const map = setup('https://attacker.example/tracker');
  map.click();
  assert.equal(map.iframe.src, undefined);
  assert.equal(map.removed(), false);
});
