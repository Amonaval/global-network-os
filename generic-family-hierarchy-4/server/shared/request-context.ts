import {createClient, type SupabaseClient, type User} from "@supabase/supabase-js";
import {CommandError} from "./errors";
import {getRuntimeConfig} from "./runtime-config";
export type RequestContext={requestId:string;user:User;supabase:SupabaseClient;activeNetworkId?:string;startedAt:number};
export async function createRequestContext(request:Request):Promise<RequestContext>{
 const requestId=request.headers.get("x-request-id")||crypto.randomUUID();
 const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 const {supabaseUrl:url,supabaseAnonKey:anon}=getRuntimeConfig();
 if(!token)throw new CommandError("UNAUTHENTICATED","Please sign in to continue.",401);
 const supabase=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await supabase.auth.getUser(token);
 if(error||!user)throw new CommandError("UNAUTHENTICATED","Please sign in to continue.",401);
 const {data:memberships}=await supabase.rpc("get_my_networks");
 const active=(memberships||[]).find((row:any)=>row?.is_active);
 return {requestId,user,supabase,activeNetworkId:active?.network_id?String(active.network_id):undefined,startedAt:Date.now()};
}
