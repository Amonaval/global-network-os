import type {CreateNetworkCommand} from "../../../../../core/api/contracts";
import {createNetwork} from "../../../../../server/network/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {optionalText,text} from "../../../../../server/shared/validation";
import {CommandError} from "../../../../../server/shared/errors";
import {isProductizedVerticalKind} from "../../../../../templates/productized/config";
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"createNetwork",successStatus:201,idempotency:"required",rateLimit:{limit:10},parse:b=>{const kind=text(b.kind,"kind",40);if(kind==="family")return {kind,name:text(b.name,"name",120),slug:optionalText(b.slug,120),description:optionalText(b.description,1000)} as CreateNetworkCommand;if(isProductizedVerticalKind(kind))return {kind,name:text(b.name,"name",120),contextValue:text(b.contextValue,"contextValue",200),description:optionalText(b.description,1000)} as CreateNetworkCommand;throw new CommandError("INVALID_NETWORK_KIND","Unsupported network type.")},execute:createNetwork,networkId:data=>data.networkId})}
