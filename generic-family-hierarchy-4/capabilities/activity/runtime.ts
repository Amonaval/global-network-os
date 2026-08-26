import type {NetworkActivity,NetworkActivityType} from "../../core/network-os/contracts";
export function groupActivities(items:readonly NetworkActivity[]){
 return items.reduce<Record<NetworkActivityType,NetworkActivity[]>>((acc,item)=>{acc[item.type].push(item);return acc},{event:[],memory:[],milestone:[],announcement:[]});
}
export function upcomingEvents(items:readonly NetworkActivity[],now=Date.now()){
 return items.filter(x=>x.type==="event"&&x.startsAt&&new Date(x.startsAt).getTime()>=now).sort((a,b)=>new Date(a.startsAt!).getTime()-new Date(b.startsAt!).getTime());
}
