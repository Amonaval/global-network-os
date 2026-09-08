import {createClient} from '@supabase/supabase-js';
import {loadQaEnv,requiredEnv} from './env.mjs';
loadQaEnv();
export function publicConfig(){requiredEnv(['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY']);return {url:process.env.NEXT_PUBLIC_SUPABASE_URL,anon:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}}
export function serviceClient(){requiredEnv(['NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']);return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})}
export async function roleClient(role){
 const key=role==='tenantB'?'QA_TENANT_B_OWNER':`QA_${role.toUpperCase()}`;
 requiredEnv(['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY',`${key}_EMAIL`,`${key}_PASSWORD`]);
 const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await s.auth.signInWithPassword({email:process.env[`${key}_EMAIL`],password:process.env[`${key}_PASSWORD`]});
 if(error||!data.session)throw new Error(`Could not authenticate QA ${role}: ${error?.message||'no session'}`);
 return {client:s,session:data.session,user:data.user};
}
export async function setActiveNetwork(client,networkId){const {error}=await client.rpc('set_active_network',{p_network_id:networkId});if(error)throw new Error(`set_active_network(${networkId}) failed: ${error.message}`)}
