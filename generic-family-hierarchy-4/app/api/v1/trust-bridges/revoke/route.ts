import type {RevokeNetworkBridgeCommand} from "../../../../../core/api/contracts";
import {revokeNetworkBridge} from "../../../../../server/trust/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {text} from "../../../../../server/shared/validation";
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"revokeNetworkBridge",rateLimit:{limit:30},parse:b=>({bridgeId:text(b.bridgeId,"bridgeId",64)}) as RevokeNetworkBridgeCommand,execute:revokeNetworkBridge})}
