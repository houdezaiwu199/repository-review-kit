import test from 'node:test';
import assert from 'node:assert/strict';
import { scanText, safePath, classifyText } from '../src/privacy.mjs';

test('sensitive values are classified and never copied into findings', () => {
  const token = 'gh' + 'p_' + 'A'.repeat(36);
  const address = ['person', 'internal.test'].join('@');
  const text = `const auth = '${token}';\ncontact: ${address}`;
  const findings = scanText(text);
  assert.deepEqual(findings.map(x => [x.rule, x.line]), [['github-token', 1], ['email-address', 2]]);
  assert.ok(!JSON.stringify(findings).includes(token));
  assert.ok(!JSON.stringify(findings).includes(address));
});

test('placeholder addresses and environment references are ignored', () => {
  assert.deepEqual(scanText('maintainer@example.invalid\npassword = "${APP_PASSWORD}"'), []);
});

test('credential URLs and private keys have credential severity', () => {
  const data = ['postgres://', 'alice:', 'longpassword', '@db.invalid.test'].join('') + '\n' + ['-----BEGIN ', 'PRIVATE KEY-----'].join('');
  assert.deepEqual(scanText(data).map(x => x.rule), ['credential-url', 'private-key']);
  assert.ok(scanText(data).every(x => x.severity === 'credential'));
});

test('placeholder-looking surroundings never suppress a credential match', () => {
  const token = 'gh' + 'p_' + 'D'.repeat(36);
  assert.ok(scanText(`const token = '${token}'; // example.invalid`).some(x => x.rule === 'github-token'));
  assert.ok(scanText('password = "actual-long-password" // placeholder').some(x => x.rule === 'assigned-secret'));
});

test('paths containing personal addresses are redacted', () => {
  assert.equal(safePath(['people/', 'someone', '@internal.test', '/data.mjs'].join('')), '<redacted-path>');
  assert.equal(safePath('src/util.mjs'), 'src/util.mjs');
});

test('binary and invalid UTF-8 are not silently classified as clean text', () => {
  assert.equal(classifyText(Buffer.from([0, 65])), null);
  assert.equal(classifyText(Buffer.from([255, 254])), null);
  assert.equal(classifyText(Buffer.from('ordinary text')), 'ordinary text');
});
