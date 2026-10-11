import { spawnSync } from 'node:child_process';

export function git(root, args, { binary = false, maxBuffer = 64 * 1024 * 1024 } = {}) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: binary ? null : 'utf8',
    timeout: 30_000,
    maxBuffer,
    windowsHide: true,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' }
  });
  if (result.error || result.status !== 0) {
    // Git stderr can contain credentials, URLs and personal absolute paths.
    throw new Error('Git could not complete the local repository operation.');
  }
  return result.stdout;
}

export function resolveCommit(root, revision) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._/~^+-]*$/.test(revision) || revision.length > 200) {
    throw new Error('Use a commit SHA or a local revision name without whitespace.');
  }
  return git(root, ['rev-parse', '--verify', '--end-of-options', `${revision}^{commit}`]).trim();
}

export function readObjects(root, ids, visit) {
  // Bound each batch, and avoid one child process per object in larger repositories.
  for (let index = 0; index < ids.length; index += 32) {
    const batch = ids.slice(index, index + 32);
    const result = spawnSync('git', ['-C', root, 'cat-file', '--batch'], {
      input: batch.join('\n') + '\n',
      timeout: 30_000,
      maxBuffer: 128 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' }
    });
    if (result.error || result.status !== 0) throw new Error('Git object reading failed.');
    let cursor = 0;
    for (const expected of batch) {
      const newline = result.stdout.indexOf(10, cursor);
      if (newline < 0) throw new Error('Incomplete Git object stream.');
      const header = result.stdout.subarray(cursor, newline).toString('ascii');
      const match = /^([a-f0-9]{40,64}) (blob|commit|tree|tag) (\d+)$/.exec(header);
      if (!match || match[1] !== expected) throw new Error('Unexpected Git object stream.');
      const size = Number(match[3]);
      cursor = newline + 1;
      if (cursor + size >= result.stdout.length) throw new Error('Incomplete Git object body.');
      visit({ id: expected, type: match[2], data: result.stdout.subarray(cursor, cursor + size) });
      cursor += size + 1;
    }
  }
}
