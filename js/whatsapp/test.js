import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { initializeWhatsAppForm } from './index.js';

test('botão principal de agendamento abre a mensagem de agendamento', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const heroLink = html.match(/<a\b[^>]*data-analytics-location="hero"[^>]*>/)?.[0];
  assert.ok(heroLink);
  const url = new URL(heroLink.match(/\bhref="([^"]+)"/)[1]);
  assert.equal(url.origin + url.pathname, 'https://wa.me/5534992797055');
  assert.equal(url.searchParams.get('text'), 'Olá! Gostaria de agendar um horário.');
});

test('formulário de dúvidas permanece oculto sem JS e não serializa o texto', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const forms = [...html.matchAll(/<form\b([^>]*\bdata-whatsapp-form\b[^>]*)>([\s\S]*?)<\/form>/gi)];
  assert.equal(forms.length, 2);
  for (const [, attributes, contents] of forms) {
    assert.match(attributes, /\shidden(?:\s|$)/i);
    const field = contents.match(/<textarea\b[^>]*>/i)?.[0];
    assert.ok(field);
    assert.doesNotMatch(field, /\sname\s*=/i);
  }
});


function setupForm(whatsappForm) {
  const submissions = [];
  const inputHandlers = new Map();
  let validityMessage;
  let reports = 0;
  const questionField = {
    value: '',
    scrollHeight: 48,
    style: {},
    addEventListener(event, handler) { inputHandlers.set(event, handler); },
    setCustomValidity(message) { validityMessage = message; },
    reportValidity() { reports++; },
  };
  const handlers = new Map();
  const form = {
    dataset: { whatsappForm },
    hidden: true,
    querySelector: () => questionField,
    addEventListener(type, callback) { handlers.set(type, callback); },
  };
  const document = {
    querySelectorAll: (selector) => selector === '[data-whatsapp-form]' ? [form] : [],
  };
  const window = { open(...args) { submissions.push(args); } };
  initializeWhatsAppForm({ document, window });
  assert.equal(form.hidden, false);
  return { questionField, inputHandlers, handlers, submissions, validity: () => ({ validityMessage, reports }) };
}

test('pergunta via WhatsApp é codificada e não é enviada quando está vazia', () => {
  const { questionField, inputHandlers, handlers, submissions, validity } = setupForm('');
  let prevented = 0;
  const submit = () => handlers.get('submit')({ preventDefault() { prevented++; } });
  questionField.value = '  ';
  submit();
  assert.equal(submissions.length, 0);
  assert.deepEqual(validity(), { validityMessage: 'Digite sua dúvida antes de enviar.', reports: 1 });
  questionField.value = 'Pode ser às 9h? & sábado #1';
  inputHandlers.get('input')();
  assert.equal(validity().validityMessage, '');
  submit();
  assert.equal(prevented, 2);
  assert.equal(submissions.length, 1);
  const [url, target, features] = submissions[0];
  const parsed = new URL(url);
  assert.equal(parsed.hostname, 'wa.me');
  assert.equal(parsed.pathname, '/5534992797055');
  assert.ok(parsed.searchParams.get('text').includes('Pode ser às 9h? & sábado #1'));
  assert.equal(target, '_blank');
  assert.equal(features, 'noopener,noreferrer');
});

test('disponibilidade mantém horários e quebras de linha na mensagem do WhatsApp', () => {
  const { questionField, handlers, submissions, validity } = setupForm('availability');
  const submit = () => handlers.get('submit')({ preventDefault() {} });
  questionField.value = '  ';
  submit();
  assert.deepEqual(validity(), {
    validityMessage: 'Informe os dias e horários em que você pode ser atendida.',
    reports: 1,
  });
  assert.equal(submissions.length, 0);

  questionField.value = '  Segunda a sexta, das 17h às 19h\nSábado, às 9h & às 11h  ';
  submit();
  const url = new URL(submissions[0][0]);
  assert.equal(url.pathname, '/5534992797055');
  assert.equal(url.searchParams.get('text'), 'Olá! Gostaria de agendar um horário. Minha disponibilidade:\nSegunda a sexta, das 17h às 19h\nSábado, às 9h & às 11h\nVocê tem algum horário disponível nesse período?');
});
