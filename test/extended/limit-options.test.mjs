import test from 'node:test';
import assert from 'node:assert/strict';
import { parseByteSize, formatByteSize } from '../../src/extended/limit-options.mjs';
test('byte size parsing is exact and does not accept decimals or unsafe values', () => {
  assert.equal(parseByteSize('2MiB'), 2097152); assert.equal(formatByteSize(2048), '2KiB');
  assert.equal(formatByteSize(0), '0B');
  for (const v of ['1.5MiB', '-1B', '0', '5MB', '9007199254740992']) assert.throws(() => parseByteSize(v));
});
