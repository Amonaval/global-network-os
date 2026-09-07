import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const setup=read('components/SetupScreen.tsx');
const template=read('components/TemplateNetworkApp.tsx');
const alumni=read('components/AlumniNetworkApp.tsx');
const family=read('components/NetworkApp.tsx');
const mine=read('components/MyNetworksHome.tsx');
const migration=read('supabase/migrations/089_platform_vertical_parity_and_network_lifecycle.sql');
const checks=[
 ['family easiest-start retained',setup.includes('ChooseEasiestStartTxt')&&setup.includes('UploadExcelCsvTxt')],
 ['productized easiest-start',setup.includes('createProductizedWithMode("build")')&&setup.includes('createProductizedWithMode("excel")')&&setup.includes('createProductizedWithMode("empty")')],
 ['alumni easiest-start',setup.includes('createAlumniWithMode("build")')&&setup.includes('createAlumniWithMode("excel")')],
 ['all released productized kinds share flow',['housing-society','family-association','association','organization','business-trust','franchise','professional'].every(k=>setup.includes(`"${k}"`))],
 ['template language switcher',template.includes('<LanguageSwitcher compact/>')],
 ['template privacy preview',template.includes('PublicPreviewTxt')&&template.includes('MemberPreviewTxt')&&template.includes('AdminPreviewTxt')],
 ['alumni language switcher',alumni.includes('<LanguageSwitcher compact/>')],
 ['alumni localized navigation',alumni.includes('localizedSurfaceLabel(surface,language)')],
 ['alumni privacy preview',alumni.includes('privacyPreview')&&alumni.includes('PublicPreviewTxt')],
 ['family mature controls retained',family.includes('<LanguageSwitcher compact />')&&family.includes('nx6-privacy-preview')],
 ['creator deletion from my networks',mine.includes('deleteOwnedNetworkPermanently')&&mine.includes('m.role==="owner"')],
 ['universal owner delete RPC',migration.includes('delete_owned_network_permanently(uuid,text)')&&migration.includes("nm.role='owner'")],
 ['exact name confirmation',migration.includes('p_confirm_name')&&migration.includes('Network name confirmation does not match')],
 ['delete detaches active profile',migration.includes('active_network_id=null')&&migration.includes('delete from public.networks')],
 ['migration compatibility assertion',migration.includes('compatibility check failed')],
];
let bad=0;for(const [name,ok] of checks){console.log(ok?'PASS':'FAIL',name);if(!ok)bad++}if(bad){console.error(`Platform parity gate failed (${bad}/${checks.length})`);process.exit(1)}console.log(`Platform parity source gate passed (${checks.length} checks).`);
