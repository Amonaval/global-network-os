import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {writeJson} from '../runtime/env.mjs';

const MIGRATION_DIR='supabase/migrations';
export const QUARANTINED_MIGRATIONS=new Set([
  '096_phase3_storage_metadata_compatibility.sql',
  '097_phase3_storage_path_scoped_authorization.sql',
]);

function migrationNumber(name){const m=name.match(/^(\d+)_/);return m?Number(m[1]):null}
function digest(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}
export function buildPhase5bInventory(){
  const files=fs.readdirSync(MIGRATION_DIR).filter(x=>/^\d+_.*\.sql$/i.test(x)).sort((a,b)=>(migrationNumber(a)??0)-(migrationNumber(b)??0)||a.localeCompare(b));
  const entries=files.map(name=>({name,number:migrationNumber(name),sha256:digest(path.join(MIGRATION_DIR,name)),bytes:fs.statSync(path.join(MIGRATION_DIR,name)).size,quarantined:QUARANTINED_MIGRATIONS.has(name)}));
  const byNumber=new Map();for(const e of entries){if(!byNumber.has(e.number))byNumber.set(e.number,[]);byNumber.get(e.number).push(e.name)}
  const collisions=[...byNumber.entries()].filter(([,v])=>v.length>1).map(([number,names])=>({number,names}));
  const accepted=entries.filter(x=>!x.quarantined);
  const acceptedNumbers=[...new Set(accepted.map(x=>x.number))].sort((a,b)=>a-b);
  const first=acceptedNumbers[0]??null,latest=acceptedNumbers.at(-1)??null;
  const missing=[];if(first!==null&&latest!==null)for(let n=first;n<=latest;n++)if(!acceptedNumbers.includes(n))missing.push(n);
  const quarantinePresent=entries.filter(x=>x.quarantined).map(x=>x.name);
  const fingerprint=crypto.createHash('sha256').update(accepted.map(x=>`${x.name}:${x.sha256}`).join('\n')).digest('hex');
  const blockers=[];
  if(first!==1)blockers.push({code:'MIGRATION_CHAIN_MUST_START_AT_001',detail:`First accepted migration is ${first??'none'}`});
  for(const c of collisions)blockers.push({code:'DUPLICATE_MIGRATION_VERSION',detail:`${String(c.number).padStart(3,'0')}: ${c.names.join(', ')}`});
  for(const n of missing)blockers.push({code:'MISSING_MIGRATION_VERSION',detail:String(n).padStart(3,'0')});
  for(const name of quarantinePresent)blockers.push({code:'QUARANTINED_EXPERIMENT_PRESENT',detail:`${name} is not part of the accepted certified source chain.`});
  return {generatedAt:new Date().toISOString(),migrationDir:MIGRATION_DIR,entryCount:entries.length,acceptedCount:accepted.length,firstAccepted:first,latestAccepted:latest,sourceFingerprint:fingerprint,quarantine:[...QUARANTINED_MIGRATIONS],quarantinePresent,collisions,missing,blockers,status:blockers.length?'blocked':'passed',entries,accepted};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
  const result=buildPhase5bInventory();writeJson('qa-results/db/PHASE5B-MIGRATION-INVENTORY.json',result);
  console.log(`Phase-5B migration inventory ${result.status.toUpperCase()} (${result.acceptedCount} accepted; latest ${result.latestAccepted??'n/a'}; blockers ${result.blockers.length})`);
  if(result.blockers.length){for(const b of result.blockers)console.error(`- ${b.code}: ${b.detail}`);process.exit(1)}
}
