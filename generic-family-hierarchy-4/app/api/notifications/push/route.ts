import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import webpush from "web-push";
import {createRequestContext} from "../../../../server/shared/request-context";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  const ctx=await createRequestContext(request);const body=await request.json() as {notificationId?:string};if(!body.notificationId)return NextResponse.json({ok:false,error:"notificationId required"},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),service=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();if(!url||!service)return NextResponse.json({ok:false,error:"Push server is not configured."},{status:503});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:n,error}=await admin.from("notifications").select("id,user_id,network_id,actor_id,title,body,href,priority").eq("id",body.notificationId).maybeSingle();if(error||!n)return NextResponse.json({ok:false,error:"Notification not found."},{status:404});
  const {data:owner}=await admin.from("platform_owners").select("user_id").eq("user_id",ctx.user.id).maybeSingle();if(n.actor_id!==ctx.user.id&&!owner)return NextResponse.json({ok:false,error:"Not authorized."},{status:403});
  const publicKey=process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY?.trim(),privateKey=process.env.WEB_PUSH_VAPID_PRIVATE_KEY?.trim(),subject=process.env.WEB_PUSH_VAPID_SUBJECT?.trim()||"mailto:admin@example.com";if(!publicKey||!privateKey)return NextResponse.json({ok:false,error:"VAPID keys are not configured."},{status:503});
  webpush.setVapidDetails(subject,publicKey,privateKey);
  const {data:subs}=await admin.from("push_subscriptions").select("id,endpoint,p256dh,auth_key").eq("user_id",n.user_id).eq("active",true);let delivered=0,expired=0;
  for(const sub of subs||[]){try{await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth_key}},JSON.stringify({notificationId:n.id,title:n.title,body:n.body||"",url:n.href||"/",renotify:n.priority==="urgent"}));delivered++}catch(e:any){if(e?.statusCode===404||e?.statusCode===410){expired++;await admin.from("push_subscriptions").update({active:false,updated_at:new Date().toISOString()}).eq("id",sub.id)}}}
  return NextResponse.json({ok:true,delivered,expired});
 }catch(e:any){return NextResponse.json({ok:false,error:e?.message||"Push delivery failed."},{status:500})}
}
