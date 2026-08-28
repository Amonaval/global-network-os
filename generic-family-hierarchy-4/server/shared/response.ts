import {NextResponse} from "next/server";
import type {ApiFailure,ApiSuccess} from "../../core/api/contracts";
import {normalizeCommandError} from "./errors";
export function commandSuccess<T>(requestId:string,data:T,status=200){return NextResponse.json<ApiSuccess<T>>({ok:true,data,requestId},{status,headers:{"x-request-id":requestId}})}
export function commandFailure(requestId:string,error:unknown){const x=normalizeCommandError(error);return NextResponse.json<ApiFailure>({ok:false,error:{code:x.code,message:x.message},requestId},{status:x.status,headers:{"x-request-id":requestId}})}
export function logCommand(input:{requestId:string;actorId:string;command:string;networkId?:string;outcome:"success"|"failure";startedAt:number;errorCode?:string}){console.info(JSON.stringify({type:"network_os_command",...input,durationMs:Date.now()-input.startedAt}))}
