import type {JoinNetworkCommand} from "../../../../../core/api/contracts";
import {joinNetwork} from "../../../../../server/network/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {text} from "../../../../../server/shared/validation";
import {CommandError} from "../../../../../server/shared/errors";
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"joinNetwork",rateLimit:{limit:20},parse:b=>{const kind=text(b.kind,"kind",20);if(kind!=="family"&&kind!=="productized")throw new CommandError("INVALID_NETWORK_KIND","Unsupported network type.");return {kind,code:text(b.code,"code",20).toUpperCase()} as JoinNetworkCommand},execute:joinNetwork,networkId:data=>data.networkId})}
