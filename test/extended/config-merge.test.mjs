import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeConfig } from '../../src/extended/config-merge.mjs';
test('overrides merge limit keys but replace ordered rule and path lists',()=>{const result=mergeConfig({limits:{objectBytes:1024},rules:['private-key']},{limits:{fileCount:10},rules:[]});assert.equal(result.limits.objectBytes,1024);assert.equal(result.limits.fileCount,10);assert.deepEqual(result.rules,[]);assert.throws(()=>mergeConfig({}, {limits:{objectBytes:-1}}));});
