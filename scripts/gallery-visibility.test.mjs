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
  const createButton = () => ({
    hidden: true,
    textContent: '',
    attrs: new Map(),
    listeners: new Map(),
    setAttribute(name, value) { this.attrs.set(name, String(value)); },
    getAttribute(name) { return this.attrs.get(name); },
    addEventListener(name, handler) { this.listeners.set(name, handler); },
    click() { this.listeners.get('click')?.(); },
    focus() { document.activeElement = this; },
  });
  const nextButton = createButton();
  const pauseButton = createButton();
  const gallery = {
    querySelectorAll: (selector) => selector === 'img' ? images : [],
    querySelector: (selector) => selector === '[data-gallery-next]' ? nextButton
      : selector === '[data-gallery-toggle]' ? pauseButton : null,
    getAttribute: () => 'Resultados de exemplo',
  };
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
    pauseButton,
    nextButton,
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


test('pausa manual permanece ativa após alternar aba e rolagem', () => {
  const view = setup({ observeViewport: true });
  view.setViewportVisible(true);
  assert.equal(view.isRotating(), true);
  assert.equal(view.pauseButton.hidden, false);
  view.pauseButton.click();
  assert.equal(view.isRotating(), false);
  assert.equal(view.pauseButton.getAttribute('aria-label'), 'Retomar troca automática de fotos — Resultados de exemplo');
  view.setHidden(true);
  view.setHidden(false);
  view.setViewportVisible(false);
  view.setViewportVisible(true);
  assert.equal(view.isRotating(), false);
  view.pauseButton.click();
  assert.equal(view.pauseButton.getAttribute('aria-label'), 'Pausar troca automática de fotos — Resultados de exemplo');
  assert.equal(view.isRotating(), true);
});

test('próxima foto funciona sem iniciar rotação e movimento reduzido mantém controle manual', () => {
  const view = setup({ reducedMotion: true });
  assert.equal(view.isRotating(), false);
  assert.equal(view.pauseButton.hidden, true);
  assert.equal(view.nextButton.hidden, false);
  view.nextButton.click();
  assert.equal(view.isRotating(), false);
  assert.equal(view.pauseButton.getAttribute('aria-label'), 'Retomar troca automática de fotos — Resultados de exemplo');
  view.setReducedMotion(false);
  assert.equal(view.pauseButton.hidden, false);
  assert.equal(view.isRotating(), false);
  assert.equal(view.pauseButton.textContent, 'Retomar');
});


test('botão de galeria com rótulo de ação não declara estado toggle', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const controls = [...html.matchAll(/<button[^>]*data-gallery-toggle[^>]*>/g)];
  assert.equal(controls.length, 2);
  controls.forEach(([tag]) => assert.doesNotMatch(tag, /aria-pressed=/));
  const view = setup();
  view.pauseButton.click();
  assert.equal(view.pauseButton.getAttribute('aria-pressed'), undefined);
  assert.equal(view.pauseButton.textContent, 'Retomar');
});
