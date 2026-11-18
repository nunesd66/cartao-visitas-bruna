import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const references = [];
const realRoot = realpathSync(root);

const hasExactCase = (relative) => {
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    try {
      if (!readdirSync(current).includes(segment)) return false;
    } catch {
      return false;
    }
    current = path.join(current, segment);
  }
  return true;
};


const addReference = (sourceFile, value) => {
  const reference = value.trim();
  if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return;

  let pathname;
  try {
    pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  } catch (error) {
    if (!(error instanceof URIError)) throw error;
    references.push({ sourceFile, reference, error: 'invalid percent-encoding in local asset URL' });
    return;
  }
  const target = path.resolve(path.dirname(sourceFile), pathname);
  const relativeTarget = path.relative(root, target);

  if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
    references.push({ sourceFile, reference, error: 'path escapes the project root' });
  } else if (!existsSync(target) || !hasExactCase(relativeTarget)) {
    references.push({ sourceFile, reference, error: 'file does not exist (or its case differs)' });
  } else {
    const resolvedTarget = realpathSync(target);
    const realRelative = path.relative(realRoot, resolvedTarget);
    if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
      references.push({ sourceFile, reference, error: 'asset symlink escapes the project root' });
    }
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
