import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { initializeFaq } from './index.js';

function setup() {
  let mediaCallback;
  const motionPreference = {
    matches: false,
    addEventListener(type, fn) {
      if (type === 'change') mediaCallback = fn;
    },
  };
  const answer = {
    style: {},
    scrollHeight: 125,
    offsetHeight: 0,
    addEventListener() {},
  };
  const summary = {
    addEventListener(type, fn) {
      if (type === 'click') this.click = fn;
    },
  };
  const details = {
    open: false,
    dataset: {},
    querySelector(selector) {
      return selector === 'summary' ? summary : selector === 'p' ? answer : null;
    },
  };
  const document = { querySelectorAll: (selector) => selector === '.faq details' ? [details] : [] };
  initializeFaq({ document, motionPreference });
  return {
    details, summary, answer,
    setReducedMotion(matches) {
      motionPreference.matches = matches;
      mediaCallback({ matches });
    },
  };
}

test('perguntas frequentes são operáveis com details/summary e respostas associadas', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
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

test('FAQ interrompe animação em andamento ao ativar movimento reduzido', () => {
  const view = setup();
  assert.equal(view.answer.style.transition, 'height 400ms ease');
  view.summary.click({ preventDefault() {} });
  assert.equal(view.details.dataset.animating, 'true');
  view.setReducedMotion(true);
  assert.equal(view.answer.style.transition, 'none');
  assert.equal(view.details.open, true);
  assert.equal(view.answer.style.height, 'auto');
  assert.equal(view.details.dataset.animating, undefined);
  view.summary.click({ preventDefault() {} });
  assert.equal(view.details.open, false);
  assert.equal(view.answer.style.height, '0px');
  view.setReducedMotion(false);
  assert.equal(view.answer.style.transition, 'height 400ms ease');
});
