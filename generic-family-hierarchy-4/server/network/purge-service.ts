import {createClient} from "@supabase/supabase-js";
import type {RequestContext} from "../shared/request-context";
import {CommandError} from "../shared/errors";
import {getRuntimeConfig} from "../shared/runtime-config";

const NETWORK_BUCKETS=["profile-photos","community-media"] as const;

type StorageEntry={name:string;id?:string|null;metadata?:unknown};

async function listAllFiles(client:ReturnType<typeof createClient>,bucket:string,prefix:string):Promise<string[]> {
 const files:string[]=[];
 const queue=[prefix.replace(/\/+$/g,"")];
 while(queue.length){
  const dir=queue.shift()!;
  let offset=0;
  for(;;){
   const {data,error}=await client.storage.from(bucket).list(dir,{limit:100,offset,sortBy:{column:"name",order:"asc"}});
   if(error)throw new CommandError("STORAGE_LIST_FAILED",`Could not inspect ${bucket} during network purge: ${error.message}`,500);
   const rows=(data||[]) as StorageEntry[];
   for(const row of rows){
    const path=dir?`${dir}/${row.name}`:row.name;
    // Supabase folders are synthetic entries with no id/metadata. Traverse them; collect real objects.
    if(!row.id && row.metadata==null) queue.push(path); else files.push(path);
   }
   if(rows.length<100)break;
   offset+=rows.length;
  }
 }
 return files;
}

async function removeBatch(client:ReturnType<typeof createClient>,bucket:string,paths:string[]){
 for(let i=0;i<paths.length;i+=100){
  const batch=paths.slice(i,i+100);
  const {error}=await client.storage.from(bucket).remove(batch);
  if(error)throw new CommandError("STORAGE_DELETE_FAILED",`Could not delete ${bucket} media during network purge: ${error.message}`,500);
 }
}

export async function purgeOwnedNetwork(ctx:RequestContext,networkId:string,confirmName:string){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(networkId))throw new CommandError("INVALID_INPUT","Invalid network id.",400);
 if(!confirmName.trim())throw new CommandError("INVALID_INPUT","Type the exact network name to confirm permanent deletion.",400);
 const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
 if(!serviceKey)throw new CommandError("SERVER_NOT_CONFIGURED","Permanent deletion requires SUPABASE_SERVICE_ROLE_KEY on the server so Supabase Storage can be purged through the Storage API.",503);

 // Authorize and freeze the network before touching external storage. This is rerunnable and safe for an already archived network.
 const {error:prepareError}=await ctx.supabase.rpc("prepare_owned_network_for_purge",{p_network_id:networkId,p_confirm_name:confirmName});
 if(prepareError)throw prepareError;

 const {supabaseUrl}=getRuntimeConfig();
 const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 let deletedObjects=0;
 for(const bucket of NETWORK_BUCKETS){
  const paths=await listAllFiles(admin,bucket,networkId);
  if(paths.length){await removeBatch(admin,bucket,paths);deletedObjects+=paths.length;}
  const residue=await listAllFiles(admin,bucket,networkId);
  if(residue.length)throw new CommandError("STORAGE_RESIDUE",`${residue.length} ${bucket} object(s) remain after purge. The network was left archived and was not relationally deleted.`,500);
 }

 // Database purge runs only after Storage API verification succeeds.
 const {data,error}=await ctx.supabase.rpc("delete_owned_network_permanently",{p_network_id:networkId,p_confirm_name:confirmName});
 if(error)throw error;
 return {networkId:data?String(data):networkId,deletedStorageObjects:deletedObjects};
}
