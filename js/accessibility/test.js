import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { accessibilityShortcutTargets, initializeAccessibility } from './index.js';

function setup() {
  const scrolls = [];
  const motionPreference = { matches: false };
  const button = {
    dataset: { pageScroll: 'top' },
    addEventListener(type, fn) {
      if (type === 'click') this.click = fn;
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
      return selector === '[data-page-scroll]' ? [button] : [];
    },
  };
  const window = {
    navigator: { maxTouchPoints: 0 },
    matchMedia() { return { matches: false }; },
    scrollTo(options) { scrolls.push(options); },
  };
  let reveals = 0;
  initializeAccessibility({ document, window, motionPreference, revealSiteHeader() { reveals++; } });
  return {
    button, scrolls,
    headerReveals: () => reveals,
    setReducedMotion(matches) { motionPreference.matches = matches; },
  };
}

test('todos os atalhos de navegação apontam para destinos reais e distintos', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const entries = Object.entries(accessibilityShortcutTargets);
  assert.deepEqual(entries.map(([key]) => key), ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5']);
  assert.equal(new Set(entries.map(([, id]) => id)).size, 6);
  for (const [key, id] of entries) {
    assert.ok(html.includes('id="' + id + '"'), key + ' sem destino #' + id);
  }
});

test('botão de rolagem respeita alteração da preferência sem recarregar a página', () => {
  const view = setup();
  view.button.click();
  view.setReducedMotion(true);
  view.button.click();
  view.setReducedMotion(false);
  view.button.click();
  assert.deepEqual(view.scrolls.map(({ behavior }) => behavior), ['smooth', 'auto', 'smooth']);
  assert.equal(view.headerReveals(), 3);
});
