import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeParallax } from './index.js';

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
  initializeParallax({ window, document, motionPreference });
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
