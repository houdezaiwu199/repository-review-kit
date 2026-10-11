import test from 'node:test';
import assert from 'node:assert/strict';
import { globMatcher } from '../../src/extended/glob.mjs';
test('globs distinguish one level from recursive matching and escape punctuation', () => {
  assert.equal(globMatcher('src/*.mjs')('src/nested/a.mjs'),false); assert.equal(globMatcher('**/*.mjs')('a.mjs'),true);
  assert.equal(globMatcher('a[1].mjs')('a[1].mjs'),true); assert.equal(globMatcher('a[1].mjs')('a1.mjs'),false);
  assert.throws(()=>globMatcher('../*'));
});
