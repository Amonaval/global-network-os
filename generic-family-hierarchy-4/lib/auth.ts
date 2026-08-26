import type { NetworkMembershipRole } from '../core/network/contracts';
import { supabase } from './supabase';
export type AuthUser={id:string;email?:string;role:'member'|'admin';membership_role?:NetworkMembershipRole;/** Family compatibility alias; remove only after Family callers migrate. */family_role?:NetworkMembershipRole;member_id?:string|null;active_network_id?:string|null;experience_level?:'simple'|'connected'|'explorer';platform_owner?:boolean};
export async function getAuthUser():Promise<AuthUser|null>{
 if(!supabase)return null;
 const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
 let {data:profile,error:profileError}=await supabase.from('profiles').select('role,member_id,active_network_id,experience_level').eq('id',user.id).maybeSingle();
 if(profileError){const fallback=await supabase.from('profiles').select('role,member_id,active_network_id').eq('id',user.id).maybeSingle();profile=fallback.data as any;}
 let membershipRole:NetworkMembershipRole='member';
 if(profile?.active_network_id){
   const {data:membership}=await supabase.from('network_memberships').select('role').eq('network_id',profile.active_network_id).eq('user_id',user.id).eq('status','active').maybeSingle();
   if(membership?.role==='owner'||membership?.role==='admin') membershipRole=membership.role;
 }
 const role: 'member'|'admin' = membershipRole==='owner'||membershipRole==='admin'?'admin':'member';
 let platformOwner=false;
 try{const {data}=await supabase.rpc('is_platform_owner');platformOwner=!!data}catch{}
 return {id:user.id,email:user.email,role,membership_role:membershipRole,family_role:membershipRole,member_id:profile?.member_id||null,active_network_id:profile?.active_network_id||null,experience_level:(profile?.experience_level||'simple') as 'simple'|'connected'|'explorer',platform_owner:platformOwner};
}
export async function signIn(email:string,password:string){if(!supabase)throw new Error('Supabase is not configured.');const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;}
export async function signUp(email:string,password:string,full_name:string){if(!supabase)throw new Error('Supabase is not configured.');const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name}}});if(error)throw error;return data;}
export async function resendSignupConfirmation(email:string){if(!supabase)throw new Error('Supabase is not configured.');const {error}=await supabase.auth.resend({type:'signup',email:email.trim()});if(error)throw error;}
export async function requestPasswordReset(email:string){
 if(!supabase)throw new Error('Supabase is not configured.');
 const redirectTo=typeof window!=='undefined'?`${window.location.origin}/`:undefined;
 const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),redirectTo?{redirectTo}:undefined);
 if(error)throw error;
}
export async function updatePassword(password:string){if(!supabase)throw new Error('Supabase is not configured.');const {error}=await supabase.auth.updateUser({password});if(error)throw error;}
export async function signOut(){if(supabase){const {error}=await supabase.auth.signOut();if(error)throw error;}}
