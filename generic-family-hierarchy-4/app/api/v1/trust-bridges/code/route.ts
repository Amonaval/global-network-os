import type {NetworkBridgeCodeCommand} from "../../../../../core/api/contracts";
import {getNetworkBridgeCode} from "../../../../../server/trust/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {booleanValue,text} from "../../../../../server/shared/validation";
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"networkBridgeCode",rateLimit:{limit:20},parse:b=>({networkId:text(b.networkId,"networkId",64),regenerate:b.regenerate===undefined?false:booleanValue(b.regenerate,"regenerate")}) as NetworkBridgeCodeCommand,execute:getNetworkBridgeCode,networkId:d=>d.networkId})}
