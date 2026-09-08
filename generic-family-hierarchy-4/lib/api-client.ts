import {supabase} from "./supabase";
import type {ApiResponse} from "../core/api/contracts";

export class ApiCommandError extends Error{constructor(message:string,public code:string,public requestId?:string,public status?:number){super(message);this.name="ApiCommandError"}}
export type PostCommandOptions={idempotent?:boolean;retryTransient?:boolean};

export async function postCommand<TResponse>(path:string,body:unknown,options:PostCommandOptions={}):Promise<TResponse>{
 if(!supabase)throw new ApiCommandError("Shared Supabase mode is required.","CLIENT_NOT_CONFIGURED");
 const {data:{session}}=await supabase.auth.getSession();
 if(!session?.access_token)throw new ApiCommandError("Please sign in to continue.","UNAUTHENTICATED");
 const requestId=crypto.randomUUID();const idempotencyKey=options.idempotent?crypto.randomUUID():undefined;
 const attempts=options.idempotent&&options.retryTransient!==false?2:1;
 for(let attempt=1;attempt<=attempts;attempt++){
  try{
   const response=await fetch(path,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`,"x-request-id":requestId,...(idempotencyKey?{"idempotency-key":idempotencyKey}:{})},body:JSON.stringify(body)});
   let payload:ApiResponse<TResponse>|null=null;try{payload=await response.json() as ApiResponse<TResponse>}catch{}
   if(response.ok&&payload?.ok)return payload.data;
   let code="HTTP_ERROR";let message=`Command failed with HTTP ${response.status}.`;
   if(payload&&payload.ok===false){code=payload.error.code;message=payload.error.message}
   if(attempt<attempts&&[502,503,504].includes(response.status)){await new Promise(r=>setTimeout(r,150*attempt));continue}
   throw new ApiCommandError(message,code,payload?.requestId||requestId,response.status);
  }catch(error){
   if(error instanceof ApiCommandError)throw error;
   if(attempt<attempts){await new Promise(r=>setTimeout(r,150*attempt));continue}
   throw new ApiCommandError(error instanceof Error?error.message:"Network request failed.","NETWORK_ERROR",requestId);
  }
 }
 throw new ApiCommandError("Command failed.","COMMAND_FAILED",requestId);
}
