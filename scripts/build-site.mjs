import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'sass';
import { renderHtml } from './build-html.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const html = renderHtml();
const css = compile(join(root, 'src/styles/main.scss'), { style: 'expanded' }).css;
const assets = execFileSync('git', ['ls-files', '-z', '--', 'images', 'js', 'robots.txt', 'sitemap.xml'], {
  cwd: root,
  encoding: 'utf8',
}).split('\0').filter((path) => path && (!path.startsWith('js/') || (path.endsWith('.js') && !/(?:^|[./])test\.js$/.test(path))));

rmSync(output, { force: true, recursive: true });
mkdirSync(join(output, 'css'), { recursive: true });
writeFileSync(join(output, 'index.html'), html);
writeFileSync(join(output, 'css/style.css'), css + '\n');

for (const path of assets) {
  const target = join(output, path);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(root, path), target);
}
