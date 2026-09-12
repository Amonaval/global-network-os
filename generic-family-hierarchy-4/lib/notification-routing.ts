export type NotificationDeepLink={networkId?:string;surface?:string;itemId?:string};

export function buildNotificationDeepLink(input:NotificationDeepLink){
 const params=new URLSearchParams();
 if(input.networkId)params.set("twNetwork",input.networkId);
 if(input.surface)params.set("twSurface",input.surface);
 if(input.itemId)params.set("twItem",input.itemId);
 const query=params.toString();
 return query?`/?${query}`:"/";
}

export function readNotificationDeepLink(search?:string):NotificationDeepLink{
 if(typeof window==="undefined"&&!search)return {};
 const params=new URLSearchParams(search??window.location.search);
 return {networkId:params.get("twNetwork")||undefined,surface:params.get("twSurface")||undefined,itemId:params.get("twItem")||undefined};
}

export function clearNotificationDeepLink(){
 if(typeof window==="undefined")return;
 const url=new URL(window.location.href);
 ["twNetwork","twSurface","twItem"].forEach(k=>url.searchParams.delete(k));
 window.history.replaceState({},"",`${url.pathname}${url.search}${url.hash}`);
}
