import {createClient} from "@supabase/supabase-js";
import type {RequestContext} from "../shared/request-context";
import {getRuntimeConfig} from "../shared/runtime-config";
const BUCKETS=["profile-photos","community-media"] as const;
type Entry={name:string;id?:string|null;metadata?:unknown};
type StorageApi=ReturnType<typeof createClient>["storage"];
async function listAll(storage:StorageApi,bucket:string,prefix:string){const out:string[]=[];const queue=[prefix];while(queue.length){const dir=queue.shift()!;let offset=0;for(;;){const {data,error}=await storage.from(bucket).list(dir,{limit:100,offset});if(error)throw error;const rows=(data||[]) as Entry[];for(const row of rows){const path=dir?`${dir}/${row.name}`:row.name;if(!row.id&&row.metadata==null)queue.push(path);else out.push(path)}if(rows.length<100)break;offset+=rows.length}}return out}
export async function buildNetworkExport(ctx:RequestContext,networkId:string){
 const {data,error}=await ctx.supabase.rpc("get_network_logical_backup",{p_network_id:networkId}); if(error)throw error;
 const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(); const buckets:Record<string,string[]>={}; const limitations:string[]=[];
 if(serviceKey){const {supabaseUrl}=getRuntimeConfig();const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});for(const b of BUCKETS)buckets[b]=await listAll(admin.storage,b,networkId)}else{for(const b of BUCKETS)buckets[b]=[];limitations.push("Storage manifest unavailable because SUPABASE_SERVICE_ROLE_KEY is not configured on the server.")}
 const count=Object.values(buckets).reduce((n,v)=>n+v.length,0);
 return {...(data as Record<string,unknown>),media:{strategy:"manifest",buckets,objectCount:count,contentIncluded:false,limitations:[...limitations,"Media bytes are not embedded in the logical JSON/XLSX export; paths are recorded for recovery planning."]}};
}
