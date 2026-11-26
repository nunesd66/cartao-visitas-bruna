import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeCarousel } from './index.js';

function createCarouselHarness({ count = 11, viewportWidth = 390, slideWidth = 292.5, gap = 16, reducedMotion = false, initiallyHidden = false, observeViewport = false } = {}) {
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

    focus() {
      document.activeElement = this;
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
  viewport.setPointerCapture = (id) => { viewport.capturedPointer = id; };
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

  let viewportObserver;
  let observedCarousel;
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
  const documentListeners = new Map();
  const document = {
    hidden: initiallyHidden,
    activeElement: null,
    createElement(name) { return new Element(name); },
    querySelectorAll(selector) { return selector === '[data-carousel]' ? [carousel] : []; },
    addEventListener(type, callback) { documentListeners.set(type, callback); },
  };
  const mediaListeners = new Map();
  const motionPreference = {
    matches: reducedMotion,
    addEventListener(type, callback) { mediaListeners.set(type, callback); },
  };

  if (observeViewport) {
    window.IntersectionObserver = class {
      constructor(callback) { viewportObserver = callback; }
      observe(target) { observedCarousel = target; }
    };
  }
  window.performance = { now: () => clock };
  initializeCarousel({ document, window, motionPreference });

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

  return { slides, viewport, status, next, previous, pagination, rotationToggle, documentListeners,
    focusRotation, clickRotation, isRotating: () => intervals.size > 0, runAutoAdvance, flushFrames,
    focusToggle() { rotationToggle.focus(); },
    focusedElement: () => document.activeElement,
    setTabHidden(hidden) { document.hidden = hidden; documentListeners.get('visibilitychange')?.(); },
    setReducedMotion(matches) { motionPreference.matches = matches; mediaListeners.get('change')?.({ matches }); },
    setViewportVisible(visible) {
      assert.equal(observedCarousel, carousel);
      viewportObserver?.([{ isIntersecting: visible }]);
    } };
}

test('arrastar com o mouse move nos dois sentidos e encaixa no depoimento mais próximo', () => {
  const { viewport, documentListeners, isRotating, status, flushFrames } = createCarouselHarness();
  const pointer = (type, clientX) => (viewport.listeners.get(type) ?? documentListeners.get(type))({
    pointerId: 1, pointerType: 'mouse', button: 0, clientX, target: {},
  });

  pointer('pointerdown', 320);
  assert.equal(viewport.capturedPointer, undefined);
  assert.equal(isRotating(), false);
  pointer('pointermove', 317);
  assert.equal(viewport.scrollLeft, 0);
  pointer('pointermove', 100);
  assert.equal(viewport.capturedPointer, 1);
  assert.equal(viewport.classList.contains('is-dragging'), true);
  assert.equal(viewport.scrollLeft, 220);
  pointer('pointerup', 100);
  flushFrames();
  assert.equal(viewport.classList.contains('is-dragging'), false);
  assert.equal(status.textContent, '2 de 11');

  pointer('pointerdown', 100);
  pointer('pointermove', 315);
  pointer('lostpointercapture', 315);
  flushFrames();
  assert.equal(viewport.classList.contains('is-dragging'), false);
  assert.equal(status.textContent, '1 de 11');
});

test('soltar após arrastar sobre um link ativa o destino original uma vez', () => {
  const { viewport, documentListeners } = createCarouselHarness();
  let opened = 0;
  const target = { closest: () => ({ click: () => { opened++; } }) };
  const event = { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300, target };
  const down = viewport.listeners.get('pointerdown');
  const up = documentListeners.get('pointerup');
  const click = viewport.listeners.get('click');
  down(event);
  up(event);
  click({ detail: 1, preventDefault: () => assert.fail('o clique simples deve permanecer') });
  assert.equal(opened, 0, 'o navegador abre o link no clique simples');

  down(event);
  documentListeners.get('pointermove')({ ...event, clientX: 100 });
  assert.equal(opened, 0, 'o destino só abre ao soltar');
  up(event);
  assert.equal(opened, 1);
  click({ detail: 0, preventDefault: () => assert.fail('a ativação do link deve permanecer') });
  let prevented = false;
  let stopped = false;
  click({ detail: 1, preventDefault: () => { prevented = true; }, stopImmediatePropagation: () => { stopped = true; } });
  assert.equal(prevented, true);
  assert.equal(stopped, true);

  down(event);
  documentListeners.get('pointermove')({ ...event, clientX: 100 });
  documentListeners.get('pointercancel')(event);
  assert.equal(opened, 1, 'cancelar um arraste não abre o link');

  down({ ...event, pointerType: 'touch' });
  documentListeners.get('pointermove')({ ...event, pointerType: 'touch', clientX: 100 });
  assert.equal(viewport.classList.contains('is-dragging'), false);
});

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

test('focus moves to the remaining arrow only when navigation disables the focused arrow', () => {
  const carousel = createCarouselHarness({ reducedMotion: true });
  const { next, previous, pagination } = carousel;

  pagination.children[8].listeners.get('click')();
  carousel.flushFrames();
  next.focus();
  next.listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.status.textContent, '10 de 11');
  assert.equal(carousel.focusedElement(), next);

  next.listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.status.textContent, '11 de 11');
  assert.equal(carousel.focusedElement(), previous);

  const secondDot = pagination.children[1];
  secondDot.focus();
  secondDot.listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.focusedElement(), secondDot);

  previous.focus();
  previous.listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.status.textContent, '1 de 11');
  assert.equal(carousel.focusedElement(), next);
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


