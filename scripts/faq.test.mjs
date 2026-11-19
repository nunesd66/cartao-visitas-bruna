import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

test('formulário de dúvidas permanece oculto sem JS e não serializa o texto', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const form = html.match(/<form\b([^>]*\bdata-whatsapp-form\b[^>]*)>([\s\S]*?)<\/form>/i);
  assert.ok(form, 'Formulário de dúvidas não encontrado');
  assert.match(form[1], /\shidden(?:\s|$)/i, 'Expor o formulário somente após registrar o envio pelo WhatsApp');

  const questionField = form[2].match(/<textarea\b[^>]*>/i)?.[0];
  assert.ok(questionField, 'Campo de dúvidas não encontrado');
  assert.doesNotMatch(questionField, /\sname\s*=/i, 'Impedir que o navegador serialize a dúvida no envio nativo');
});


test('pergunta via WhatsApp é codificada e não é enviada quando está vazia', () => {
  const source = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const start = source.indexOf("document.querySelectorAll('[data-whatsapp-form]')");
  assert.ok(start >= 0, 'formulário de WhatsApp encontrado');
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
  vm.runInNewContext(source.slice(start), { document, window, encodeURIComponent });
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

test('perguntas frequentes são operáveis com details/summary e respostas associadas', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const section = html.match(/<section class="section faq"[\s\S]*?<\/section>/i)?.[0];
  assert.ok(section, 'Seção de perguntas frequentes ausente');
  const entries = [...section.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)];
  assert.equal(entries.length, 6);
  const seenIds = new Set();
  for (const [, content] of entries) {
    const summary = content.match(/^\s*<summary\b([^>]*)>([\s\S]*?)<\/summary>/i);
    assert.ok(summary, 'summary deve ser primeiro conteúdo do details');
    assert.ok(summary[2].replace(/<[^>]*>/g, '').trim(), 'pergunta precisa de nome acessível');
    assert.match(summary[2], /<span class="faq__indicator" aria-hidden="true"><\/span>/, 'ícone decorativo deve ficar fora do nome acessível');
    const id = summary[1].match(/data-analytics-question=["']([^"']+)["']/i)?.[1];
    assert.ok(/^faq_0[1-6]$/.test(id || ''), 'identificador de FAQ inválido');
    assert.ok(!seenIds.has(id), 'FAQ duplicada');
    seenIds.add(id);
    assert.match(content.slice(summary[0].length), /<p>[\s\S]*?\S[\s\S]*?<\/p>/i, 'resposta vazia');
  }
});
