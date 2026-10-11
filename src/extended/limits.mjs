export const defaultLimits = Object.freeze({ objectBytes: 2097152, totalBytes: 268435456, fileCount: 10000, batchObjects: 32 });
export function validateLimits(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Limits must be an object.');
  for (const key of Object.keys(input)) if (!(key in defaultLimits)) throw new Error('Unknown limit.');
  const result = { ...defaultLimits, ...input };
  for (const value of Object.values(result)) if (!Number.isSafeInteger(value) || value < 1) throw new Error('Limits must be positive safe integers.');
  if (result.objectBytes > result.totalBytes || result.batchObjects > 1024) throw new Error('Inconsistent scan limits.');
  return Object.freeze(result);
}
