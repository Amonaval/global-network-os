import {supabase} from "./supabase";
import type {ApiResponse} from "../core/api/contracts";

export async function postCommand<TResponse>(path:string,body:unknown):Promise<TResponse>{
 if(!supabase)throw new Error("Shared Supabase mode is required.");
 const {data:{session}}=await supabase.auth.getSession();
 if(!session?.access_token)throw new Error("Please sign in to continue.");
 const response=await fetch(path,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},body:JSON.stringify(body)});
 const payload=await response.json() as ApiResponse<TResponse>;
 if(!response.ok||!payload.ok)throw new Error(payload.ok?"Command failed.":payload.error.message);
 return payload.data;
}
