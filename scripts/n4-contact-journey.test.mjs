import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');

const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
    .map(([, key, value]) => [key.toLowerCase(), value]),
);

const eventControls = [...html.matchAll(/<(a|button|summary)\b[^>]*\bdata-analytics-event=["'][^>]*>/gi)]
  .map(([tag, tagName]) => ({ tagName: tagName.toLowerCase(), attrs: attributes(tag) }));

const locations = new Set([
  'header_desktop', 'mobile_menu', 'hero', 'service_card', 'final_cta',
  'footer', 'floating', 'contact_section', 'testimonial_source', 'review_request',
]);
const services = new Set([
  'micropigmentacao', 'design_sobrancelhas', 'design_tintura', 'design_henna',
]);

test('CTAs de WhatsApp preservam destino, contexto e parâmetros de mensuração', () => {
  const links = eventControls.filter(({ attrs }) => attrs['data-analytics-event'] === 'whatsapp_booking_click');
  assert.ok(links.length >= 7, 'jornada de WhatsApp esperada não encontrada');
  const seenLocations = new Set();
  const seenServices = new Set();
  for (const { tagName, attrs } of links) {
    assert.equal(tagName, 'a', 'CTA de WhatsApp deve ser link navegável');
    assert.ok(locations.has(attrs['data-analytics-location']), 'localização GA4 não permitida');
    const target = new URL(attrs.href);
    assert.equal(target.protocol, 'https:');
    assert.equal(target.hostname, 'wa.me');
    assert.equal(target.pathname, '/5534992797055');
    assert.ok(target.searchParams.get('text')?.trim(), 'WhatsApp sem texto');
    const service = attrs['data-analytics-service'];
    if (service) {
      assert.ok(services.has(service), 'serviço GA4 não permitido');
      assert.equal(attrs['data-analytics-location'], 'service_card');
      seenServices.add(service);
    }
    seenLocations.add(attrs['data-analytics-location']);
  }
  for (const required of ['hero', 'header_desktop', 'mobile_menu', 'service_card', 'final_cta', 'floating']) {
    assert.ok(seenLocations.has(required), 'CTA ausente: ' + required);
  }
  for (const service of services) assert.ok(seenServices.has(service), 'serviço sem CTA: ' + service);
});

test('eventos de depoimentos, avaliações, FAQ e canais têm metadados reconhecidos', () => {
  const channels = new Set(['google', 'instagram', 'phone', 'google_maps']);
  const faqIds = new Set(['faq_01', 'faq_02', 'faq_03', 'faq_04', 'faq_05', 'faq_06']);
  const seenFaq = new Set();
  const supported = new Set([
    'whatsapp_booking_click', 'testimonial_source_click', 'review_request_click',
    'contact_channel_click', 'faq_open',
  ]);
  for (const { tagName, attrs } of eventControls) {
    const eventName = attrs['data-analytics-event'];
    assert.ok(supported.has(eventName), 'evento não suportado: ' + eventName);
    if (eventName === 'faq_open') {
      assert.equal(tagName, 'summary');
      const id = attrs['data-analytics-question'];
      assert.ok(faqIds.has(id), 'FAQ não reconhecida: ' + id);
      assert.ok(!seenFaq.has(id), 'FAQ duplicada: ' + id);
      seenFaq.add(id);
      continue;
    }
    if (eventName === 'whatsapp_booking_click') continue;
    assert.equal(tagName, 'a');
    const channel = attrs['data-analytics-channel'];
    assert.ok(channels.has(channel), 'canal não permitido: ' + channel);
    assert.ok(attrs.href, 'link sem destino');
    if (channel === 'phone') assert.match(attrs.href, /^tel:\+5534992797055$/);
    else {
      const url = new URL(attrs.href.replaceAll('&amp;', '&'));
      assert.equal(url.protocol, 'https:');
      const validHosts = {
        google: ['share.google', 'www.google.com.br', 'www.google.com'],
        instagram: ['www.instagram.com'],
        google_maps: ['maps.app.goo.gl'],
      };
      assert.ok(validHosts[channel]?.includes(url.hostname), 'destino externo inesperado: ' + url.hostname);
    }
  }
  assert.equal(seenFaq.size, faqIds.size);
});
