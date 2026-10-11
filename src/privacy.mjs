const patterns = [
  { rule: 'private-key', severity: 'credential', regex: /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/g },
  { rule: 'github-token', severity: 'credential', regex: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g },
  { rule: 'cloud-access-key', severity: 'credential', regex: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { rule: 'credential-url', severity: 'credential', regex: /\b(?:https?|ssh|postgres(?:ql)?|mysql):\/\/[^\s/@:]+:[^\s/@]+@[^\s/]+/gi },
  { rule: 'assigned-secret', severity: 'review', regex: /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["']([^"'\r\n]{12,})["']/gi },
  { rule: 'email-address', severity: 'privacy', regex: /\b[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { rule: 'mainland-phone', severity: 'privacy', regex: /(?<!\d)1[3-9]\d{9}(?!\d)/g }
];

function isExample(value) {
  return /(?:example\.(?:com|net|org|invalid)|invalid\.test|localhost|\$\{|process\.env|os\.environ|replace[_ -]?me|placeholder)/i.test(value);
}

export function scanText(text) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    for (const { rule, severity, regex } of patterns) {
      regex.lastIndex = 0;
      const matches = [...lines[index].matchAll(regex)];
      if (matches.some(match => {
        if (rule === 'email-address') return !isExample(match[0]);
        if (rule === 'assigned-secret') return !isExample(match[1]);
        return true;
      })) {
        // Findings never retain matched text, context, account names or values.
        findings.push({ rule, severity, line: index + 1 });
      }
    }
  }
  return findings;
}

export function safePath(path) {
  if (!path || /[\u0000-\u001f\u007f]/.test(path) || scanText(path).length) return '<redacted-path>';
  return path.replaceAll('\\', '/');
}

export function classifyText(buffer) {
  if (buffer.includes(0)) return null;
  const text = buffer.toString('utf8');
  // Invalid UTF-8 is not treated as text and is counted as uninspected.
  if (!Buffer.from(text, 'utf8').equals(buffer)) return null;
  return text;
}
