import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/map.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function setup(mapUrl = 'https://maps.google.com/maps?q=Coromandel&output=embed', { keyboard = false } = {}) {
  let onClick;
  let removed = false;
  const frameAttributes = new Map([['tabindex', '-1']]);
  const iframe = {
    dataset: { mapSrc: mapUrl },
    removeAttribute(name) { frameAttributes.delete(name); },
    focus() { document.activeElement = iframe; },
  };
  const button = {
    addEventListener(type, callback) {
      if (type === 'click') onClick = callback;
    },
    closest(selector) {
      return selector === '.map-embed' ? { querySelector: () => iframe } : null;
    },
    remove() { removed = true; },
  };
  const document = { querySelectorAll: () => [button], activeElement: keyboard ? button : null };
  vm.runInNewContext(source, { document });
  return { iframe, frameAttributes, document, click: () => onClick(), removed: () => removed };
}

test('mapa nao faz solicitacao a terceiros antes da interacao', () => {
  const mapFrame = html.match(/<iframe(?=[^>]+\bdata-map-src=)[^>]+>/)?.[0];
  assert.ok(mapFrame, 'iframe do mapa presente');
  assert.match(mapFrame, /data-map-src="https:\/\/maps\.google\.com\/maps\?/);
  assert.match(mapFrame, /\stabindex="-1"/);
  assert.doesNotMatch(mapFrame, /\ssrc=/);
  const map = setup();
  assert.equal(map.iframe.src, undefined);
  assert.equal(map.removed(), false);
});

test('mapa e carregado apenas apos clique explicito', () => {
  const map = setup();
  map.click();
  assert.equal(map.iframe.src, 'https://maps.google.com/maps?q=Coromandel&output=embed');
  assert.equal(map.removed(), true);
  assert.equal(map.frameAttributes.has('tabindex'), false);
  assert.equal(map.document.activeElement, null);
});

test('mapa recebe o foco quando o botão de carregar estava focado', () => {
  const map = setup(undefined, { keyboard: true });
  map.click();
  assert.equal(map.document.activeElement, map.iframe);
});

test('mapa nao aceita URL arbitraria como origem', () => {
  const map = setup('https://attacker.example/tracker');
  map.click();
  assert.equal(map.iframe.src, undefined);
  assert.equal(map.removed(), false);
  assert.equal(map.frameAttributes.get('tabindex'), '-1');
});
