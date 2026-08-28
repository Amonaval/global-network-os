import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const data=JSON.parse(read('public/showcase/m7b-showcase-universe.json'));
const checks=[
 ['showcase component',fs.existsSync('components/NetworkEffectShowcase.tsx')&&read('components/MyNetworksHome.tsx').includes('NetworkEffectShowcase')],
 ['cross-network dependency repaired',fs.existsSync('components/CrossNetworkDiscovery.tsx')&&read('components/MyNetworksHome.tsx').includes('./CrossNetworkDiscovery')],
 ['synthetic universe',data.synthetic===true&&data.peopleCount>=600&&data.peopleCount<=900&&data.people.length===data.peopleCount],
 ['six network types',data.networks.length>=6&&new Set(data.networks.map(x=>x.kind)).size>=6],
 ['seven authored stories',data.scenarios.length>=7],
 ['one-hop and two-hop stories',data.scenarios.some(x=>x.pathDepth===1)&&data.scenarios.some(x=>x.pathDepth===2)],
 ['governed bridges',data.bridges.some(x=>x.pathTraversal===true)&&data.bridges.every(x=>x.discovery&&x.introductions)],
 ['privacy theater',read('components/NetworkEffectShowcase.tsx').includes('RelevantPersonAvailableTxt')&&read('components/NetworkEffectShowcase.tsx').includes('TargetControlsConsentTxt')],
 ['responsive showcase css',read('app/globals.css').includes('.m7b-showcase')&&read('app/globals.css').includes('@media(max-width:600px)')],
 ['M7 program durable',fs.existsSync('MISSION-7-REAL-WORLD-ACTIVATION-SHOWCASE.md')&&read('MISSION-7-REAL-WORLD-ACTIVATION-SHOWCASE.md').includes('M7-B — WOW Showcase Universe')],
 ['mission docs',fs.existsSync('MISSION-7B-WOW-SHOWCASE-UNIVERSE.md')&&fs.existsSync('MISSION-7B-RELEASE-MANIFEST.md')&&fs.existsSync('MISSION-7B-RUNTIME-VERIFICATION-CHECKLIST.md')],
 ['ci advanced',/validate:m7(?:a|b|c)/.test(read('.github/workflows/ci.yml'))]
];
for(const[n,ok]of checks)console.log(`${ok?'PASS':'FAIL'} ${n}`);if(checks.some(x=>!x[1]))process.exit(1);console.log(`M7-B source gate: ${checks.length}/${checks.length} PASS`);
