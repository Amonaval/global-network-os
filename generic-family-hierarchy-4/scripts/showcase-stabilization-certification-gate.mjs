import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const app=read('components/NetworkApp.tsx');
const setup=read('components/SetupScreen.tsx');
const my=read('components/MyNetworksHome.tsx');
const auth=read('components/AuthPanel.tsx');
const account=read('components/shared/NetworkAccountMenu.tsx');
const theme=read('components/ThemeSwitcher.tsx');
const template=read('components/TemplateNetworkApp.tsx');
const assoc=read('components/AssociationHome.tsx');
const housing=read('components/HousingSocietyHome.tsx');
const css=read('app/globals.css');
const e2e=read('qa/e2e/24-showcase-stabilization-certification.spec.ts');
const checks=[
 ['shell transitions expose loader',app.includes('qa-shell-loader')&&app.includes('setShellBusy(tr("LoadingTxt"))')],
 ['My Networks switching exposes loader and error state',my.includes('qa-my-networks-loader')&&my.includes('showcase-action-error')&&my.includes('openMembership=async')],
 ['existing memberships are not filtered by showcase settings',my.includes('const memberships=identity.memberships.filter(m=>m.status==="active")')&&!my.includes('memberships.filter(m=>canCreateVertical')],
 ['Playground remains Launch-Control filtered',my.includes('playgroundKinds')&&my.includes('.playground_enabled')],
 ['setup async operations expose loader',setup.includes('setup-action-loader')&&setup.includes('LoaderCircle')],
 ['mobile Choose how to start has stable test target',setup.includes('qa-choose-how-start')&&css.includes('.onboarding-card .setup-next{position:fixed')],
 ['sign-in dialog has close/backdrop/Escape behavior',auth.includes('auth-modal-close')&&auth.includes('event.key==="Escape"')&&auth.includes('event.target===event.currentTarget')],
 ['account menu closes on Escape',account.includes('event.key==="Escape"')&&account.includes('qa-account-menu')],
 ['product mobile More closes on backdrop and Escape',template.includes('product-mobile-more-backdrop')&&template.includes('event.key==="Escape"')],
 ['five appearance themes remain available',...(()=>{const themes=['light','warm','modern','aurora','dark'];return [themes.every(x=>theme.includes(`value:"${x}"`)&&theme.includes('qa-theme-'))]})()],
 ['Community flagship has certification anchor',assoc.includes('qa-fca-flagship-home')],
 ['Residential flagship has certification anchor',housing.includes('qa-hs-flagship-home')],
 ['read-only showcase browser certification exists',e2e.includes('three flagship verticals')&&e2e.includes('Playground back')&&e2e.includes('mobile create flow')&&e2e.includes('five appearance themes')],
 ['mobile safe-area hardening is present',css.includes('env(safe-area-inset-bottom)')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`Showcase stabilization/certification gate: ${checks.length-failed}/${checks.length}`);if(failed)process.exit(1);
