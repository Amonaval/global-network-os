import type {ClaimIdentityCommand,ClaimIdentityResult} from "../../core/api/contracts";
import type {RequestContext} from "../shared/request-context";
import {CommandError} from "../shared/errors";
export async function claimIdentity(ctx:RequestContext,c:ClaimIdentityCommand):Promise<ClaimIdentityResult>{
 let rpc:string,param:string;
 if(c.kind==="family"){rpc="claim_profile_by_verified_email";param="p_member_id"}
 else if(c.kind==="alumni"){rpc="claim_alumni_profile_by_verified_email";param="p_profile_id"}
 else if(c.kind==="productized"){rpc="claim_productized_network_entity_by_verified_email";param="p_entity_id"}
 else throw new CommandError("UNSUPPORTED_IDENTITY","Identity claiming is not available for this network type.");
 const {data,error}=await ctx.supabase.rpc(rpc,{[param]:c.subjectId});if(error)throw error;return {networkId:String(data)};
}
