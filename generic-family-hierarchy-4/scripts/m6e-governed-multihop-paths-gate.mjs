import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const migration='supabase/migrations/061_m6e_governed_multihop_trusted_paths.sql';
const checks=[
 ['migration',fs.existsSync(migration)],
 ['explicit path consent',read(migration).includes("'pathTraversal'" )&&read('core/trust/network-bridge.ts').includes('pathTraversal:boolean')],
 ['depth bounded',read(migration).includes('Maximum 2 bridge edges')||read(migration).includes('depth=2')],
 ['two hop path',read(migration).includes('two_hop_paths')],
 ['candidate provenance',read(migration).includes('path_bridge_ids')&&read(migration).includes('path_summary')],
 ['request revalidation',read(migration).includes('valid_edges<>cardinality(c.path_bridge_ids)')],
 ['privacy telemetry',read(migration).includes('trusted_path_opportunity')],
 ['bridge UX',read('components/NetworkBridgeManager.tsx').includes('AllowTrustedPathTraversalTxt')],
 ['discovery UX',read('components/CrossNetworkDiscovery.tsx').includes('TwoHopTrustedPathTxt')],
 ['pulse metric',read('components/NetworkEffectPulse.tsx').includes('multiHopOpportunities')],
 ['M7 program',fs.existsSync('MISSION-7-REAL-WORLD-ACTIVATION-SHOWCASE.md')&&read('MISSION-7-REAL-WORLD-ACTIVATION-SHOWCASE.md').includes('WOW Showcase Universe')],
 ['runtime checklist',fs.existsSync('MISSION-6E-RUNTIME-VERIFICATION-CHECKLIST.md')]
];
for(const[n,ok]of checks)console.log(`${ok?'PASS':'FAIL'} ${n}`);if(checks.some(x=>!x[1]))process.exit(1);console.log(`M6-E source gate: ${checks.length}/${checks.length} PASS`);
