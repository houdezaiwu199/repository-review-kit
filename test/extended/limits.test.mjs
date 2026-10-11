import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLimits, defaultLimits } from '../../src/extended/limits.mjs';
test('limit overrides preserve defaults and reject unbounded input', () => {
  assert.equal(validateLimits({ objectBytes: 64 }).objectBytes, 64);
  assert.equal(validateLimits().totalBytes, defaultLimits.totalBytes);
  for (const bad of [{ totalBytes: 0 }, { objectBytes: Infinity }, { objectBytes: 400000000 }, { batchObjects: 1025 }, { typo: 1 }, []]) assert.throws(() => validateLimits(bad));
});
