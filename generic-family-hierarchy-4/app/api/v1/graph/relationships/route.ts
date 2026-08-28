import type {CreateGraphRelationshipCommand} from "../../../../../core/api/contracts";
import {createGraphRelationship} from "../../../../../server/graph/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {text} from "../../../../../server/shared/validation";
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"createGraphRelationship",successStatus:201,rateLimit:{limit:40},parse:b=>({fromEntityId:text(b.fromEntityId,"fromEntityId",100),toEntityId:text(b.toEntityId,"toEntityId",100),relationshipType:text(b.relationshipType,"relationshipType",80),metadata:b.metadata&&typeof b.metadata==="object"&&!Array.isArray(b.metadata)?b.metadata as Record<string,unknown>:{} } satisfies CreateGraphRelationshipCommand),execute:createGraphRelationship,networkId:(_data,ctx)=>ctx.activeNetworkId})}
