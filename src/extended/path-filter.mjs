const generated = new Set(['node_modules','vendor','dist','build','coverage','.next','.cache','.git']);
export function repositoryPath(value) {
  if (typeof value !== 'string' || !value || /[\u0000-\u001f\u007f]/.test(value) || /^(?:[A-Za-z]:|[\\/])/.test(value)) throw new Error('Invalid relative path.');
  const parts = value.replaceAll('\\','/').split('/');
  if (parts.some(x => !x || x === '.' || x === '..')) throw new Error('Invalid path segment.');
  return parts.join('/');
}
export function isGeneratedPath(value) { return repositoryPath(value).split('/').some(part => generated.has(part.toLowerCase())); }
