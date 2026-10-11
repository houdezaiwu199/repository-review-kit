import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRules, ruleCatalogue } from '../../src/extended/rule-catalog.mjs';
test('rule configuration requires recognised unique IDs', () => {
  assert.equal(ruleCatalogue.length, 7); assert.equal(selectRules(['credential-url'])[0].severity,'credential');
  assert.throws(() => selectRules(['credential-url','credential-url'])); assert.throws(() => selectRules(['typo']));
});
