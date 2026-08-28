import {NextResponse} from "next/server";
import {runtimeConfigStatus,getRuntimeConfig} from "../../../server/shared/runtime-config";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const config=runtimeConfigStatus();
 if(!config.ok)return NextResponse.json({ok:false,status:"not_ready",reason:"configuration",missing:config.missing},{status:503,headers:{"cache-control":"no-store"}});
 try{
  const {supabaseUrl,supabaseAnonKey}=getRuntimeConfig();const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),2500);
  const response=await fetch(`${supabaseUrl.replace(/\/$/,"")}/auth/v1/health`,{headers:{apikey:supabaseAnonKey},signal:controller.signal,cache:"no-store"});clearTimeout(timer);
  if(!response.ok)throw new Error(`Supabase health returned ${response.status}`);
  return NextResponse.json({ok:true,status:"ready",environment:config.environment},{headers:{"cache-control":"no-store"}});
 }catch{return NextResponse.json({ok:false,status:"not_ready",reason:"dependency"},{status:503,headers:{"cache-control":"no-store"}})}
}
