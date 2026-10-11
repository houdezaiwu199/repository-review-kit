import { readFileSync, statSync } from 'node:fs';
import { validateConfig } from './config-schema.mjs';
export function loadConfig(path,{maxBytes=65536}={}) {
  if(!Number.isSafeInteger(maxBytes)||maxBytes<1)throw new Error('Invalid configuration budget.');
  try {const stat=statSync(path);if(!stat.isFile()||stat.size>maxBytes)throw new Error();const data=readFileSync(path);if(data.length>maxBytes)throw new Error();return validateConfig(JSON.parse(data.toString('utf8')));} catch {throw new Error('Cannot load valid local policy.');}
}
