import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const folders = ['images', 'css', 'js'];
const files = [];
for (const folder of folders) {
  const pending = [folder];
  while (pending.length) {
    const relative = pending.pop();
    const absolute = path.join(root, relative);
    if (!existsSync(absolute)) continue;
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const child = path.join(relative, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) pending.push(child);
      else if (entry.isFile()) files.push({ name: child.replaceAll(path.sep, '/'), size: lstatSync(path.join(root, child)).size });
    }
  }
}
files.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name));
const total = files.reduce((sum, file) => sum + file.size, 0);
const kb = (bytes) => (bytes / 1024).toFixed(1) + ' KiB';
const tableName = (name) => name.replaceAll('|', '\\|');
console.log('## Asset weight snapshot (repository files)');
console.log('');
console.log('Files: ' + files.length + ' | Total: ' + kb(total));
console.log('');
console.log('| File | Size |');
console.log('| --- | ---: |');
for (const { name, size } of files.slice(0, 15)) {
  console.log('| ' + tableName(name) + ' | ' + kb(size) + ' |');
}
console.log('');

const [base] = process.argv.slice(2);
if (base) {
  if (!/^[\da-f]{40}$/i.test(base)) throw new Error('Informe o SHA completo da revisão base.');
  const priorFiles = new Map();
  const tree = execFileSync('git', ['ls-tree', '-rlz', base, '--', ...folders], { cwd: root, encoding: 'utf8' });
  for (const entry of tree.split('\0').filter(Boolean)) {
    const separator = entry.indexOf('\t');
    const [mode, type, , size] = entry.slice(0, separator).trim().split(/\s+/);
    if (type === 'blob' && (mode === '100644' || mode === '100755')) {
      priorFiles.set(entry.slice(separator + 1), Number(size));
    }
  }

  const changes = [];
  for (const { name, size } of files) {
    const delta = size - (priorFiles.get(name) ?? 0);
    if (delta) changes.push({ name, delta });
    priorFiles.delete(name);
  }
  for (const [name, size] of priorFiles) {
    if (size) changes.push({ name, delta: -size });
  }
  changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.name.localeCompare(b.name));
  const signedBytes = (bytes) => (bytes > 0 ? '+' : '') + bytes.toLocaleString('en-US') + ' B';
  console.log('### Asset size changes from `' + base + '`');
  console.log('');
  console.log('Net change: ' + signedBytes(changes.reduce((sum, change) => sum + change.delta, 0)));
  if (changes.length) {
    console.log('');
    console.log('| File | Change |');
    console.log('| --- | ---: |');
    for (const { name, delta } of changes) {
      console.log('| ' + tableName(name) + ' | ' + signedBytes(delta) + ' |');
    }
  }
  console.log('');
}
console.log('Local file sizes do not equal transfer bytes, compressed responses, or Core Web Vitals.');
