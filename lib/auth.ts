import { supabase } from './supabase';
export type AuthUser={id:string;email?:string;role:'member'|'admin';family_role?:'owner'|'admin'|'member';member_id?:string|null;active_network_id?:string|null};
export async function getAuthUser():Promise<AuthUser|null>{
 if(!supabase)return null;
 const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
 const {data:profile}=await supabase.from('profiles').select('role,member_id,active_network_id').eq('id',user.id).maybeSingle();
 let familyRole:'owner'|'admin'|'member'='member';
 if(profile?.active_network_id){
   const {data:membership}=await supabase.from('network_memberships').select('role').eq('network_id',profile.active_network_id).eq('user_id',user.id).eq('status','active').maybeSingle();
   if(membership?.role==='owner'||membership?.role==='admin') familyRole=membership.role;
 }
 const role: 'member'|'admin' = familyRole==='owner'||familyRole==='admin'?'admin':'member';
 return {id:user.id,email:user.email,role,family_role:familyRole,member_id:profile?.member_id||null,active_network_id:profile?.active_network_id||null};
}
export async function signIn(email:string,password:string){if(!supabase)throw new Error('Supabase is not configured.');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;}
export async function signUp(email:string,password:string,full_name:string){if(!supabase)throw new Error('Supabase is not configured.');const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name}}});if(error)throw error;return data;}
export async function signOut(){if(supabase)await supabase.auth.signOut();}
