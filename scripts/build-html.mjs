import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const defaultSourceDirectory = fileURLToPath(new URL('../src/', import.meta.url));
const defaultOutput = fileURLToPath(new URL('../index.html', import.meta.url));
const fragmentPath = /^(?:sections|components)\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;

export function renderHtml(sourceDirectory = defaultSourceDirectory) {
  function renderFile(file, parents) {
    const html = readFileSync(resolve(sourceDirectory, file), 'utf8');
    // Each include replaces its whole line. Keep the fragment's indentation and line endings.
    return html.replace(/^[ \t]*<!--[ \t]*include:[ \t]*([^\r\n]*?)[ \t]*-->[ \t]*(?:\r?\n|$)/gm,
      (_, fragment) => {
        if (!fragmentPath.test(fragment)) {
          throw new Error(`Fragmento HTML inválido em ${file}: ${fragment}`);
        }
        const chain = [...parents, file];
        if (chain.includes(fragment)) {
          throw new Error(`Inclusão HTML circular: ${[...chain, fragment].join(' → ')}`);
        }
        return renderFile(fragment, chain);
      });
  }

  return renderFile('index.html', []);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  if (process.argv.length > 3) throw new Error('Uso: node scripts/build-html.mjs [arquivo-saída]');
  const output = process.argv[2] ? resolve(process.argv[2]) : defaultOutput;
  const html = renderHtml();
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, html);
}
