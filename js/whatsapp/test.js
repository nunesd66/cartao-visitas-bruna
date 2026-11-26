import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { initializeWhatsAppForm } from './index.js';

test('formulário de dúvidas permanece oculto sem JS e não serializa o texto', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const form = html.match(/<form\b([^>]*\bdata-whatsapp-form\b[^>]*)>([\s\S]*?)<\/form>/i);
  assert.ok(form, 'Formulário de dúvidas não encontrado');
  assert.match(form[1], /\shidden(?:\s|$)/i, 'Expor o formulário somente após registrar o envio pelo WhatsApp');

  const questionField = form[2].match(/<textarea\b[^>]*>/i)?.[0];
  assert.ok(questionField, 'Campo de dúvidas não encontrado');
  assert.doesNotMatch(questionField, /\sname\s*=/i, 'Impedir que o navegador serialize a dúvida no envio nativo');
});


test('pergunta via WhatsApp é codificada e não é enviada quando está vazia', () => {
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
  let prevented = 0;
  const submit = () => handlers.get('submit')({ preventDefault() { prevented++; } });
  questionField.value = '  ';
  submit();
  assert.equal(submissions.length, 0);
  assert.equal(validityMessage, 'Digite sua dúvida antes de enviar.');
  assert.equal(reports, 1);
  questionField.value = 'Pode ser às 9h? & sábado #1';
  inputHandlers.get('input')();
  assert.equal(validityMessage, '');
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
