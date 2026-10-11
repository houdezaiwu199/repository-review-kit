import { extname } from 'node:path';
import { git, resolveCommit, readObjects } from './git.mjs';
import { scanText, safePath, classifyText } from './privacy.mjs';

const codeExtensions = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.c', '.h', '.cpp', '.cs', '.rb', '.php', '.swift', '.kt', '.scala', '.sql', '.sh', '.vue', '.svelte', '.prisma']);
const excluded = /(^|\/)(?:node_modules|vendor|dist|build|coverage|\.next|\.cache)(?:\/|$)/;
const maxObjectBytes = 2 * 1024 * 1024;
const maxInspectedBytes = 256 * 1024 * 1024;

export function auditRepository(root, { revision = 'HEAD', ranges = [] } = {}) {
  const head = resolveCommit(root, revision);
  const commits = git(root, ['rev-list', head]).trim().split('\n').filter(Boolean);
  const paths = git(root, ['ls-tree', '-r', '--name-only', '-z', head]).split('\0').filter(Boolean);
  const codeFiles = paths.filter(path => codeExtensions.has(extname(path).toLowerCase()) && !excluded.test(path));
  const history = git(root, ['log', '--format=%cI', head]).trim().split('\n').filter(Boolean).sort();

  // Inventory follows the selected revision; privacy scans every local ref.
  const objectRows = git(root, ['rev-list', '--objects', '--all', head]).trim().split('\n').filter(Boolean);
  const objects = new Map();
  for (const row of objectRows) {
    const split = row.indexOf(' ');
    const id = split < 0 ? row : row.slice(0, split);
    objects.set(id, split < 0 ? null : safePath(row.slice(split + 1)));
  }
  const results = [];
  const scan = { scope: 'all-local-refs', textObjects: 0, binaryObjects: 0, skippedLargeObjects: 0, skippedBudgetObjects: 0, inspectedBytes: 0 };

  // Query sizes before reading content so a large binary cannot exhaust memory.
  const objectInfo = git(root, ['cat-file', '--batch-all-objects', '--batch-check=%(objectname) %(objecttype) %(objectsize)']).trim().split('\n');
  const readable = [];
  for (const row of objectInfo) {
    const [id, type, sizeString] = row.split(' ');
    const size = Number(sizeString);
    if (!objects.has(id) || !['blob', 'commit', 'tag'].includes(type)) continue;
    if (size > maxObjectBytes) { scan.skippedLargeObjects++; continue; }
    if (scan.inspectedBytes + size > maxInspectedBytes) { scan.skippedBudgetObjects++; continue; }
    scan.inspectedBytes += size;
    readable.push(id);
  }
  readObjects(root, readable, ({ id, type, data }) => {
    const text = classifyText(data);
    if (text === null) { scan.binaryObjects++; return; }
    scan.textObjects++;
    const findings = scanText(text);
    if (findings.length) results.push({ object: id, type, path: objects.get(id), findings });
  });
  const milestones = ranges.map(range => inspectRange(root, range));
  const connected = milestones.every((range, i) => i === 0 || milestones[i - 1].to === range.from);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    head,
    inventory: { commits: commits.length, trackedFiles: paths.length, codeFiles: codeFiles.length, earliestCommitterDate: history[0], latestCommitterDate: history.at(-1) },
    privacy: { ...scan, limitations: ['Pattern findings require review; absence of findings does not establish complete anonymization.', 'Binary, oversized and budget-skipped objects are not inspected.', 'Unreachable objects, reflogs, working-tree files and remote-only refs are outside this scan.', 'Git object paths are representative locations, not a complete list of historical occurrences.'], findings: results },
    milestones: { connected, ranges: milestones },
    assessment: { platformAdmission: 'not-evaluated', ownership: 'not-verified', repositoryVisibilityHistory: 'not-verified' }
  };
}

export function inspectRange(root, value) {
  const parts = value.split('..');
  if (parts.length !== 2 || !parts.every(Boolean)) throw new Error('Use a FROM..TO milestone range.');
  const from = resolveCommit(root, parts[0]);
  const to = resolveCommit(root, parts[1]);
  if (from === to) throw new Error('A milestone needs two distinct commits.');
  // Ancestry is mandatory: arbitrary unrelated endpoints are not a milestone.
  git(root, ['merge-base', '--is-ancestor', from, to]);
  const rows = git(root, ['diff', '--numstat', '-z', '--no-renames', from, to]).split('\0').filter(Boolean);
  let codeFiles = 0, additions = 0, deletions = 0, binaryFiles = 0;
  for (const row of rows) {
    const match = /^(\d+|-)\t(\d+|-)\t([\s\S]+)$/.exec(row);
    if (!match) throw new Error('Unexpected Git diff format.');
    const [, added, removed, path] = match;
    if (!codeExtensions.has(extname(path).toLowerCase()) || excluded.test(path)) continue;
    codeFiles++;
    if (added === '-' || removed === '-') { binaryFiles++; continue; }
    additions += Number(added); deletions += Number(removed);
  }
  return { from, to, commits: Number(git(root, ['rev-list', '--count', `${from}..${to}`]).trim()), codeFiles, additions, deletions, binaryFiles, method: 'net-endpoint-diff' };
}
