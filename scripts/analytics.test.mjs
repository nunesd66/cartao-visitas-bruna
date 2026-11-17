import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const analyticsSource = await readFile(new URL('../js/analytics.js', import.meta.url), 'utf8');

function createAnalytics(measurementId = '') {
  const scripts = [];
  const window = {
    location: {
      origin: 'https://beauty.example',
      pathname: '/cartao-visitas-bruna/',
      search: '?email=visitor@example.com',
      hash: '#faq',
    },
  };
  const document = {
    head: {
      appendChild(script) {
        scripts.push(script);
      },
    },
    querySelector(selector) {
      return selector === 'meta[name="ga4-measurement-id"]' ? { content: measurementId } : null;
    },
    referrer: 'https://search.example/search?q=visitor@example.com',
    createElement(name) {
      return { nodeName: name.toUpperCase() };
    },
  };

  vm.runInNewContext(analyticsSource, { window, document, URL });

  return {
    analytics: window.BrunaAnalytics,
    scripts,
    calls: () => Array.from(window.dataLayer || [], (entry) => JSON.parse(JSON.stringify([...entry]))),
  };
}

test('sin ID real, consentimento nao inicia fila, script ou eventos', () => {
  const { analytics, scripts, calls } = createAnalytics();

  assert.equal(analytics.setConsent(true), false);
  assert.equal(analytics.isEnabled(), false);
  assert.equal(analytics.track('whatsapp_booking_click', { cta_location: 'hero' }), false);
  assert.equal(scripts.length, 0);
  assert.deepEqual(calls(), []);
});

test('exige consentimento, carrega uma tag e configura o consent mode uma vez', () => {
  const { analytics, scripts, calls } = createAnalytics('G-TEST123456');

  assert.equal(analytics.track('faq_open', { faq_id: 'faq_01' }), false);
  assert.equal(scripts.length, 0);
  assert.equal(analytics.setConsent(true), true);
  assert.equal(analytics.isEnabled(), true);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-TEST123456');

  const commands = calls();
  assert.deepEqual(commands[0], [
    'consent',
    'default',
    {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
  ]);
  assert.deepEqual(commands[1].slice(0, 2), ['consent', 'update']);
  assert.equal(commands[1][2].analytics_storage, 'granted');
  assert.deepEqual(commands[3], [
    'config',
    'G-TEST123456',
    {
      send_page_view: false,
      page_location: 'https://beauty.example/cartao-visitas-bruna/',
      page_referrer: 'https://search.example',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    },
  ]);
  assert.deepEqual(commands[4], ['event', 'page_view']);
  assert.equal(commands.filter(([command, name]) => command === 'event' && name === 'page_view').length, 1);
  assert.doesNotMatch(JSON.stringify(commands), /visitor@example\.com/);

  analytics.setConsent(true);
  assert.equal(scripts.length, 1);
  assert.equal(calls().filter(([command]) => command === 'config').length, 1);
});

test('normaliza eventos e descarta parametros fora da lista permitida', () => {
  const { analytics, calls } = createAnalytics('G-TEST123456');
  analytics.setConsent(true);

  assert.equal(analytics.track('whatsapp_booking_click', {
    cta_location: 'service_card',
    service_name: 'design_henna',
    client_name: 'Nome da cliente',
    link_url: 'https://wa.me/?text=conteudo',
  }), true);
  assert.equal(analytics.track('contact_channel_click', { channel: 'google_maps' }), true);
  assert.equal(analytics.track('testimonial_source_click', { channel: 'instagram' }), true);
  assert.equal(analytics.track('review_request_click', { channel: 'google' }), true);
  assert.equal(analytics.track('faq_open', { faq_id: 'faq_03', question: 'texto da pergunta' }), true);
  assert.equal(analytics.track('unknown_event', { email: 'example@example.com' }), false);
  assert.equal(analytics.track('faq_open', { faq_id: 'not-an-approved-id' }), false);

  const events = calls().filter(([command, name]) => command === 'event' && name !== 'page_view');
  assert.deepEqual(events, [
    ['event', 'contact_intent', { channel: 'whatsapp', cta_location: 'service_card', service_name: 'design_henna' }],
    ['event', 'contact_channel_click', { channel: 'google_maps', cta_location: 'contact_section' }],
    ['event', 'contact_channel_click', { channel: 'instagram', cta_location: 'testimonial_source' }],
    ['event', 'contact_channel_click', { channel: 'google', cta_location: 'review_request' }],
    ['event', 'faq_open', { faq_id: 'faq_03' }],
  ]);
  assert.doesNotMatch(JSON.stringify(events), /Nome da cliente|conteudo|example@example\.com|texto da pergunta/);
});

test('revogacao bloqueia eventos e atualiza consentimento sem duplicar a tag', () => {
  const { analytics, scripts, calls } = createAnalytics('G-TEST123456');
  analytics.setConsent(true);
  analytics.setConsent(false);

  assert.equal(analytics.isEnabled(), false);
  assert.equal(analytics.track('whatsapp_booking_click', { cta_location: 'hero' }), false);
  assert.equal(scripts.length, 1);
  assert.equal(calls().at(-1)[0], 'consent');
  assert.deepEqual(calls().at(-1)[2], {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  analytics.setConsent(true);
  assert.equal(scripts.length, 1);
  assert.equal(calls().filter(([command]) => command === 'config').length, 1);
});
