import {CommandError} from "./errors";

type Bucket={count:number;resetAt:number};
type Store=Map<string,Bucket>;
const globalStore=globalThis as typeof globalThis&{__networkOsBurstGuard?:Store};
const store=globalStore.__networkOsBurstGuard||(globalStore.__networkOsBurstGuard=new Map());

export function enforceBurstLimit(key:string,limit=30,windowMs=60_000){
 const now=Date.now();const current=store.get(key);
 if(!current||current.resetAt<=now){store.set(key,{count:1,resetAt:now+windowMs});return}
 current.count+=1;
 if(current.count>limit)throw new CommandError("RATE_LIMITED","Too many requests. Please retry shortly.",429);
 if(store.size>5000){for(const [k,v] of store)if(v.resetAt<=now)store.delete(k)}
}
