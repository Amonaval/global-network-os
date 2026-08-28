import type {ClaimIdentityCommand} from "../../../../../core/api/contracts";
import {claimIdentity} from "../../../../../server/identity/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {text} from "../../../../../server/shared/validation";
import {CommandError} from "../../../../../server/shared/errors";
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"claimIdentity",rateLimit:{limit:15},parse:b=>{const kind=text(b.kind,"kind",40);if(kind!=="family"&&kind!=="alumni"&&kind!=="productized")throw new CommandError("INVALID_NETWORK_KIND","Unsupported identity type.");return {kind,subjectId:text(b.subjectId,"subjectId",100)} as ClaimIdentityCommand},execute:claimIdentity,networkId:data=>data.networkId})}
