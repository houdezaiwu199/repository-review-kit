import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../../src/extended/config-loader.mjs';
import { mkdtempSync,writeFileSync,rmSync } from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
test('configuration loading has a size budget and generic errors',t=>{const d=mkdtempSync(join(tmpdir(),'policy-'));t.after(()=>rmSync(d,{recursive:true,force:true}));const p=join(d,'policy.json');writeFileSync(p,'{"rules":[]}');assert.deepEqual(loadConfig(p).rules,[]);assert.throws(()=>loadConfig(p,{maxBytes:2}),/local policy/);writeFileSync(p,'broken');assert.throws(()=>loadConfig(p),/local policy/);});
