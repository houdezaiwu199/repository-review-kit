import test from 'node:test';
import assert from 'node:assert/strict';
import { repositoryPath, isGeneratedPath } from '../../src/extended/path-filter.mjs';
test('path filtering rejects traversal and distinguishes similarly named source folders', () => {
  assert.equal(repositoryPath('src\\a.mjs'), 'src/a.mjs'); assert.equal(isGeneratedPath('app/node_modules/a.js'), true);
  assert.equal(isGeneratedPath('src/building/a.js'), false);
  for (const v of ['/etc/data', 'C:/data', '../a', 'a//b', 'a/../b', 'a\u0000b']) assert.throws(() => repositoryPath(v));
});
