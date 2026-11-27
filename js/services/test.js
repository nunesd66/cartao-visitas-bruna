import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeServicePhotos } from './index.js';

function createGallery(photoCount) {
  const children = Array.from({ length: photoCount }, (_, index) => {
    const attributes = new Set(index === 0 ? [] : ['data-inactive']);
    return {
      setAttribute(name) { attributes.add(name); },
      removeAttribute(name) { attributes.delete(name); },
      hasAttribute(name) { return attributes.has(name); },
    };
  });
  return { children };
}

function activePhotos(gallery) {
  return gallery.children.flatMap((photo, index) =>
    photo.hasAttribute('data-inactive') ? [] : [index]);
}

test('fotos de serviços avançam a cada dois segundos e voltam à primeira', () => {
  const galleries = [createGallery(2), createGallery(3), createGallery(1)];
  const timers = [];
  const preferenceChanges = [];
  const motionPreference = {
    matches: false,
    addEventListener(_event, callback) { preferenceChanges.push(callback); },
  };
  const document = {
    querySelectorAll(selector) {
      assert.equal(selector, '.service-card__gallery');
      return galleries;
    },
  };
  const window = {
    setInterval(callback, delay) { return timers.push({ callback, delay }); },
    clearInterval(timer) { timers[timer - 1] = null; },
  };

  initializeServicePhotos({ document, window, motionPreference });
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, 2000);
  assert.deepEqual(galleries.map(activePhotos), [[0], [0], [0]]);

  timers[0].callback();
  assert.deepEqual(galleries.map(activePhotos), [[1], [1], [0]]);
  timers[0].callback();
  assert.deepEqual(galleries.map(activePhotos), [[0], [2], [0]]);
  timers[0].callback();
  assert.deepEqual(galleries.map(activePhotos), [[1], [0], [0]]);

  motionPreference.matches = true;
  preferenceChanges[0]();
  assert.equal(timers[0], null);

  motionPreference.matches = false;
  preferenceChanges[0]();
  assert.equal(timers[1].delay, 2000);
  timers[1].callback();
  assert.deepEqual(galleries.map(activePhotos), [[0], [1], [0]]);
});

test('movimento reduzido deixa a primeira foto estática', () => {
  const gallery = createGallery(2);
  const document = { querySelectorAll: () => [gallery] };
  const window = {
    setInterval() { assert.fail('Movimento reduzido não deve iniciar uma rotação'); },
    clearInterval() {},
  };
  const motionPreference = { matches: true, addEventListener() {} };

  initializeServicePhotos({ document, window, motionPreference });
  assert.deepEqual(activePhotos(gallery), [0]);
});

test('galerias vazias ou com uma única foto dispensam o temporizador', () => {
  const document = { querySelectorAll: () => [createGallery(0), createGallery(1)] };
  const window = { setInterval() { assert.fail('Temporizador desnecessário'); } };

  initializeServicePhotos({ document, window });
});
