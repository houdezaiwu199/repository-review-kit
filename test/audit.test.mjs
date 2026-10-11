import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { auditRepository, inspectRange } from '../src/audit.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'review-kit-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const run = (...args) => {
    const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, 'Fixture Git operation failed.');
    return result.stdout.trim();
  };
  run('init', '-b', 'main');
  run('config', 'user.name', 'Test Maintainer');
  run('config', 'user.email', 'maintainer@example.invalid');
  run('config', 'commit.gpgsign', 'false');
  run('config', 'core.autocrlf', 'false');
  return { root, run, save(path, data) { mkdirSync(join(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), data); }, commit(message) { run('add', '.'); run('commit', '-m', message); return run('rev-parse', 'HEAD'); } };
}

test('removed secrets are still reported from reachable history without exposing values', t => {
  const f = fixture(t);
  const token = 'gh' + 'p_' + 'B'.repeat(36);
  f.save('src/engine.mjs', `export const token = '${token}';\n`);
  const first = f.commit('Add initial engine');
  f.save('src/engine.mjs', 'export const value = 1;\n');
  const second = f.commit('Remove unsafe value');
  const report = auditRepository(f.root, { ranges: [`${first}..${second}`] });
  assert.equal(report.inventory.commits, 2);
  assert.equal(report.inventory.codeFiles, 1);
  assert.ok(report.privacy.findings.some(x => x.findings.some(y => y.rule === 'github-token')));
  assert.ok(!JSON.stringify(report).includes(token));
  assert.ok(!JSON.stringify(report).includes(f.root));
  assert.equal(report.milestones.ranges[0].additions, 1);
  assert.equal(report.milestones.ranges[0].deletions, 1);
  assert.equal(report.assessment.platformAdmission, 'not-evaluated');
});

test('all local refs are scanned while inventory follows selected revision', t => {
  const f = fixture(t);
  f.save('main.mjs', 'export const value = 1;\n');
  f.commit('Initial application');
  f.run('checkout', '-b', 'experiment');
  const token = 'gh' + 'p_' + 'C'.repeat(36);
  f.save('experiment.mjs', `export const auth = '${token}';\n`);
  f.commit('Experiment');
  f.run('checkout', 'main');
  const report = auditRepository(f.root);
  assert.equal(report.inventory.commits, 1);
  assert.equal(report.inventory.codeFiles, 1);
  assert.equal(report.privacy.scope, 'all-local-refs');
  assert.ok(report.privacy.findings.some(x => x.path === 'experiment.mjs'));
});

test('milestone code metrics exclude documentation and dependency output', t => {
  const f = fixture(t);
  f.save('src/file with space.mjs', 'export const a = 1;\n');
  const first = f.commit('Initial source');
  f.save('src/file with space.mjs', 'export const a = 1;\nexport const b = 2;\n');
  f.save('README.md', 'Documentation\n');
  f.save('vendor/generated.mjs', 'export const ignored = 1;\n');
  const second = f.commit('Add one source line');
  const report = auditRepository(f.root, { ranges: [`${first}..${second}`] });
  assert.equal(report.inventory.codeFiles, 1);
  assert.equal(report.milestones.ranges[0].codeFiles, 1);
  assert.equal(report.milestones.ranges[0].additions, 1);
});

test('disconnected milestone boundaries are explicitly reported', t => {
  const f = fixture(t);
  f.save('main.mjs', 'export const x = 1;\n');
  const a = f.commit('Initial');
  f.save('main.mjs', 'export const x = 2;\n');
  const b = f.commit('Second');
  f.save('main.mjs', 'export const x = 3;\n');
  const c = f.commit('Third');
  assert.equal(auditRepository(f.root, { ranges: [`${a}..${b}`, `${a}..${c}`] }).milestones.connected, false);
  assert.equal(auditRepository(f.root, { ranges: [`${a}..${b}`, `${b}..${c}`] }).milestones.connected, true);
  assert.throws(() => inspectRange(f.root, `${c}..${a}`));
});

test('binary objects are recorded as uninspected', t => {
  const f = fixture(t);
  f.save('image.bin', Buffer.from([0, 1, 2, 3]));
  f.commit('Binary asset');
  assert.equal(auditRepository(f.root).privacy.binaryObjects, 1);
});

test('revision options cannot be injected into Git arguments', t => {
  const f = fixture(t);
  f.save('main.mjs', 'export const x = 1;\n');
  f.commit('Initial');
  assert.throws(() => auditRepository(f.root, { revision: '--all' }));
  assert.throws(() => auditRepository(f.root, { revision: 'HEAD;echo unsafe' }));
});
