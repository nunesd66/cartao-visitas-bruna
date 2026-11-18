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
console.log('## Asset weight snapshot (repository files)');
console.log('');
console.log('Files: ' + files.length + ' | Total: ' + kb(total));
console.log('');
console.log('| File | Size |');
console.log('| --- | ---: |');
for (const { name, size } of files.slice(0, 15)) {
  console.log('| ' + name.replaceAll('|', '\\|') + ' | ' + kb(size) + ' |');
}
console.log('');
console.log('Local file sizes do not equal transfer bytes, compressed responses, or Core Web Vitals.');
