import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name), 'utf8');
const html = read('index.html');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');

function tagContent(kind, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((value) => value.includes(kind + '="' + key + '"'));
  assert.ok(tag, 'Missing meta ' + kind + '=' + key);
  const value = tag.match(/\bcontent=["']([^"']+)["']/i)?.[1];
  assert.ok(value, 'Empty meta content for ' + key);
  return value;
}

test('canonical, Open Graph, sitemap e JSON-LD apontam para a mesma URL', () => {
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  assert.ok(canonical, 'Canonical missing');
  assert.equal(new URL(canonical).protocol, 'https:');
  assert.ok(canonical.endsWith('/'), 'Canonical should end in /');
  assert.equal(tagContent('property', 'og:url'), canonical);
  assert.ok(sitemap.includes('<loc>' + canonical + '</loc>'), 'Sitemap URL differs');
  assert.ok(robots.includes('Sitemap: ' + canonical + 'sitemap.xml'), 'Robots sitemap URL differs');
  const ld = html.match(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/i)?.[1];
  assert.ok(ld, 'JSON-LD missing');
  const schema = JSON.parse(ld);
  assert.equal(schema.url, canonical);
  assert.equal(schema['@type'], 'BeautySalon');
  assert.equal(schema.name, 'Bruna Eduarda Beauty');
});

test('metadados essenciais e imagem social permanecem disponiveis', () => {
  assert.match(html, /<html\s+lang="pt-BR"/i);
  assert.match(html, /<title>[^<]+<\/title>/i);
  tagContent('name', 'description');
  tagContent('property', 'og:title');
  tagContent('property', 'og:description');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)[1];
  const image = tagContent('property', 'og:image');
  assert.ok(image.startsWith(canonical), 'Social image outside site root');
  const imagePath = decodeURIComponent(new URL(image).pathname.slice(new URL(canonical).pathname.length));
  assert.ok(imagePath && existsSync(path.join(root, imagePath)), 'Social image missing locally');
  assert.ok(!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html), 'Unexpected noindex');
});


test('dados estruturados mantêm contatos e imagem coerentes com o site', () => {
  const ld = html.match(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/i)?.[1];
  assert.ok(ld);
  const schema = JSON.parse(ld);
  const phones = [...html.matchAll(/href="tel:([^"]+)"/g)].map(([, number]) => number);
  assert.ok(phones.length > 0, 'telefone de contato ausente');
  assert.ok(phones.includes(schema.telephone), 'telefone JSON-LD diverge do contato');
  assert.equal(schema.image, tagContent('property', 'og:image'));
  assert.ok(schema.sameAs?.startsWith('https://www.instagram.com/'));
  assert.ok(html.includes('href="' + schema.sameAs + '"'), 'Instagram JSON-LD sem link correspondente');
  assert.equal(schema.address?.['@type'], 'PostalAddress');
  assert.equal(schema.address?.addressCountry, 'BR');
  assert.ok(schema.address?.streetAddress && schema.address?.addressLocality);
});
