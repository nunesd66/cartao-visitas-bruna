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


const addReference = (sourceFile, value, baseDirectory = path.dirname(sourceFile)) => {
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
  const target = path.resolve(baseDirectory, pathname);
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

const addStylesheetReferences = (sourceFile, baseDirectory) => {
  const stylesheet = readFileSync(sourceFile, 'utf8');
  for (const match of stylesheet.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    addReference(sourceFile, match[1], baseDirectory);
  }
};

const cssPath = path.join(root, 'css/style.css');
addStylesheetReferences(cssPath);

// Sass preserves the URLs. They are resolved relative to the emitted CSS.
const scssRoot = path.join(root, 'src');
for (const entry of readdirSync(scssRoot, { recursive: true, withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.scss')) {
    addStylesheetReferences(path.join(entry.parentPath, entry.name), path.dirname(cssPath));
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
