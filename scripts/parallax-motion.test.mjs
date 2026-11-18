import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const start = source.indexOf("const aboutVisual = document.querySelector('.about__visual');");
const end = source.indexOf("\ndocument.querySelectorAll('[data-carousel]')", start);
assert.ok(start >= 0 && end > start, 'Parallax initializer exists');
const initializer = source.slice(start, end);

function setup(initiallyReduced) {
  const frames = new Map();
  const mediaListeners = new Map();
  let id = 1;
  const props = new Map();
  const visual = {
    getBoundingClientRect() { return { top: 120, height: 400 }; },
    style: {
      setProperty(name, value) { props.set(name, value); },
      removeProperty(name) { props.delete(name); },
    },
  };
  const document = { querySelector(selector) { return selector === '.about__visual' ? visual : null; } };
  const motionPreference = {
    matches: initiallyReduced,
    addEventListener(name, callback) { mediaListeners.set(name, callback); },
  };
  const window = {
    innerHeight: 850,
    addEventListener() {},
    requestAnimationFrame(callback) { const key = id++; frames.set(key, callback); return key; },
    cancelAnimationFrame(key) { frames.delete(key); },
  };
  vm.runInNewContext(initializer, { window, document, motionPreference, reduceMotion: initiallyReduced, Math });
  const flush = () => {
    for (const callback of [...frames.values()]) callback();
    frames.clear();
  };
  return {
    props, frames, flush,
    change(matches) { motionPreference.matches = matches; mediaListeners.get('change')?.({ matches }); },
  };
}

test('parallax pauses and clears offsets when reduced motion is enabled', () => {
  const view = setup(false);
  view.flush();
  assert.equal(view.props.size, 3);
  view.change(true);
  assert.equal(view.props.size, 0);
  assert.equal(view.frames.size, 0);
  view.change(false);
  view.flush();
  assert.equal(view.props.size, 3);
});

test('parallax remains disabled for initially reduced motion until preference changes', () => {
  const view = setup(true);
  assert.equal(view.props.size, 0);
  assert.equal(view.frames.size, 0);
  view.change(false);
  view.flush();
  assert.equal(view.props.size, 3);
});
