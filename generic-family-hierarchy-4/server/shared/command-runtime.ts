import type {RequestContext} from "./request-context";
import {createRequestContext} from "./request-context";
import {commandFailure,commandSuccess,logCommand} from "./response";
import {readJsonObject} from "./request-safety";
import {enforceBurstLimit} from "./rate-limit";
import {beginIdempotency,completeIdempotency,releaseIdempotency} from "./idempotency";
import {CommandError,normalizeCommandError} from "./errors";

type IdempotencyMode="none"|"optional"|"required";
type CommandRuntimeOptions<TCommand,TResult>={
 request:Request;commandName:string;parse:(body:Record<string,unknown>)=>TCommand;execute:(ctx:RequestContext,command:TCommand)=>Promise<TResult>;
 successStatus?:number;maxBodyBytes?:number;rateLimit?:{limit:number;windowMs?:number};idempotency?:IdempotencyMode;networkId?:(result:TResult,ctx:RequestContext)=>string|undefined;
};

export async function executeCommand<TCommand,TResult>(o:CommandRuntimeOptions<TCommand,TResult>){
 let requestId=o.request.headers.get("x-request-id")||crypto.randomUUID();let ctx:RequestContext|null=null;let idemKey:string|undefined;let idemEstablished=false;
 try{
  const body=await readJsonObject(o.request,{maxBodyBytes:o.maxBodyBytes});
  ctx=await createRequestContext(o.request);requestId=ctx.requestId;
  enforceBurstLimit(`${ctx.user.id}:${o.commandName}`,o.rateLimit?.limit??30,o.rateLimit?.windowMs??60_000);
  const mode=o.idempotency??"none";idemKey=o.request.headers.get("idempotency-key")?.trim()||undefined;
  if(mode==="required"&&!idemKey)throw new CommandError("IDEMPOTENCY_KEY_REQUIRED","Idempotency-Key is required for this command.",400);
  if(idemKey&&mode!=="none"){
   const decision=await beginIdempotency<TResult>(ctx,o.commandName,idemKey,body);
   if(decision.state==="cached"){
    logCommand({requestId,actorId:ctx.user.id,command:o.commandName,networkId:o.networkId?.(decision.data,ctx),outcome:"success",startedAt:ctx.startedAt,idempotency:"cached"});
    return commandSuccess(requestId,decision.data,o.successStatus??200);
   }
   idemEstablished=true;
  }
  const command=o.parse(body);const data=await o.execute(ctx,command);
  if(idemEstablished&&idemKey)await completeIdempotency(ctx,o.commandName,idemKey,data);
  logCommand({requestId,actorId:ctx.user.id,command:o.commandName,networkId:o.networkId?.(data,ctx),outcome:"success",startedAt:ctx.startedAt,idempotency:idemEstablished?"stored":"none"});
  return commandSuccess(requestId,data,o.successStatus??200);
 }catch(error){
  const normalized=normalizeCommandError(error);
  if(ctx&&idemEstablished&&idemKey)await releaseIdempotency(ctx,o.commandName,idemKey);
  if(ctx)logCommand({requestId,actorId:ctx.user.id,command:o.commandName,networkId:ctx.activeNetworkId,outcome:"failure",startedAt:ctx.startedAt,errorCode:normalized.code,idempotency:idemEstablished?"released":"none"});
  return commandFailure(requestId,normalized);
 }
}
