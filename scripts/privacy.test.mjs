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
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    };
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

  contains(element) {
    return element === this || Object.values(this.selectorMap).includes(element);
  }

  getClientRects() {
    return this.hidden ? [] : [{}];
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
  const secondaryToggle = new FakeElement({ hidden: true });
  const nextHeading = new FakeElement();
  const calls = [];
  const analytics = { setConsent: (granted) => calls.push(granted) };
  const document = {
    querySelector(selector) {
      if (selector === '[data-privacy-panel]') return panel;
      if (selector === '#casos-reais') return nextHeading;
      return null;
    },
    querySelectorAll(selector) {
      return selector === '[data-privacy-toggle]' ? [toggle, secondaryToggle] : [];
    },
  };
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); },
  };

  const storageListeners = new Map();
  const window = {
    localStorage,
    BrunaAnalytics: analytics,
    addEventListener(type, listener) { storageListeners.set(type, listener); },
  };

  vm.runInNewContext(privacySource, { window, document });

  function receiveStorageChange(key, storageArea = localStorage) {
    storageListeners.get('storage')?.({ key, storageArea });
  }

  return { panel, toggle, secondaryToggle, nextHeading, acceptButton, rejectButton, calls, storage, document, receiveStorageChange };
}

test('primeira visita abre o aviso sem consentir e permite recusar', () => {
  const { panel, toggle, calls, storage, rejectButton, nextHeading } = createPrivacy();

  assert.equal(panel.hidden, false);
  assert.equal(panel.classList.contains('is-reopened'), false);
  assert.equal(toggle.hidden, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.deepEqual(calls, [false]);

  rejectButton.click();
  assert.equal(storage.get('bruna-analytics-consent-v1'), 'rejected');
  assert.deepEqual(calls, [false, false]);
  assert.equal(panel.hidden, true);
  assert.equal(toggle.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(nextHeading.focused, true);
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

  visit.secondaryToggle.click();
  assert.equal(visit.panel.hidden, false);
  assert.equal(visit.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(visit.secondaryToggle.getAttribute('aria-expanded'), 'true');
  assert.equal(visit.acceptButton.focused, true);

  visit.acceptButton.click();
  assert.equal(storage.get('bruna-analytics-consent-v1'), 'accepted');
  assert.deepEqual(visit.calls, [false, true]);
  assert.equal(visit.secondaryToggle.focused, true);
});

test('revogar e voltar a aceitar em outra aba atualiza o consentimento sem mover o foco externo', () => {
  const key = 'bruna-analytics-consent-v1';
  const storage = new Map([[key, 'accepted']]);
  const activeTab = createPrivacy(storage);
  const otherTab = createPrivacy(storage);
  activeTab.document.activeElement = new FakeElement();

  otherTab.rejectButton.click();
  activeTab.receiveStorageChange(key);
  assert.deepEqual(activeTab.calls, [true, false]);
  assert.equal(activeTab.panel.hidden, true);
  assert.equal(activeTab.toggle.hidden, false);
  assert.equal(activeTab.toggle.focused, false);

  otherTab.acceptButton.click();
  activeTab.receiveStorageChange(key);
  assert.deepEqual(activeTab.calls, [true, false, true]);
  assert.equal(activeTab.acceptButton.focused, false);
});

test('mudança em outra aba transfere o foco apenas se o controle em foco ficar oculto', () => {
  const key = 'bruna-analytics-consent-v1';
  const storage = new Map();
  const tab = createPrivacy(storage);
  tab.document.activeElement = tab.rejectButton;

  storage.set(key, 'accepted');
  tab.receiveStorageChange(key);
  assert.equal(tab.panel.hidden, true);
  assert.equal(tab.nextHeading.focused, true);

  tab.document.activeElement = tab.toggle;
  storage.clear();
  tab.receiveStorageChange(null);
  assert.equal(tab.toggle.hidden, true);
  assert.equal(tab.acceptButton.focused, true);
});

test('limpar o armazenamento reabre o painel e revoga sem aceitar eventos de outras chaves ou áreas', () => {
  const key = 'bruna-analytics-consent-v1';
  const storage = new Map([[key, 'accepted']]);
  const tab = createPrivacy(storage);

  storage.clear();
  tab.receiveStorageChange('unrelated-key');
  tab.receiveStorageChange(key, {});
  assert.deepEqual(tab.calls, [true]);

  tab.receiveStorageChange(null);
  assert.deepEqual(tab.calls, [true, false]);
  assert.equal(tab.panel.hidden, false);
  assert.equal(tab.toggle.hidden, true);
  assert.equal(tab.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(tab.acceptButton.focused, false);
});

test('Escape fecha a reabertura e devolve o foco sem alterar a escolha salva', () => {
  const key = 'bruna-analytics-consent-v1';
  const storage = new Map([[key, 'rejected']]);
  const { panel, secondaryToggle, calls } = createPrivacy(storage);

  secondaryToggle.click();
  assert.equal(panel.classList.contains('is-reopened'), true);
  panel.listeners.get('keydown')({ key: 'Escape' });

  assert.equal(panel.hidden, true);
  assert.equal(panel.classList.contains('is-reopened'), false);
  assert.equal(secondaryToggle.focused, true);
  assert.equal(storage.get(key), 'rejected');
  assert.deepEqual(calls, [false]);
});

test('markup acessivel, textos autorizados e layout fluido para telas estreitas', () => {
  assert.match(htmlSource, /role="region"[\s\S]*aria-labelledby="privacy-title"[\s\S]*aria-describedby="privacy-description"/);
  assert.match(htmlSource, /<h2 id="privacy-title">Privacidade e análise de visitas<\/h2>/);
  assert.match(htmlSource, /Usamos dados de navegação, com sua autorização, para entender o uso do site e melhorar sua experiência\. Você pode mudar sua escolha a qualquer momento\./);
  assert.match(htmlSource, /data-privacy-choice="accepted">Aceitar<\/button>/);
  assert.match(htmlSource, /data-privacy-choice="rejected">Recusar<\/button>/);
  assert.match(htmlSource, /<button class="privacy-control__accept" type="button"/);
  assert.match(htmlSource, /<button class="privacy-control__reject" type="button"/);
  assert.match(htmlSource, /aria-controls="privacy-panel"[\s\S]*aria-expanded="false"[\s\S]*aria-label="Privacidade"[\s\S]*<\/button>/);
  assert.match(scssSource, /width: min\(28rem, calc\(100vw - 2rem\)\)/);
  assert.match(scssSource, /min-height: 2\.75rem/);
  assert.match(scssSource, /@media \(min-width: 60rem\)[\s\S]*\.privacy-control__panel\.is-reopened[\s\S]*bottom: 1rem/);
  assert.match(htmlSource, /class="accessibility-tools__action privacy-control__toggle"/);
  assert.match(scssSource, /\.privacy-control__toggle--footer\s*\{\s*display: none;/);
  assert.match(scssSource, /\.accessibility-tools,[\s\S]*\.whatsapp-float\s*\{\s*display: none;/);
  assert.doesNotMatch(scssSource.slice(scssSource.indexOf('.privacy-control__panel {'), scssSource.indexOf('.whatsapp-float {')), /transition:/);
});
