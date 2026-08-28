import type {CreateNetworkCommand,CreateNetworkResult,JoinNetworkCommand,JoinNetworkResult} from "../../core/api/contracts";
import type {RequestContext} from "../shared/request-context";
import {CommandError} from "../shared/errors";
export async function createNetwork(ctx:RequestContext,command:CreateNetworkCommand):Promise<CreateNetworkResult>{
 if(command.kind==="family"){
  const {data,error}=await ctx.supabase.rpc("create_family",{p_name:command.name,p_slug:command.slug||null,p_description:command.description||""});if(error)throw error;return {networkId:String(data)};
 }
 const {data,error}=await ctx.supabase.rpc("create_productized_network",{p_vertical_kind:command.kind,p_name:command.name,p_context_value:command.contextValue,p_description:command.description||""});if(error)throw error;return {networkId:String(data)};
}
export async function joinNetwork(ctx:RequestContext,command:JoinNetworkCommand):Promise<JoinNetworkResult>{
 const rpc=command.kind==="family"?"join_family_by_code":"join_productized_network_by_code";
 const {data,error}=await ctx.supabase.rpc(rpc,{p_code:command.code});if(error)throw error;if(!data)throw new CommandError("JOIN_FAILED","The network could not be joined.");return {networkId:String(data)};
}
