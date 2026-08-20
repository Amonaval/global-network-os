import { supabase } from './supabase';
export type AuthUser={id:string;email?:string;role:'member'|'admin';member_id?:string|null};
export async function getAuthUser():Promise<AuthUser|null>{
 if(!supabase)return null;
 const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
 const {data:profile}=await supabase.from('profiles').select('role,member_id').eq('id',user.id).maybeSingle();
 return {id:user.id,email:user.email,role:profile?.role==='admin'?'admin':'member',member_id:profile?.member_id||null};
}
export async function signIn(email:string,password:string){if(!supabase)throw new Error('Supabase is not configured.');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;}
export async function signUp(email:string,password:string,full_name:string){if(!supabase)throw new Error('Supabase is not configured.');const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name}}});if(error)throw error;return data;}
export async function signOut(){if(supabase)await supabase.auth.signOut();}
