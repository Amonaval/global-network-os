import {supabase} from "./supabase";

function urlBase64ToUint8Array(base64String:string){const padding="=".repeat((4-base64String.length%4)%4);const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");const raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}
export function canUseWebPush(){return typeof window!=="undefined"&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window}
export async function getWebPushState(){if(!canUseWebPush())return {supported:false,permission:"unsupported" as const,subscribed:false};const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();return {supported:true,permission:Notification.permission,subscribed:!!sub}}
export async function enableWebPush(){
 if(!supabase||!canUseWebPush())throw new Error("Push notifications are not supported on this device.");
 const key=process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY?.trim();if(!key)throw new Error("Web Push is not configured for this deployment.");
 const permission=await Notification.requestPermission();if(permission!=="granted")throw new Error("Notification permission was not granted.");
 const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(key)});
 const json=sub.toJSON();const {error}=await supabase.rpc("upsert_my_push_subscription",{p_endpoint:sub.endpoint,p_p256dh:json.keys?.p256dh||"",p_auth:json.keys?.auth||"",p_user_agent:navigator.userAgent});if(error)throw error;return sub;
}
export async function disableWebPush(){
 if(!supabase||!canUseWebPush())return;const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(sub){const {error}=await supabase.rpc("disable_my_push_subscription",{p_endpoint:sub.endpoint});if(error)throw error;await sub.unsubscribe()}
}
export async function requestPushDelivery(notificationId:string){
 if(!supabase)return;const {data:{session}}=await supabase.auth.getSession();if(!session?.access_token)return;
 await fetch("/api/notifications/push",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},body:JSON.stringify({notificationId})}).catch(()=>{});
}
