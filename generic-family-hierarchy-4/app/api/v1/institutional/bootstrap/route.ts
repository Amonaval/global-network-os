import type {BootstrapInstitutionCommand} from "../../../../../core/api/contracts";
import {bootstrapInstitution} from "../../../../../server/institutional/service";
import {executeCommand} from "../../../../../server/shared/command-runtime";
import {objectBody,text} from "../../../../../server/shared/validation";
import {CommandError} from "../../../../../server/shared/errors";
export const runtime="nodejs";
export async function POST(request:Request){return executeCommand({request,commandName:"bootstrapInstitution",idempotency:"required",maxBodyBytes:1_500_000,rateLimit:{limit:6,windowMs:60_000},parse:b=>{if(!Array.isArray(b.rows)||b.rows.length<1||b.rows.length>500)throw new CommandError("INVALID_INPUT","Bootstrap requires 1 to 500 rows.");const rows=b.rows.map((raw,i)=>{const r=objectBody(raw);return {kind:typeof r.kind==="string"?r.kind:undefined,label:text(r.label,`rows[${i}].label`,200),metadata:r.metadata&&typeof r.metadata==="object"&&!Array.isArray(r.metadata)?r.metadata as Record<string,unknown>:undefined,affiliations:r.affiliations&&typeof r.affiliations==="object"&&!Array.isArray(r.affiliations)?r.affiliations as Record<string,string|string[]>:undefined}});return {rows} as BootstrapInstitutionCommand},execute:bootstrapInstitution,networkId:(_data,ctx)=>ctx.activeNetworkId})}
