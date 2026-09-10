import fs from 'node:fs';
import {buildPhase5bInventory} from './phase5b-migration-inventory.mjs';
const file='qa-results/db/PHASE5B-FRESH-MIGRATION-REPLAY.json';
if(!fs.existsSync(file)){console.error(`Phase-5B evidence BLOCKED: missing ${file}. Run npm run qa:phase5b:replay once against the disposable empty project.`);process.exit(1)}
const evidence=JSON.parse(fs.readFileSync(file,'utf8')),inventory=buildPhase5bInventory();const failures=[];
if(inventory.status!=='passed')failures.push('current migration inventory is blocked');
if(evidence.status!=='passed')failures.push(`replay evidence status is ${evidence.status}`);
if(evidence.sourceFingerprint!==inventory.sourceFingerprint)failures.push('migration source fingerprint changed after replay evidence was produced');
if(!evidence.projectRef)failures.push('replay evidence has no disposable project ref');
if(evidence.postReplay?.status!=='passed')failures.push('post-replay integrity did not pass');
if(failures.length){console.error(`Phase-5B evidence verification FAILED: ${failures.join('; ')}`);process.exit(1)}
console.log(`Phase-5B evidence verification PASS (project ${evidence.projectRef}; fingerprint ${String(evidence.sourceFingerprint).slice(0,12)}…)`);
