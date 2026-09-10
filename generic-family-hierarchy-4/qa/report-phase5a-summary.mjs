import fs from 'node:fs';
const summaryFile='qa-results/PHASE5A-CERTIFICATION-SUMMARY.json';
if(!fs.existsSync(summaryFile)){console.error(`Missing ${summaryFile}`);process.exit(1)}
const s=JSON.parse(fs.readFileSync(summaryFile,'utf8'));
const auditFile='qa-results/security/PHASE5A-RPC-SECURITY-AUDIT.json';const audit=fs.existsSync(auditFile)?JSON.parse(fs.readFileSync(auditFile,'utf8')):null;
const lines=['# TrustWeave QA Phase-5A Security Contract & RPC Closure','',`Status: **${s.status}**`,'','## Safety boundary','',
'- Live database work is read-only catalog inspection only.','- No migration execution.','- No GRANT/REVOKE is executed.','- No Storage/RLS mutation.','- No data create/update/delete.','- Generated remediation SQL is review-only and ends in `ROLLBACK`.','','## Strict closure gates','',
'- Unexpected PUBLIC EXECUTE = 0','- Unexpected anon EXECUTE = 0','- Unclassified live public RPC = 0','- SECURITY DEFINER without fixed search_path = 0','- SECURITY DEFINER owned by anon/authenticated = 0',''];
if(audit){lines.push('## Current audit','',`- Live public functions: ${audit.functionCount}`,`- P0 findings: ${audit.findingCounts?.P0??'n/a'}`,`- P1 findings: ${audit.findingCounts?.P1??'n/a'}`,`- Audit status: ${audit.status}`,'');}
lines.push('## Interpretation','',s.status==='PHASE5A_CERTIFIED'?'- Strict RPC closure achieved.':'- Remediation is still required. Phase 5A intentionally does not waive legacy RPC exposure. Review `qa-results/security/PHASE5A-RPC-SECURITY-AUDIT.md` and the rollback-protected remediation preview before any controlled ACL migration is authored.','');
fs.writeFileSync('qa-results/PHASE5A-CERTIFICATION-SUMMARY.md',lines.join('\n')+'\n');console.log(`Phase-5A report: ${s.status}`);
