import { validateConfig } from './config-schema.mjs';
export function mergeConfig(base,override={}) { const valid=validateConfig(base);return validateConfig({...valid,...override,limits:{...valid.limits,...override.limits}}); }
