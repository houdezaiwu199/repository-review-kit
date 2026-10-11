#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditRepository } from './audit.mjs';

function main(args) {
  if (!args.length || args[0] === '--help') {
    console.log('Usage: node src/cli.mjs audit <local-repository> [--revision REV] [--range FROM..TO] [--out report.json]');
    return;
  }
  if (args[0] !== 'audit' || !args[1] || args[1].startsWith('--')) throw new Error('Supply audit and a local repository path.');
  const root = resolve(args[1]);
  const options = { ranges: [] };
  let output;
  for (let index = 2; index < args.length; index += 2) {
    const key = args[index], value = args[index + 1];
    if (!value || value.startsWith('--')) throw new Error('Each option needs a value.');
    if (key === '--range') options.ranges.push(value);
    else if (key === '--revision') options.revision = value;
    else if (key === '--out' && !output) output = resolve(value);
    else throw new Error('Unknown or repeated option.');
  }
  const report = auditRepository(root, options);
  const serialized = JSON.stringify(report, null, 2) + '\n';
  if (output) writeFileSync(output, serialized, { flag: 'wx', mode: 0o600 });
  else process.stdout.write(serialized);
  if (report.privacy.findings.length || report.privacy.skippedLargeObjects || report.privacy.skippedBudgetObjects || !report.milestones.connected) process.exitCode = 2;
}

try { main(process.argv.slice(2)); }
catch {
  console.error('Audit failed. Check local Git access, revisions, arguments and output file availability.');
  process.exitCode = 1;
}
