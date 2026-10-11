export const severityOrder = Object.freeze({ privacy: 1, review: 2, credential: 3 });
export function severityAtLeast(value, minimum) { if (!(value in severityOrder) || !(minimum in severityOrder)) throw new Error('Unknown severity.'); return severityOrder[value] >= severityOrder[minimum]; }
export function highestSeverity(findings) { let highest = null; for (const finding of findings) { if (!(finding.severity in severityOrder)) throw new Error('Unknown severity.'); if (!highest || severityOrder[finding.severity] > severityOrder[highest]) highest = finding.severity; } return highest; }
