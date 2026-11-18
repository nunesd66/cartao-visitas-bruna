import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const startMarker = "document.querySelectorAll('[data-carousel]').forEach((carousel) => {";
const endMarker = '\nfaqAnswers.forEach((details) => {';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
assert.notEqual(start, -1, 'carousel initializer exists in main.js');
assert.notEqual(end, -1, 'carousel initializer has a closing boundary');
const carouselInitializer = source.slice(start, end);

function createCarouselHarness({ count = 11, viewportWidth = 390, slideWidth = 292.5, gap = 16, reducedMotion = false } = {}) {
  const step = slideWidth + gap;
  const sidePadding = (viewportWidth - slideWidth) / 2;
  const frameQueue = new Map();
  const intervals = new Map();
  let nextFrameId = 1;
  let nextIntervalId = 1;
  let clock = 0;

  class Element {
    constructor(name = '') {
      this.name = name;
      this.attributes = new Map();
      this.listeners = new Map();
      this.children = [];
      this.classList = {
        values: new Set(),
        add(value) { this.values.add(value); },
        remove(value) { this.values.delete(value); },
        contains(value) { return this.values.has(value); },
      };
      this.hidden = false;
      this.disabled = false;
      this.textContent = '';
    }

    addEventListener(name, callback) {
      this.listeners.set(name, callback);
    }

    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }

    append(child) {
      this.children.push(child);
    }

    getAttribute(name) {
      return this.attributes.get(name);
    }
  }

  const viewport = new Element('viewport');
  viewport.id = 'testimonials-viewport';
  viewport.clientLeft = 0;
  viewport.clientWidth = viewportWidth;
  viewport.scrollWidth = viewportWidth + (count - 1) * step;
  let scrollLeft = 0;
  Object.defineProperty(viewport, 'scrollLeft', {
    get: () => scrollLeft,
    set: (value) => {
      scrollLeft = Math.max(0, Math.min(value, viewport.scrollWidth - viewport.clientWidth));
      viewport.listeners.get('scroll')?.();
    },
  });
  viewport.getBoundingClientRect = () => ({ left: 0, width: viewportWidth });

  const slides = Array.from({ length: count }, (_, index) => {
    const slide = new Element(`slide-${index + 1}`);
    slide.dataset = { carouselSlide: 'true', index: String(index) };
    slide.getBoundingClientRect = () => ({
      left: sidePadding + index * step - viewport.scrollLeft,
      width: slideWidth,
    });
    return slide;
  });

  const controls = new Element('controls');
  const previous = new Element('previous');
  const next = new Element('next');
  const status = new Element('status');
  const rotationToggle = new Element('rotation-toggle');
  const pagination = new Element('pagination');
  const track = new Element('track');
  const carousel = new Element('carousel');
  const descendants = new Map([
    ['[data-carousel-viewport]', viewport],
    ['.testimonials__track', track],
    ['[data-carousel-controls]', controls],
    ['[data-carousel-prev]', previous],
    ['[data-carousel-next]', next],
    ['[data-carousel-status]', status],
    ['[data-carousel-rotation]', rotationToggle],
    ['[data-carousel-pagination]', pagination],
  ]);
  carousel.querySelector = (selector) => descendants.get(selector) || null;
  carousel.querySelectorAll = (selector) => selector === '.testimonial-slide' ? slides : [];

  const window = {
    clearInterval(id) { intervals.delete(id); },
    setInterval(callback) {
      const id = nextIntervalId++;
      intervals.set(id, callback);
      return id;
    },
    requestAnimationFrame(callback) {
      const id = nextFrameId++;
      frameQueue.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) { frameQueue.delete(id); },
    addEventListener() {},
    matchMedia() { return { matches: false }; },
  };
  const document = {
    hidden: false,
    createElement(name) { return new Element(name); },
    querySelectorAll(selector) { return selector === '[data-carousel]' ? [carousel] : []; },
    addEventListener() {},
  };
  const motionPreference = {
    matches: reducedMotion,
    addEventListener() {},
  };

  vm.runInNewContext(carouselInitializer, {
    document,
    window,
    performance: { now: () => clock },
    motionPreference,
    reduceMotion: reducedMotion,
    Number,
    Math,
  });

  const flushFrames = () => {
    let guard = 0;
    while (frameQueue.size) {
      assert.ok(guard++ < 1000, 'animation frame queue drains');
      const frames = [...frameQueue.values()];
      frameQueue.clear();
      clock += 100;
      frames.forEach((callback) => callback(clock));
    }
  };

  const runAutoAdvance = () => {
    const advance = [...intervals.values()][0];
    assert.equal(typeof advance, 'function', 'automatic rotation is initialized');
    advance();
    flushFrames();
    return status.textContent;
  };

  const focusRotation = () => carousel.listeners.get('focusin')({ target: rotationToggle });
  const clickRotation = () => rotationToggle.listeners.get('click')();

  return { slides, viewport, status, next, previous, pagination, rotationToggle,
    focusRotation, clickRotation, isRotating: () => intervals.size > 0, runAutoAdvance, flushFrames };
}

test('automatic rotation visits testimonial 10 between 9 and 11, then wraps', () => {
  const carousel = createCarouselHarness();
  const positions = Array.from({ length: 11 }, () => carousel.runAutoAdvance());

  assert.deepEqual(positions.slice(7, 10), ['9 de 11', '10 de 11', '11 de 11']);
  assert.equal(positions[10], '1 de 11');
  assert.equal(carousel.slides.length, 11);
});

test('direct navigation to slide 10 and adjacent arrows preserve the sequence', () => {
  const carousel = createCarouselHarness();
  carousel.pagination.children[9].listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.status.textContent, '10 de 11');

  carousel.next.listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.status.textContent, '11 de 11');

  carousel.previous.listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.status.textContent, '10 de 11');
});

test('rotation control applies its displayed action on the first activation', () => {
  const carousel = createCarouselHarness();
  const { rotationToggle } = carousel;

  assert.equal(rotationToggle.getAttribute('aria-label'), 'Parar rotação');
  carousel.focusRotation();
  carousel.clickRotation();
  assert.equal(carousel.isRotating(), false);
  assert.equal(rotationToggle.getAttribute('data-paused'), 'true');
  assert.equal(rotationToggle.getAttribute('aria-label'), 'Retomar rotação');

  carousel.clickRotation();
  assert.equal(carousel.isRotating(), true);
  assert.equal(rotationToggle.getAttribute('data-paused'), 'false');
  assert.equal(rotationToggle.getAttribute('aria-label'), 'Parar rotação');
});

test('reduced motion keeps the rotation control hidden and automatic rotation off', () => {
  const carousel = createCarouselHarness({ reducedMotion: true });

  assert.equal(carousel.rotationToggle.hidden, true);
  assert.equal(carousel.isRotating(), false);
});
