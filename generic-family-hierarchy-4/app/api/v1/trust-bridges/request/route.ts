import type {RequestNetworkBridgeCommand} from "../../../../../core/api/contracts";
import {requestNetworkBridge} from "../../../../../server/trust/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {booleanValue,optionalText,text} from "../../../../../server/shared/validation";
import {CommandError} from "../../../../../server/shared/errors";
const TYPES=new Set(["affiliation","community","partner","parent_child","trusted_peer"]);
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"requestNetworkBridge",successStatus:201,rateLimit:{limit:15},parse:b=>{const relationshipType=text(b.relationshipType,"relationshipType",40);if(!TYPES.has(relationshipType))throw new CommandError("INVALID_BRIDGE_TYPE","Unsupported network bridge relationship type.",400);const c=(b.capabilities||{}) as Record<string,unknown>;return {sourceNetworkId:text(b.sourceNetworkId,"sourceNetworkId",64),targetCode:text(b.targetCode,"targetCode",80),relationshipType:relationshipType as RequestNetworkBridgeCommand["relationshipType"],contextLabel:optionalText(b.contextLabel,200),capabilities:{discovery:booleanValue(c.discovery??false,"capabilities.discovery"),introductions:booleanValue(c.introductions??false,"capabilities.introductions"),pathTraversal:booleanValue(c.pathTraversal??false,"capabilities.pathTraversal")}}},execute:requestNetworkBridge})}