test('manual navigation under reduced motion keeps autoplay paused when the preference is disabled', () => {
  const carousel = createCarouselHarness({ reducedMotion: true });
  carousel.pagination.children[1].listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.status.textContent, '2 de 11');

  carousel.setReducedMotion(false);
  assert.equal(carousel.isRotating(), false);
  assert.equal(carousel.rotationToggle.getAttribute('aria-label'), 'Retomar rotação');
  carousel.clickRotation();
  assert.equal(carousel.isRotating(), true);
});

test('hidden tab never starts rotation until it becomes visible', () => {
  const carousel = createCarouselHarness({ initiallyHidden: true });
  assert.equal(carousel.isRotating(), false);
  carousel.setTabHidden(false);
  assert.equal(carousel.isRotating(), true);
  carousel.setTabHidden(true);
  assert.equal(carousel.isRotating(), false);
  carousel.setTabHidden(false);
  assert.equal(carousel.isRotating(), true);
});


test('manual pause remains active when reduced motion is toggled on and off', () => {
  const carousel = createCarouselHarness();
  carousel.clickRotation();
  assert.equal(carousel.isRotating(), false);
  carousel.setReducedMotion(true);
  carousel.setReducedMotion(false);
  assert.equal(carousel.isRotating(), false);
  assert.equal(carousel.rotationToggle.getAttribute('aria-label'), 'Retomar rotação');
  carousel.clickRotation();
  assert.equal(carousel.isRotating(), true);
});

test('active rotation resumes after reduced motion is turned off', () => {
  const carousel = createCarouselHarness();
  assert.equal(carousel.isRotating(), true);
  carousel.setReducedMotion(true);
  assert.equal(carousel.isRotating(), false);
  carousel.setReducedMotion(false);
  assert.equal(carousel.isRotating(), true);
});


test('automatic testimonial rotation runs only while visible in viewport', () => {
  const carousel = createCarouselHarness({ observeViewport: true });
  assert.equal(carousel.isRotating(), false, 'before first observer notification');
  carousel.setViewportVisible(true);
  assert.equal(carousel.isRotating(), true);
  carousel.setViewportVisible(false);
  assert.equal(carousel.isRotating(), false);
  carousel.setViewportVisible(true);
  assert.equal(carousel.isRotating(), true);
});

test('visibility and reduced motion never restart a paused off-screen carousel', () => {
  const carousel = createCarouselHarness({ observeViewport: true });
  carousel.setViewportVisible(true);
  carousel.clickRotation();
  assert.equal(carousel.isRotating(), false);
  carousel.setViewportVisible(false);
  carousel.setViewportVisible(true);
  assert.equal(carousel.isRotating(), false);
  carousel.setReducedMotion(true);
  carousel.setReducedMotion(false);
  assert.equal(carousel.isRotating(), false);
  carousel.clickRotation();
  assert.equal(carousel.isRotating(), true);
  carousel.setTabHidden(true);
  assert.equal(carousel.isRotating(), false);
  carousel.setViewportVisible(false);
  carousel.setTabHidden(false);
  assert.equal(carousel.isRotating(), false);
});

test('when reduced motion hides focused rotation toggle, focus moves to enabled next button', () => {
  const carousel = createCarouselHarness();
  carousel.focusToggle();
  assert.equal(carousel.focusedElement(), carousel.rotationToggle);
  carousel.setReducedMotion(true);
  assert.equal(carousel.rotationToggle.hidden, true);
  assert.equal(carousel.focusedElement(), carousel.next);
  assert.equal(carousel.isRotating(), false);
});

test('at final testimonial, focus moves to enabled previous button', () => {
  const carousel = createCarouselHarness();
  carousel.pagination.children[10].listeners.get('click')();
  carousel.flushFrames();
  assert.equal(carousel.next.disabled, true);
  assert.equal(carousel.previous.disabled, false);
  carousel.focusToggle();
  carousel.setReducedMotion(true);
  assert.equal(carousel.focusedElement(), carousel.previous);
});
