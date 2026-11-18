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
    const id = summary[1].match(/data-analytics-question=["']([^"']+)["']/i)?.[1];
    assert.ok(/^faq_0[1-6]$/.test(id || ''), 'identificador de FAQ inválido');
    assert.ok(!seenIds.has(id), 'FAQ duplicada');
    seenIds.add(id);
    assert.match(content.slice(summary[0].length), /<p>[\s\S]*?\S[\s\S]*?<\/p>/i, 'resposta vazia');
  }
});
