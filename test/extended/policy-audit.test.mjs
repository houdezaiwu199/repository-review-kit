import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePolicy} from '../../src/extended/policy-audit.mjs';
test('policy filtering preserves uninspected-object coverage limitations',()=>{const report={privacy:{binaryObjects:1,findings:[{object:'a',path:'x',findings:[{rule:'email-address',severity:'privacy',line:1},{rule:'private-key',severity:'credential',line:2}]}]}};const r=evaluatePolicy(report,{},'credential');assert.equal(r.findings.length,1);assert.equal(r.excludedFindings,1);assert.equal(r.coverageIncomplete,true);assert.equal(r.policyIsSecurityProof,false);});
