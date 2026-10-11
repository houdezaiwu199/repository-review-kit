export function parseByteSize(value) {
  const match = /^(\d+)(B|KiB|MiB|GiB)?$/.exec(String(value));
  if (!match) throw new Error('Use a nonnegative integer byte size.');
  const result = Number(match[1]) * ({ B: 1, KiB: 1024, MiB: 1048576, GiB: 1073741824 }[match[2] || 'B']);
  if (!Number.isSafeInteger(result) || result <= 0) throw new Error('Byte size is out of range.');
  return result;
}
export function formatByteSize(bytes) {
  if (!Number.isSafeInteger(bytes) || bytes < 0) throw new Error('Invalid byte size.');
  for (const [name, size] of [['GiB', 1073741824], ['MiB', 1048576], ['KiB', 1024]]) if (bytes && bytes % size === 0) return bytes / size + name;
  return bytes + 'B';
}
