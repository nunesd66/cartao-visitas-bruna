import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const privacySource = await readFile(new URL('../js/privacy.js', import.meta.url), 'utf8');
const htmlSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const scssSource = await readFile(new URL('../css/style.scss', import.meta.url), 'utf8');

class FakeElement {
  constructor({ hidden = false, selectorMap = {} } = {}) {
    this.hidden = hidden;
    this.selectorMap = selectorMap;
    this.attributes = new Map();
    this.listeners = new Map();
    this.focused = false;
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  querySelector(selector) {
    return this.selectorMap[selector] || null;
  }

  focus() {
    this.focused = true;
  }

  click() {
    this.focused = false;
    this.listeners.get('click')?.({ currentTarget: this });
  }
}

function createPrivacy(storage = new Map()) {
  const acceptButton = new FakeElement();
  const rejectButton = new FakeElement();
  const panel = new FakeElement({
    hidden: true,
    selectorMap: {
      '[data-privacy-choice="accepted"]': acceptButton,
      '[data-privacy-choice="rejected"]': rejectButton,
    },
  });
  const toggle = new FakeElement({ hidden: true });
  const calls = [];
  const analytics = { setConsent: (granted) => calls.push(granted) };
  const document = {
    querySelector(selector) {
      if (selector === '[data-privacy-panel]') return panel;
      if (selector === '[data-privacy-toggle]') return toggle;
      return null;
    },
  };
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); },
  };

  vm.runInNewContext(privacySource, { window: { localStorage, BrunaAnalytics: analytics }, document });
  return { panel, toggle, acceptButton, rejectButton, calls, storage };
}

test('primeira visita abre o aviso sem consentir e permite recusar', () => {
  const { panel, toggle, calls, storage, rejectButton } = createPrivacy();

  assert.equal(panel.hidden, false);
  assert.equal(toggle.hidden, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.deepEqual(calls, [false]);

  rejectButton.click();
  assert.equal(storage.get('bruna-analytics-consent-v1'), 'rejected');
  assert.deepEqual(calls, [false, false]);
  assert.equal(panel.hidden, true);
  assert.equal(toggle.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(toggle.focused, true);
});

test('aceitar persiste a escolha e a restaura no carregamento seguinte', () => {
  const firstVisit = createPrivacy();
  firstVisit.acceptButton.click();

  assert.equal(firstVisit.storage.get('bruna-analytics-consent-v1'), 'accepted');
  assert.deepEqual(firstVisit.calls, [false, true]);
  assert.equal(firstVisit.panel.hidden, true);
  assert.equal(firstVisit.toggle.hidden, false);

  const nextVisit = createPrivacy(firstVisit.storage);
  assert.deepEqual(nextVisit.calls, [true]);
  assert.equal(nextVisit.panel.hidden, true);
  assert.equal(nextVisit.toggle.hidden, false);
});

test('recusa persistida nao habilita analytics e controle permanente sincroniza ARIA', () => {
  const storage = new Map([['bruna-analytics-consent-v1', 'rejected']]);
  const visit = createPrivacy(storage);

  assert.deepEqual(visit.calls, [false]);
  assert.equal(visit.panel.hidden, true);
  assert.equal(visit.toggle.hidden, false);

  visit.toggle.click();
  assert.equal(visit.panel.hidden, false);
  assert.equal(visit.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(visit.acceptButton.focused, true);

  visit.acceptButton.click();
  assert.equal(storage.get('bruna-analytics-consent-v1'), 'accepted');
  assert.deepEqual(visit.calls, [false, true]);
});

test('markup acessivel, textos autorizados e layout fluido para telas estreitas', () => {
  assert.match(htmlSource, /role="region"[\s\S]*aria-labelledby="privacy-title"[\s\S]*aria-describedby="privacy-description"/);
  assert.match(htmlSource, /<h2 id="privacy-title">Privacidade e análise de visitas<\/h2>/);
  assert.match(htmlSource, /Usamos dados de navegação, com sua autorização, para entender o uso do site e melhorar sua experiência\. Você pode mudar sua escolha a qualquer momento\./);
  assert.match(htmlSource, /data-privacy-choice="accepted">Aceitar<\/button>/);
  assert.match(htmlSource, /data-privacy-choice="rejected">Recusar<\/button>/);
  assert.match(htmlSource, /<button class="privacy-control__accept" type="button"/);
  assert.match(htmlSource, /<button class="privacy-control__reject" type="button"/);
  assert.match(htmlSource, /aria-controls="privacy-panel"[\s\S]*aria-expanded="false"[\s\S]*<span class="privacy-control__label">Privacidade<\/span>[\s\S]*<\/button>/);
  assert.match(scssSource, /width: min\(28rem, calc\(100vw - 2rem\)\)/);
  assert.match(scssSource, /min-height: 2\.75rem/);
  assert.match(scssSource, /@media \(min-width: 60rem\)[\s\S]*\.privacy-control__panel,[\s\S]*bottom: 1rem/);
  assert.match(scssSource, /\.privacy-control__toggle svg\s*\{\s*display: none;/);
  assert.match(scssSource, /\.privacy-control__toggle\s*\{\s*position: static;/);
  assert.match(scssSource, /\.accessibility-tools,[\s\S]*\.whatsapp-float\s*\{\s*display: none;/);
  assert.doesNotMatch(scssSource.slice(scssSource.indexOf('.privacy-control__panel {'), scssSource.indexOf('.whatsapp-float {')), /transition:/);
});
