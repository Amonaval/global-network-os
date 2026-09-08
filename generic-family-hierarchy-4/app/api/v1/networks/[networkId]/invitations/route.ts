import {createClient} from "@supabase/supabase-js";
import {createRequestContext} from "../../../../../../server/shared/request-context";
import {normalizeCommandError} from "../../../../../../server/shared/errors";
import {getRuntimeConfig} from "../../../../../../server/shared/runtime-config";
export const runtime="nodejs";
async function dispatch(email:string,link:string){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
 if(!key)return {delivery:"manual_link" as const,message:"Invitation created. Configure SUPABASE_SERVICE_ROLE_KEY for Supabase Auth email delivery."};
 try{
  const {supabaseUrl}=getRuntimeConfig(),admin=createClient(supabaseUrl,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:link});
  if(error)return {delivery:"manual_link" as const,message:`Invitation link created; automatic email was not accepted by Supabase Auth (${error.message}). Share the link manually.`};
  return {delivery:"email" as const,message:"Invitation email requested through Supabase Auth."};
 }catch(e:any){return {delivery:"manual_link" as const,message:`Invitation link created; email dispatch unavailable (${e.message||"provider error"}).`};}
}
export async function POST(request:Request,{params}:{params:{networkId:string}}){
 const requestId=request.headers.get("x-request-id")||crypto.randomUUID();
 try{
  const ctx=await createRequestContext(request),body=await request.json() as any;let row:any;
  if(body.action==="resend"){
   const {data,error}=await ctx.supabase.rpc("resend_network_participation_invitation",{p_network_id:params.networkId,p_invitation_id:String(body.invitationId||"")});if(error)throw error;row=data;
  }else if(body.action==="create"){
   const {data,error}=await ctx.supabase.rpc("create_network_participation_invitation",{p_network_id:params.networkId,p_email:String(body.email||""),p_target_ref:body.targetRef||null,p_target_kind:body.targetKind||null,p_invited_role:"member",p_expires_days:14});if(error)throw error;row=data;
  }else throw new Error("Unsupported invitation action.");
  const origin=process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/,"")||new URL(request.url).origin,link=`${origin}/?networkInvite=${encodeURIComponent(String(row.token))}`,delivery=await dispatch(String(row.email),link);
  return Response.json({ok:true,requestId,data:{invitationId:String(row.id),email:String(row.email),link,...delivery}});
 }catch(error){const e=normalizeCommandError(error);return Response.json({ok:false,requestId,error:{code:e.code,message:e.message}},{status:e.status});}
}
