import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const start = source.indexOf("const siteHeader = document.querySelector('.site-header');");
const end = source.indexOf('const accessibilityHelp', start);
assert.ok(start >= 0 && end > start, 'header controller found');
const controller = source.slice(start, end);

function setup() {
  const classes = new Set();
  const callbacks = new Map();
  const frames = new Map();
  const timers = new Map();
  let clock = 0;
  let nextFrame = 1;
  let nextTimer = 1;
  const headerPin = {
    attrs: new Map(),
    addEventListener(event, callback) { callbacks.set('pin:' + event, callback); },
    setAttribute(name, value) { this.attrs.set(name, value); },
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
  const document = {
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
  vm.runInNewContext(controller, { window, document, performance: { now: () => clock }, Math });
  return {
    header, headerPin, document,
    hidden: () => classes.has('is-hidden'),
    scrollTo(y) {
      window.scrollY = y;
      callbacks.get('scroll')?.();
      for (const fn of [...frames.values()]) fn();
      frames.clear();
    },
    advance() { clock += 2100; },
    pin() { callbacks.get('pin:click')?.(); },
  };
}

test('hidden header becomes inert and is re-enabled on upward scroll', () => {
  const view = setup();
  view.scrollTo(500);
  assert.equal(view.hidden(), true);
  assert.equal(view.header.inert, true);
  view.advance();
  view.scrollTo(450);
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
