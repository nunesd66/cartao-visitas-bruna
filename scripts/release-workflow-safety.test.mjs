import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../.github/workflows/verify-pages-release.yml', import.meta.url), 'utf8');

test('verification workflow preserves exit codes through tee', () => {
  assert.match(workflow, /shell:\s*bash/);
  assert.match(workflow, /run:\s*\|\s*\n\s*set -euo pipefail/);
  assert.match(workflow, /node scripts\/verify-release\.mjs[^\n]*\|\s*tee/);
  assert.match(workflow, /node scripts\/smoke-public\.mjs[^\n]*\|\s*tee/);
});
