import type {CreateNetworkCommand} from "../../../../../core/api/contracts";
import {createNetwork} from "../../../../../server/network/service";
import {createRequestContext} from "../../../../../server/shared/request-context";
import {commandFailure,commandSuccess,logCommand} from "../../../../../server/shared/response";
import {objectBody,optionalText,text} from "../../../../../server/shared/validation";
import {CommandError} from "../../../../../server/shared/errors";
import {isProductizedVerticalKind} from "../../../../../templates/productized/config";
export const runtime="nodejs";
export async function POST(request:Request){let requestId=request.headers.get("x-request-id")||crypto.randomUUID(),ctx:Awaited<ReturnType<typeof createRequestContext>>|null=null;try{ctx=await createRequestContext(request);requestId=ctx.requestId;const b=objectBody(await request.json());const kind=text(b.kind,"kind",40);let c:CreateNetworkCommand;if(kind==="family")c={kind,name:text(b.name,"name",120),slug:optionalText(b.slug,120),description:optionalText(b.description,1000)};else if(isProductizedVerticalKind(kind))c={kind,name:text(b.name,"name",120),contextValue:text(b.contextValue,"contextValue",200),description:optionalText(b.description,1000)};else throw new CommandError("INVALID_NETWORK_KIND","Unsupported network type.");const data=await createNetwork(ctx,c);logCommand({requestId,actorId:ctx.user.id,command:"createNetwork",networkId:data.networkId,outcome:"success",startedAt:ctx.startedAt});return commandSuccess(requestId,data,201)}catch(e){if(ctx)logCommand({requestId,actorId:ctx.user.id,command:"createNetwork",outcome:"failure",startedAt:ctx.startedAt});return commandFailure(requestId,e)}}
