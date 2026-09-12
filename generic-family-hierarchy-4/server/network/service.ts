import type {CreateNetworkCommand,CreateNetworkResult,JoinNetworkCommand,JoinNetworkResult} from "../../core/api/contracts";
import type {RequestContext} from "../shared/request-context";
import {CommandError} from "../shared/errors";
export async function createNetwork(ctx:RequestContext,command:CreateNetworkCommand):Promise<CreateNetworkResult>{
 const previousNetworkId=ctx.activeNetworkId||null;
 if(command.kind==="family"){
  const {data,error}=await ctx.supabase.rpc("create_family",{p_name:command.name,p_slug:command.slug||null,p_description:command.description||""});
  if(error)throw error;
  const networkId=String(data);
  const finalized=await ctx.supabase.rpc("finalize_network_creation",{p_network_id:networkId,p_previous_network_id:previousNetworkId});
  if(finalized.error)throw finalized.error;
  const result=(finalized.data||{}) as {approval_status?:string;membership_ready?:boolean};
  if(result.membership_ready!==true)throw new CommandError("NETWORK_MEMBERSHIP_NOT_READY","The network was created but the creator membership could not be prepared.",500);
  const approvalStatus=(result.approval_status||"approved") as "pending"|"approved"|"rejected";
  return {networkId,approvalStatus};
 }
 const {data,error}=await ctx.supabase.rpc("create_productized_network",{p_vertical_kind:command.kind,p_name:command.name,p_context_value:command.contextValue,p_description:command.description||""});
 if(error){
  const message=String((error as {message?:string}).message||error);
  if(command.kind==="family-association"&&/Unsupported productized network template|vertical_kind|template_id|family-association|fca_seed_defaults|g8_seed_productized_structure|does not exist/i.test(message))throw new CommandError("FCA_DATABASE_MIGRATION_REQUIRED","Family Community Association is enabled in the app but not in the database runtime. Rerun the corrected Supabase migration 080_fca0_family_community_association.sql, then rerun 081_fca01_family_association_runtime_compatibility.sql and retry network creation.",409);
  throw error;
 }
 const networkId=String(data);
 const finalized=await ctx.supabase.rpc("finalize_network_creation",{p_network_id:networkId,p_previous_network_id:previousNetworkId});
 if(finalized.error)throw finalized.error;
 const result=(finalized.data||{}) as {approval_status?:string;membership_ready?:boolean};
 if(result.membership_ready!==true)throw new CommandError("NETWORK_MEMBERSHIP_NOT_READY","The network was created but the creator membership could not be prepared.",500);
 const approvalStatus=(result.approval_status||"approved") as "pending"|"approved"|"rejected";
 return {networkId,approvalStatus};
}
export async function joinNetwork(ctx:RequestContext,command:JoinNetworkCommand):Promise<JoinNetworkResult>{
 const rpc=command.kind==="family"?"join_family_by_code":"join_productized_network_by_code";
 const {data,error}=await ctx.supabase.rpc(rpc,{p_code:command.code});if(error)throw error;if(!data)throw new CommandError("JOIN_FAILED","The network could not be joined.");return {networkId:String(data)};
}
