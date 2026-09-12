import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const app=read('components/NetworkApp.tsx');
const product=read('components/TemplateNetworkApp.tsx');
const alumni=read('components/AlumniNetworkApp.tsx');
const checks=[
 ['anonymous sign-in reset exists',app.includes('const openAnonymousSignIn=()=>')],
 ['family playground exposes sign in CTA',app.includes('data-testid="qa-playground-signin"')&&app.includes('onClick={openAnonymousSignIn}')],
 ['family playground account menu exposes sign in',app.includes('key:"signin"')&&app.includes('Sign in to create or join your own network')],
 ['productized playground receives sign-in callback',app.includes('onSignIn={!auth?openAnonymousSignIn:undefined}')&&product.includes('onSignIn?:()=>void')],
 ['productized playground exposes sign in',product.includes('demo&&!auth&&onSignIn')&&product.includes('key:"signin"')],
 ['alumni playground receives sign-in callback',app.includes('<AlumniNetworkApp')&&alumni.includes('onSignIn?:()=>void')],
 ['alumni playground exposes sign in',alumni.includes('demo&&!auth&&onSignIn')&&alumni.includes('key:"signin"')],
 ['legacy anonymous landing sign-in remains present',app.includes('data-testid="qa-open-auth"')&&app.includes('setShowAuth(true)')],
];
let pass=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`Anonymous sign-in stability gate: ${pass}/${checks.length}`);if(pass!==checks.length)process.exit(1);
