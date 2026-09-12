import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const home=read('components/HousingSocietyHome.tsx');
const app=read('components/TemplateNetworkApp.tsx');
const comp=read('verticals/housing-society/runtime/composition.ts');
const css=read('app/globals.css');
const checks=[
 ['dedicated residential flagship home',home.includes('HousingSocietyHome')&&home.includes('hs-chairman-hero')],
 ['live operations snapshot used',home.includes('fetchHsOpsSnapshot')],
 ['live finance snapshot used',home.includes('fetchHsFinanceSnapshot')],
 ['live governance snapshot used',home.includes('fetchHsGovernanceSnapshot')],
 ['live security snapshot used',home.includes('fetchHsSecuritySnapshot')],
 ['housing home integrated only for housing',app.includes('kind==="housing-society"?<HousingSocietyHome')],
 ['complaints module preserved',app.includes('tab==="complaints"&&kind==="housing-society"&&<HousingSocietyOperationsPanel')],
 ['finance module preserved',app.includes('tab==="maintenance"&&kind==="housing-society"&&<HousingSocietyFinancePanel')],
 ['governance module preserved',app.includes('tab==="governance"&&kind==="housing-society"&&<HousingSocietyGovernancePanel')],
 ['security module preserved',app.includes('tab==="security"&&kind==="housing-society"&&<HousingSocietySecurityPanel')],
 ['advanced residential surfaces remain in More',comp.includes('maintenanceSurface')&&comp.includes('governanceSurface')&&comp.includes('securitySurface')&&comp.includes('"explorer"')&&comp.includes('"community"')&&comp.includes('"connections"')],
 ['responsive flagship styling',css.includes('.hs-chairman-metrics')&&css.includes('@media(max-width:560px)')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}if(failed){process.exitCode=1}else console.log(`Residential flagship source gate passed (${checks.length} checks).`);
