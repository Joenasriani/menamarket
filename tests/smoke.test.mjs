import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const required = [
  'apps/web/app/layout.tsx',
  'apps/web/app/page.tsx',
  'apps/admin/app/layout.tsx',
  'apps/admin/app/page.tsx',
  'packages/ui/src/index.ts'
];

test('M02 shell files exist', () => {
  for (const file of required) {
    assert.equal(fs.existsSync(new URL(`../${file}`, import.meta.url)), true, `Missing ${file}`);
  }
});
