import test from 'node:test';
import assert from 'node:assert/strict';
import { severityAtLeast, highestSeverity } from '../../src/extended/severity.mjs';
test('credential severity wins without assuming every finding is a credential', () => {
  assert.equal(highestSeverity([{severity:'privacy'}, {severity:'credential'}, {severity:'review'}]), 'credential');
  assert.equal(highestSeverity([]), null); assert.equal(severityAtLeast('review','credential'), false); assert.throws(() => severityAtLeast('unknown','review'));
});
