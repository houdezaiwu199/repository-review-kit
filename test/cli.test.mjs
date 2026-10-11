import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../src/cli.mjs', import.meta.url));

test('help explains the actual invocation', () => {
  const result = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /FROM\.\.TO/);
});

test('invalid input does not print the supplied private path', () => {
  const privatePath = 'private-client-folder-do-not-disclose';
  const result = spawnSync(process.execPath, [cli, 'audit', privatePath], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 1);
  assert.ok(!result.stderr.includes(privatePath));
});
