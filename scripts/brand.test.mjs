import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/main.js', import.meta.url), 'utf8');

test('links da marca retornam ao topo respeitando a preferência atual de movimento', () => {
  const preference = { matches: true, addEventListener() {} };
  const scrolls = [];
  const clickHandlers = [];
  const brandLinks = Array.from({ length: 2 }, () => ({
    addEventListener(type, listener) {
      assert.equal(type, 'click');
      clickHandlers.push(listener);
    },
  }));
  const document = {
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll(selector) {
      return selector === '.brand[href="#inicio"]' ? brandLinks : [];
    },
  };
  const window = {
    matchMedia(query) {
      return query === '(prefers-reduced-motion: reduce)' ? preference : { matches: false };
    },
    scrollTo({ top, behavior }) { scrolls.push({ top, behavior }); },
  };
  vm.runInNewContext(source, { document, window, navigator: { maxTouchPoints: 0 } });

  assert.equal(clickHandlers.length, 2);
  let prevented = 0;
  const click = { preventDefault() { prevented += 1; } };
  clickHandlers[0](click);
  preference.matches = false;
  clickHandlers[1](click);

  assert.equal(prevented, 2);
  assert.deepEqual(scrolls, [
    { top: 0, behavior: 'auto' },
    { top: 0, behavior: 'smooth' },
  ]);
});
