import type {CreateGraphRelationshipCommand,CreateGraphRelationshipResult} from "../../core/api/contracts";
import type {RequestContext} from "../shared/request-context";
export async function createGraphRelationship(ctx:RequestContext,c:CreateGraphRelationshipCommand):Promise<CreateGraphRelationshipResult>{const {data,error}=await ctx.supabase.rpc("create_productized_network_relationship",{p_from_entity_id:c.fromEntityId,p_to_entity_id:c.toEntityId,p_relationship_type:c.relationshipType,p_metadata:c.metadata||{}});if(error)throw error;return {relationshipId:String(data)}}
