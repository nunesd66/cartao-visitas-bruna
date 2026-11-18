import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [ref, address = 'https://nunesd66.github.io/cartao-visitas-bruna/'] = process.argv.slice(2);
if (!ref) {
  console.error('Uso: node scripts/verify-release.mjs <ref-do-deploy> [base-url]');
  process.exit(2);
}

let base;
try {
  base = new URL(address);
} catch {
  throw new Error('Informe uma URL base válida');
}
const localHttp = base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname);
if (base.protocol !== 'https:' && !localHttp) {
  throw new Error('Informe uma URL HTTPS ou um servidor HTTP local');
}
if (base.search || base.hash || base.username || base.password) {
  throw new Error('Informe a URL base sem parâmetros, fragmento ou credenciais');
}
if (!base.pathname.endsWith('/')) base.pathname += '/';

const root = fileURLToPath(new URL('..', import.meta.url));
const git = (...args) => execFileSync('git', args, {
  cwd: root,
  maxBuffer: 100 * 1024 * 1024,
});
const commit = git('rev-parse', '--verify', '--end-of-options', ref + '^{commit}').toString().trim();
const paths = git(
  'ls-tree', '-rz', '--name-only', commit, '--',
  'index.html', 'css/style.css', 'js', 'images', 'robots.txt', 'sitemap.xml',
).toString().split('\0').filter(Boolean);
if (!paths.includes('index.html')) throw new Error('A revisão esperada precisa conter index.html');

async function verify(path) {
  const url = new URL(path === 'index.html' ? './' : path.split('/').map(encodeURIComponent).join('/'), base);
  try {
    const expected = git('cat-file', 'blob', commit + ':' + path);
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (response.status !== 200) return 'HTTP ' + response.status;
    const actual = Buffer.from(await response.arrayBuffer());
    return actual.equals(expected) ? null : 'conteúdo diverge da revisão esperada';
  } catch (error) {
    return error.message;
  }
}

console.log('Revisão esperada: ' + commit);
console.log('Ambiente: ' + base);
let failures = 0;
for (let start = 0; start < paths.length; start += 5) {
  const batch = paths.slice(start, start + 5);
  const results = await Promise.all(batch.map(verify));
  results.forEach((result, index) => {
    if (result) failures++;
    console.log(result ? 'FAIL ' + batch[index] + ' — ' + result : 'PASS ' + batch[index]);
  });
}
console.log('Resultado: ' + (paths.length - failures) + '/' + paths.length + ' arquivos iguais');
process.exitCode = failures ? 1 : 0;
