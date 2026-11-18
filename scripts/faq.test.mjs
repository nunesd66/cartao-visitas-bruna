import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('formulário de dúvidas permanece oculto sem JS e não serializa o texto', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const form = html.match(/<form\b([^>]*\bdata-whatsapp-form\b[^>]*)>([\s\S]*?)<\/form>/i);
  assert.ok(form, 'Formulário de dúvidas não encontrado');
  assert.match(form[1], /\shidden(?:\s|$)/i, 'Expor o formulário somente após registrar o envio pelo WhatsApp');

  const questionField = form[2].match(/<textarea\b[^>]*>/i)?.[0];
  assert.ok(questionField, 'Campo de dúvidas não encontrado');
  assert.doesNotMatch(questionField, /\sname\s*=/i, 'Impedir que o navegador serialize a dúvida no envio nativo');
});
