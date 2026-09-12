self.addEventListener('push',event=>{
 let payload={title:'TrustWeave',body:'You have a new update.',url:'/'};
 try{if(event.data)payload={...payload,...event.data.json()}}catch{}
 event.waitUntil(self.registration.showNotification(payload.title||'TrustWeave',{
  body:payload.body||'',tag:payload.tag||payload.notificationId||'trustweave-update',renotify:!!payload.renotify,
  data:{url:payload.url||'/'},icon:payload.icon||undefined,badge:payload.badge||undefined
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const url=event.notification?.data?.url||'/';
 event.waitUntil((async()=>{const clientsList=await clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clientsList){if('navigate'in client){await client.navigate(url);return client.focus()}}return clients.openWindow(url)})());
});
