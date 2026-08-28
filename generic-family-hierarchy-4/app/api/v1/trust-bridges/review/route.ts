import type {ReviewNetworkBridgeCommand} from "../../../../../core/api/contracts";
import {reviewNetworkBridge} from "../../../../../server/trust/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {booleanValue,text} from "../../../../../server/shared/validation";
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"reviewNetworkBridge",rateLimit:{limit:30},parse:b=>({bridgeId:text(b.bridgeId,"bridgeId",64),accept:booleanValue(b.accept,"accept")}) as ReviewNetworkBridgeCommand,execute:reviewNetworkBridge})}
