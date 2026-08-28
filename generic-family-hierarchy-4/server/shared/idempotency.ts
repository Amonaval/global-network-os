import {createHash} from "node:crypto";
import type {RequestContext} from "./request-context";
import {CommandError} from "./errors";

function canonical(value:unknown):string{
 if(Array.isArray(value))return `[${value.map(canonical).join(",")}]`;
 if(value&&typeof value==="object"){const o=value as Record<string,unknown>;return `{${Object.keys(o).sort().map(k=>`${JSON.stringify(k)}:${canonical(o[k])}`).join(",")}}`}
 const encoded=JSON.stringify(value);return encoded===undefined?"null":encoded;
}
function hashBody(value:unknown){return createHash("sha256").update(canonical(value)).digest("hex")}

export type IdempotencyDecision<T>={state:"execute"}|{state:"cached";data:T};

export async function beginIdempotency<T>(ctx:RequestContext,command:string,key:string,body:unknown):Promise<IdempotencyDecision<T>>{
 const normalized=key.trim();if(normalized.length<8||normalized.length>128)throw new CommandError("INVALID_IDEMPOTENCY_KEY","Idempotency-Key must be 8 to 128 characters.",400);
 const {data,error}=await ctx.supabase.rpc("begin_api_command_idempotency",{p_command:command,p_key:normalized,p_request_hash:hashBody(body)});
 if(error){if(error.code==="23505"||/different request/i.test(error.message||""))throw new CommandError("IDEMPOTENCY_KEY_REUSED","Idempotency key was already used with a different request.",409);throw error}const result=(data||{}) as any;
 if(result.state==="cached")return {state:"cached",data:result.response as T};
 if(result.state==="in_progress")throw new CommandError("COMMAND_IN_PROGRESS","An identical command is already in progress.",409);
 if(result.state!=="execute")throw new CommandError("IDEMPOTENCY_FAILED","Could not establish idempotency state.",503);
 return {state:"execute"};
}
export async function completeIdempotency(ctx:RequestContext,command:string,key:string,response:unknown){const {error}=await ctx.supabase.rpc("complete_api_command_idempotency",{p_command:command,p_key:key.trim(),p_response:response});if(error)throw error}
export async function releaseIdempotency(ctx:RequestContext,command:string,key:string){const {error}=await ctx.supabase.rpc("release_api_command_idempotency",{p_command:command,p_key:key.trim()});if(error)console.warn(JSON.stringify({type:"network_os_operational_warning",warning:"idempotency_release_failed",command,requestId:ctx.requestId}))}
