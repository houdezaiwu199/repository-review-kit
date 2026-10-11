import { validateLimits } from './limits.mjs';
import { selectRules, ruleCatalogue } from './rule-catalog.mjs';
import { globMatcher } from './glob.mjs';
export function validateConfig(input={}) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Configuration must be an object.');
  const allowed=['version','limits','include','exclude','rules'];
  if(Object.keys(input).some(k=>!allowed.includes(k)) || (input.version!==undefined&&input.version!==1))throw new Error('Unsupported configuration.');
  const result={version:1,limits:validateLimits(input.limits),include:input.include??['**'],exclude:input.exclude??[],rules:input.rules??ruleCatalogue.map(r=>r.id)};
  for(const patterns of [result.include,result.exclude]) {if(!Array.isArray(patterns))throw new Error('Invalid path patterns.');patterns.forEach(globMatcher);}
  selectRules(result.rules);return structuredClone(result);
}
