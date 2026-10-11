import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFiles } from '../../src/extended/file-selector.mjs';
test('include and exclude selectors keep deterministic unique source paths', () => {
  assert.deepEqual(selectFiles(['src/a.mjs','src/a.mjs','test/x.mjs','vendor/a.mjs'],{include:['**/*.mjs'],exclude:['test/**']}),['src/a.mjs']);
  assert.deepEqual(selectFiles(['x.mjs'],{include:[]}),[]); assert.throws(()=>selectFiles(['../x']));
});
