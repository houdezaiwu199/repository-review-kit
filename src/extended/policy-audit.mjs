import { validateConfig } from './config-schema.mjs';
import { severityAtLeast,highestSeverity } from './severity.mjs';
export function evaluatePolicy(report,config={},minimum='privacy') {
  const policy=validateConfig(config), allowed=new Set(policy.rules);let excludedFindings=0;
  const findings=report.privacy.findings.flatMap(object=>object.findings.map(f=>({...f,object:object.object,path:object.path}))).filter(f=>{const keep=allowed.has(f.rule)&&severityAtLeast(f.severity,minimum);if(!keep)excludedFindings++;return keep;});
  return {findings,excludedFindings,highestSeverity:highestSeverity(findings),coverageIncomplete:Boolean(report.privacy.binaryObjects||report.privacy.skippedLargeObjects||report.privacy.skippedBudgetObjects),policyIsSecurityProof:false};
}
