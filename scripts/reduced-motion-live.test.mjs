import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/main.js', import.meta.url), 'utf8');

function setup() {
  const scrolls = [];
  const mediaCallbacks = [];
  const motion = {
    matches: false,
    addEventListener(type, fn) {
      if (type === 'change') mediaCallbacks.push(fn);
    },
  };
  const button = {
    dataset: { pageScroll: 'top' },
    addEventListener(type, fn) {
      if (type === 'click') this.click = fn;
    },
  };
  const answer = {
    style: {},
    scrollHeight: 125,
    offsetHeight: 0,
    addEventListener() {},
  };
  const summary = {
    addEventListener(type, fn) {
      if (type === 'click') this.click = fn;
    },
  };
  const details = {
    open: false,
    dataset: {},
    querySelector(selector) {
      return selector === 'summary' ? summary : selector === 'p' ? answer : null;
    },
  };
  const accessibility = {
    open: false,
    addEventListener() {},
    querySelector() { return null; },
  };
  const document = {
    addEventListener() {},
    querySelector(selector) {
      return selector === '.accessibility-tools' ? accessibility : null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-page-scroll]') return [button];
      if (selector === '.faq details') return [details];
      return [];
    },
  };
  const window = {
    matchMedia(query) {
      return query === '(prefers-reduced-motion: reduce)' ? motion : { matches: false };
    },
    scrollTo(options) { scrolls.push(JSON.parse(JSON.stringify(options))); },
  };
  vm.runInNewContext(source, { document, window, navigator: { maxTouchPoints: 0 } });
  return {
    button, details, summary, answer, scrolls,
    setReducedMotion(matches) {
      motion.matches = matches;
      mediaCallbacks.forEach((callback) => callback({ matches }));
    },
  };
}

test('botão de rolagem respeita alteração da preferência sem recarregar a página', () => {
  const view = setup();
  view.button.click();
  view.setReducedMotion(true);
  view.button.click();
  view.setReducedMotion(false);
  view.button.click();
  assert.deepEqual(view.scrolls.map(({ behavior }) => behavior), ['smooth', 'auto', 'smooth']);
});

test('FAQ interrompe animação em andamento ao ativar movimento reduzido', () => {
  const view = setup();
  assert.equal(view.answer.style.transition, 'height 400ms ease');
  view.summary.click({ preventDefault() {} });
  assert.equal(view.details.dataset.animating, 'true');
  view.setReducedMotion(true);
  assert.equal(view.answer.style.transition, 'none');
  assert.equal(view.details.open, true);
  assert.equal(view.answer.style.height, 'auto');
  assert.equal(view.details.dataset.animating, undefined);
  view.summary.click({ preventDefault() {} });
  assert.equal(view.details.open, false);
  assert.equal(view.answer.style.height, '0px');
  view.setReducedMotion(false);
  assert.equal(view.answer.style.transition, 'height 400ms ease');
});
