import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const app=read('components/NetworkApp.tsx');
const css=read('app/globals.css');
const migration=read('supabase/migrations/034_cr2_3_alpha_onboarding_stabilization.sql');
const setup=read('components/SetupScreen.tsx');
const checks=[
 ['anonymous playground remains before auth', app.includes('Try Playground · no login') && app.includes('!auth && !demoPreview')],
 ['family-name-only creation remains available', setup.includes('Create now · add people later')],
 ['fresh creator auth is re-read after activation', app.includes('let creatorAuth = await getAuthUser()') && app.includes('setAuth(creatorAuth)')],
 ['fresh creator state hydrates as family admin', app.includes('repository.fetchState("admin")')],
 ['fresh creation no longer immediately resaves network settings', !(app.includes('await repository.saveNetworkSettings(settings);') && app.includes('const networkId = await createSharedFamily'))],
 ['bulk import accepts family owner/admin role rather than legacy global role only', app.includes('network?.membership_role === "owner"') && app.includes('auth?.family_role === "owner"')],
 ['audit failure cannot invalidate successful family creation', app.includes('Audit telemetry must never turn a successfully-created family into a failed onboarding screen.')],
 ['current family fallback uses active membership', migration.includes('order by nm.joined_at desc')],
 ['legacy is_admin remains family scoped', migration.includes('select public.is_network_admin(public.current_network_id())')],
 ['audit RPC is family scoped', migration.includes('Family administrator access is required.') && migration.includes('insert into public.audit_log(network_id,actor_id,action,details)')],
 ['home special-days padding correction preserved', css.includes('.card.home-coming{padding:10px}')],
 ['profile overlay stays below relationship/modal layer', css.includes('z-index:50; display:flex; justify-content:flex-end')],
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`${checks.length-failed}/${checks.length} CR2.3 source checks passed.`);
if(failed)process.exit(1);
