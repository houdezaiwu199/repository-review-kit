import test from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig } from '../../src/extended/config-schema.mjs';
test('policy schema rejects unknown settings and invalid nested data',()=>{
  assert.equal(validateConfig().version,1);assert.throws(()=>validateConfig({version:2}));assert.throws(()=>validateConfig({include:'**'}));
  assert.throws(()=>validateConfig({rules:['missing']}));assert.throws(()=>validateConfig({unknown:true}));
});
