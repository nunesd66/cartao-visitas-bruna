import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const start = source.indexOf('const imageRotators = [];');
assert.ok(start >= 0, 'Inicializador das galerias encontrado');
const gallerySource = source.slice(start);

function setup({ hidden = false, reducedMotion = false, observeViewport = false } = {}) {
  const intervals = new Map();
  const handlers = new Map();
  const motionHandlers = new Map();
  const classes = new Set(['is-active']);
  let visibilityCallback;
  let observedGallery;
  const images = Array.from({ length: 2 }, (_, i) => ({
    classList: {
      contains: (name) => i === 0 && classes.has(name),
      add: (name) => { if (i === 0) classes.add(name); },
      remove: (name) => { if (i === 0) classes.delete(name); },
    },
    setAttribute() {},
    removeAttribute() {},
  }));
  const gallery = { querySelectorAll: (selector) => selector === 'img' ? images : [] };
  const document = {
    hidden,
    querySelectorAll: (selector) => selector === '[data-image-rotator]' ? [gallery] : [],
    addEventListener: (event, fn) => handlers.set(event, fn),
  };
  const motionPreference = {
    matches: reducedMotion,
    addEventListener: (event, fn) => motionHandlers.set(event, fn),
  };
  let nextId = 1;
  const window = {
    setInterval(fn) { const id = nextId++; intervals.set(id, fn); return id; },
    clearInterval(id) { intervals.delete(id); },
  };
  if (observeViewport) {
    window.IntersectionObserver = class {
      constructor(callback) { visibilityCallback = callback; }
      observe(element) { observedGallery = element; }
    };
  }
  vm.runInNewContext(gallerySource, { document, motionPreference, window });
  return {
    isRotating: () => intervals.size > 0,
    setHidden(next) { document.hidden = next; handlers.get('visibilitychange')?.(); },
    setReducedMotion(next) { motionPreference.matches = next; motionHandlers.get('change')?.({ matches: next }); },
    setViewportVisible(next) {
      assert.equal(observedGallery, gallery, 'observer deve monitorar galeria');
      visibilityCallback?.([{ isIntersecting: next }]);
    },
  };
}

test('galeria não inicia em aba oculta e retoma somente quando visível', () => {
  const view = setup({ hidden: true });
  assert.equal(view.isRotating(), false);
  view.setHidden(false);
  assert.equal(view.isRotating(), true);
  view.setHidden(true);
  assert.equal(view.isRotating(), false);
  view.setHidden(false);
  assert.equal(view.isRotating(), true);
});

test('redução de movimento impede retomada de rotação oculta', () => {
  const view = setup();
  assert.equal(view.isRotating(), true);
  view.setReducedMotion(true);
  assert.equal(view.isRotating(), false);
  view.setHidden(true);
  view.setHidden(false);
  assert.equal(view.isRotating(), false);
  view.setReducedMotion(false);
  assert.equal(view.isRotating(), true);
});


test('galeria fora da tela não consome temporizador até entrar no viewport', () => {
  const view = setup({ observeViewport: true });
  assert.equal(view.isRotating(), false);
  view.setViewportVisible(true);
  assert.equal(view.isRotating(), true);
  view.setViewportVisible(false);
  assert.equal(view.isRotating(), false);
  view.setViewportVisible(true);
  assert.equal(view.isRotating(), true);
});

test('retornar à aba não inicia rotação enquanto galeria segue fora da tela', () => {
  const view = setup({ observeViewport: true });
  view.setViewportVisible(true);
  view.setHidden(true);
  assert.equal(view.isRotating(), false);
  view.setViewportVisible(false);
  view.setHidden(false);
  assert.equal(view.isRotating(), false);
  view.setViewportVisible(true);
  assert.equal(view.isRotating(), true);
});
