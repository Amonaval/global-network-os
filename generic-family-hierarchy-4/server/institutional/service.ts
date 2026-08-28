import type {BootstrapInstitutionCommand,BootstrapInstitutionResult} from "../../core/api/contracts";
import type {RequestContext} from "../shared/request-context";
export async function bootstrapInstitution(ctx:RequestContext,c:BootstrapInstitutionCommand):Promise<BootstrapInstitutionResult>{const {data,error}=await ctx.supabase.rpc("import_productized_network_entities",{p_rows:c.rows});if(error)throw error;const r=(data||[])[0]||{};return {inserted:Number(r.inserted||0),updated:Number(r.updated||0),skipped:Number(r.skipped||0)}}
