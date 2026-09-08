import {loadQaEnv,writeJson} from '../runtime/env.mjs';
import {queryScalar} from './postgres-client.mjs';
loadQaEnv();
const url=process.env.QA_DATABASE_URL;
if(!url){writeJson('qa-results/db/database-integrity.json',{generatedAt:new Date().toISOString(),status:'blocked',reason:'QA_DATABASE_URL not set',checks:[]});console.log('Database integrity BLOCKED: QA_DATABASE_URL not set');process.exit(2)}
const checks=[];
async function zero(name,sql,severity='P1'){const raw=await queryScalar(url,sql),count=Number(raw||0),ok=count===0;checks.push({name,status:ok?'passed':'failed',severity,count});return ok}
async function truth(name,sql,severity='P1'){const raw=await queryScalar(url,sql),ok=raw==='t'||raw==='true'||raw==='1';checks.push({name,status:ok?'passed':'failed',severity,value:raw});return ok}
try{
 await zero('No orphan network memberships',`select count(*) from public.network_memberships m left join public.networks n on n.id=m.network_id where n.id is null`,'P0');
 await zero('No duplicate active membership keys',`select count(*) from (select network_id,user_id,count(*) c from public.network_memberships where status='active' group by 1,2 having count(*)>1) q`,'P0');
 await zero('No orphan network entities',`select count(*) from public.network_entities e left join public.networks n on n.id=e.network_id where n.id is null`,'P0');
 await zero('No orphan productized relationships',`select count(*) from public.network_entity_relationships r left join public.networks n on n.id=r.network_id where n.id is null`,'P0');
 await zero('No orphan tenant-prefixed media objects',`select count(*) from storage.objects o where o.bucket_id in ('profile-photos','community-media') and split_part(o.name,'/',1) ~* '^[0-9a-f-]{36}$' and not exists(select 1 from public.networks n where n.id::text=split_part(o.name,'/',1))`,'P1');
 await truth('Critical tenant tables exist and have RLS enabled',`select count(*)=5 and bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('networks','network_memberships','network_entities','network_entity_relationships','network_participation_invitations')`,'P0');
 await zero('No active profile points at a network without active membership',`select count(*) from public.profiles p where p.active_network_id is not null and not exists(select 1 from public.network_memberships m where m.network_id=p.active_network_id and m.user_id=p.id and m.status='active')`,'P1');
 const failed=checks.filter(x=>x.status==='failed');writeJson('qa-results/db/database-integrity.json',{generatedAt:new Date().toISOString(),driver:'node-pg',status:failed.length?'failed':'passed',checks});console.log(`Database integrity ${failed.length?'FAIL':'PASS'} (${checks.length} checks; Node pg)`);if(failed.length)process.exit(1);
}catch(error){writeJson('qa-results/db/database-integrity.json',{generatedAt:new Date().toISOString(),driver:'node-pg',status:'failed',checks,error:String(error?.stack||error)});throw error}
