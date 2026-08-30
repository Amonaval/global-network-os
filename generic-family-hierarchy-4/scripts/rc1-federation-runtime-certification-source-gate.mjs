import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok){console.error(`RC-1 source gate FAIL: ${msg}`);process.exitCode=1}else console.log(`✓ ${msg}`)};

const batch=spawnSync(process.execPath,['scripts/nf1-nf8-federation-batch-gate.mjs'],{stdio:'inherit'});
if(batch.status!==0) process.exit(batch.status||1);

const features=read('core/features/advanced-network.ts');
const home=read('components/MyNetworksHome.tsx');
const css=read('app/globals.css');
const pkg=JSON.parse(read('package.json'));
const nf=['federation_distribution','network_passport','network_affiliation','umbrella_runtime','federated_directory','application_scopes','trusted_request_routing','governed_introductions','outcome_trust_receipt'];
for(const key of nf){
 must(features.includes(`k('${key}')`)&&features.includes("defaultLaunch:'test'"),`${key} is registered in the TEST-default advanced capability model`);
 must(home.includes(`\"${key}\"`),`${key} is represented in the guided My Networks workspace`);
}
must(home.includes('filter(item=>enabled(item.key))'),'NX-8 centralizes Launch Control filtering before tools are rendered');
must(home.includes('dynamic(()=>import("./NetworkPassportManager")')&&home.includes('dynamic(()=>import("./FederatedOutcomeTrustReceipt")'),'federation capability code remains lazy-loaded');
must(home.includes('section!=="overview"')&&home.includes('activeTool'),'progressive disclosure keeps advanced tools behind journey/tool selection');
must(css.includes('html[data-theme="dark"] .nx9-help-modal')&&css.includes('html[data-theme="aurora"] .nx9-help-modal'),'NX-9 help modal has explicit Dark and Aurora theme contracts');
must(css.includes('--nx9-modal-bg')&&css.includes('--nx9-modal-text')&&css.includes('--nx9-modal-muted'),'NX-9 modal owns explicit surface/text/muted tokens');
must(pkg.scripts?.['validate:nf4']?.includes('nf4-federated-directory-gate.mjs'),'NF-4 has a first-class package validation command');
must(pkg.scripts?.['validate:nf-batch']?.includes('nf1-nf8-federation-batch-gate.mjs'),'NF batch validation command remains available');

if(process.exitCode) process.exit(process.exitCode);
console.log('RC-1 federation/NX source certification gate PASS. Runtime/database/browser certification is still a separate required step.');
