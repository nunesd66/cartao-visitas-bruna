import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const start = source.indexOf("const siteHeader = document.querySelector('.site-header');");
const end = source.indexOf('const accessibilityHelp', start);
assert.ok(start >= 0 && end > start, 'header controller found');
const controller = source.slice(start, end);
const brandLinks = source.slice(source.indexOf("document.querySelectorAll('.brand"), source.indexOf('const faqAnswers'));
const keyboardShortcuts = source.slice(source.indexOf('const accessibilityShortcutTargets'), source.indexOf('const aboutVisual'));

function setup() {
  const classes = new Set();
  const callbacks = new Map();
  const frames = new Map();
  const timers = new Map();
  let clock = 0;
  let nextFrame = 1;
  let nextTimer = 1;
  const brand = { addEventListener(type, callback) { callbacks.set('brand:' + type, callback); } };
  const headerPin = {
    attrs: new Map(),
    addEventListener(event, callback) { callbacks.set('pin:' + event, callback); },
    setAttribute(name, value) { this.attrs.set(name, value); },
    getAttribute(name) { return this.attrs.get(name); },
  };
  const header = {
    offsetHeight: 72,
    inert: false,
    classList: {
      toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); },
    },
    contains(element) { return element === headerPin; },
  };
  const anchor = { getBoundingClientRect() { return { top: 0 }; } };
  const heading = { focus() {}, scrollIntoView() {} };
  class ShortcutTarget { closest() { return null; } }
  const document = {
    querySelectorAll() { return [brand]; },
    addEventListener(type, callback) { callbacks.set('document:' + type, callback); },
    getElementById() { return heading; },
    activeElement: null,
    querySelector(selector) {
      if (selector === '.site-header') return header;
      if (selector === '#casos-reais') return anchor;
      if (selector === '[data-header-pin]') return headerPin;
      return null;
    },
  };
  const window = {
    scrollY: 0,
    scrollTo() {},
    matchMedia() { return { matches: false }; },
    addEventListener(type, callback) { callbacks.set(type, callback); },
    requestAnimationFrame(callback) {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    setTimeout(callback) {
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
  };
  const context = {
    window, document, performance: { now: () => clock },
    Element: ShortcutTarget,
    motionPreference: { matches: false },
    navigator: { maxTouchPoints: 0 },
    accessibilityHelp: null,
    accessibilityTools: null,
  };
  vm.runInNewContext(brandLinks + controller + keyboardShortcuts + '\nthis.testRevealSiteHeader = revealSiteHeader;', context);
  return {
    header, headerPin, document,
    revealHeader() { context.testRevealSiteHeader(); },
    hidden: () => classes.has('is-hidden'),
    scrollTo(y) {
      window.scrollY = y;
      callbacks.get('scroll')?.();
      for (const fn of [...frames.values()]) fn();
      frames.clear();
    },
    advance() { clock += 2100; },
    pin() { callbacks.get('pin:click')?.(); },
    clickBrand() { callbacks.get('brand:click')({ preventDefault() {} }); },
    pressShortcut(code) {
      callbacks.get('document:keydown')({
        code, target: new ShortcutTarget(), ctrlKey: true, altKey: true, shiftKey: true,
        preventDefault() {},
      });
    },
  };
}

test('hidden header becomes inert and is re-enabled on upward scroll', () => {
  const view = setup();
  view.scrollTo(500);
  assert.equal(view.hidden(), true);
  assert.equal(view.header.inert, true);
  view.scrollTo(450);
  assert.equal(view.header.inert, true);
  view.advance();
  view.scrollTo(400);
  assert.equal(view.hidden(), false);
  assert.equal(view.header.inert, false);
});

test('header retains keyboard focus instead of disappearing during downward scroll', () => {
  const view = setup();
  view.document.activeElement = view.headerPin;
  view.scrollTo(500);
  assert.equal(view.hidden(), false);
  assert.equal(view.header.inert, false);
  view.document.activeElement = null;
  view.scrollTo(520);
  assert.equal(view.hidden(), true);
  assert.equal(view.header.inert, true);
});


test('scroll-to-top restoration removes inert and synchronizes header state', () => {
  const view = setup();
  view.scrollTo(500);
  assert.equal(view.hidden(), true);
  assert.equal(view.header.inert, true);
  view.revealHeader();
  assert.equal(view.hidden(), false);
  assert.equal(view.header.inert, false);
  view.advance();
  view.scrollTo(600);
  assert.equal(view.hidden(), true, 'next downward scroll must hide it again');
});

test('return to the start by brand or keyboard shortcut reveals the header without waiting', () => {
  for (const returnToStart of [view => view.clickBrand(), view => view.pressShortcut('Digit0')]) {
    const view = setup();
    view.scrollTo(500);
    assert.equal(view.header.inert, true);
    returnToStart(view);
    assert.equal(view.hidden(), false);
    assert.equal(view.header.inert, false);
  }
});

test('scroll-to-top controls use synchronized header restoration', () => {
  assert.match(source, /if \(destination === 0\) revealSiteHeader\(\);/);
  assert.doesNotMatch(source, /if \(destination === 0\) siteHeader\?\.classList\.remove/);
});

test('header pin changes action label without declaring toggle state', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const tag = html.match(/<button[^>]*data-header-pin[^>]*>/)?.[0];
  assert.ok(tag);
  assert.doesNotMatch(tag, /aria-pressed=/);
  const view = setup();
  view.pin();
  assert.equal(view.headerPin.getAttribute('aria-label'), 'Desafixar cabeçalho');
  assert.equal(view.headerPin.getAttribute('aria-pressed'), undefined);
  assert.equal(view.headerPin.getAttribute('data-pinned'), 'true');
  view.pin();
  assert.equal(view.headerPin.getAttribute('aria-label'), 'Fixar cabeçalho');
  assert.equal(view.headerPin.getAttribute('data-pinned'), 'false');
});
