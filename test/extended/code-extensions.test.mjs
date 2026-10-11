import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceLanguage } from '../../src/extended/code-extensions.mjs';
test('language classification handles case, Windows paths and extensionless names', () => {
  assert.equal(sourceLanguage('src\\Main.TSX'), 'typescript'); assert.equal(sourceLanguage('src/a.mjs'), 'javascript');
  assert.equal(sourceLanguage('docs/README.md'), null); assert.equal(sourceLanguage('LICENSE'), null); assert.equal(sourceLanguage('.gitignore'), null);
});
