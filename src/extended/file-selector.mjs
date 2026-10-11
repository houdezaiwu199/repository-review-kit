import { globMatcher } from './glob.mjs';
import { repositoryPath, isGeneratedPath } from './path-filter.mjs';
export function selectFiles(paths,{include=['**'],exclude=[]}={}) {
  if(!Array.isArray(paths)||!Array.isArray(include)||!Array.isArray(exclude))throw new Error('Invalid selection.');
  const includes=include.map(globMatcher), excludes=exclude.map(globMatcher);
  return [...new Set(paths.map(repositoryPath))].filter(path=>!isGeneratedPath(path)&&includes.some(m=>m(path))&&!excludes.some(m=>m(path))).sort();
}
