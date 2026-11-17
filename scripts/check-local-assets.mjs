import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const references = [];

const addReference = (sourceFile, value) => {
  const reference = value.trim();
  if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return;

  const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  const target = path.resolve(path.dirname(sourceFile), pathname);
  const relativeTarget = path.relative(root, target);

  if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
    references.push({ sourceFile, reference, error: 'path escapes the project root' });
  } else if (!existsSync(target)) {
    references.push({ sourceFile, reference, error: 'file does not exist (or its case differs)' });
  }
};

const htmlPath = path.join(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
  addReference(htmlPath, match[1]);
}

for (const cssName of ['css/style.css', 'css/style.scss']) {
  const cssPath = path.join(root, cssName);
  const css = readFileSync(cssPath, 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    addReference(cssPath, match[1]);
  }
}

if (references.length) {
  for (const { sourceFile, reference, error } of references) {
    console.error(`${path.relative(root, sourceFile)}: ${reference} — ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('All local HTML, CSS and SCSS asset references resolve with exact path case.');
}
