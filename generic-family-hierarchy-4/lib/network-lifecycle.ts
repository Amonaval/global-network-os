import {supabase} from "./supabase";
function required(){if(!supabase)throw new Error("Shared Supabase mode is required.");return supabase}
export type ArchivedNetwork={networkId:string;name:string;slug:string;role:"owner";verticalKind:string;archivedAt:string};
export type PurgeReceipt={networkId:string;purgedAt:string;relationalResidue:number;storageResidue:number;verifierVersion:string;clean:boolean};
export async function leaveNetwork(networkId:string){const {data,error}=await required().rpc("leave_owned_network",{p_network_id:networkId});if(error)throw error;return data?String(data):null}
export async function archiveNetwork(networkId:string,confirmName:string){const {data,error}=await required().rpc("archive_owned_network",{p_network_id:networkId,p_confirm_name:confirmName});if(error)throw error;return data?String(data):null}
export async function restoreNetwork(networkId:string){const {error}=await required().rpc("restore_owned_network",{p_network_id:networkId});if(error)throw error}
export async function fetchMyArchivedNetworks():Promise<ArchivedNetwork[]>{const {data,error}=await required().rpc("get_my_archived_networks");if(error)throw error;return (data||[]).map((r:any)=>({networkId:String(r.network_id),name:String(r.name),slug:String(r.slug),role:"owner" as const,verticalKind:String(r.vertical_kind),archivedAt:String(r.archived_at)}))}
export async function deleteOwnedNetworkPermanently(networkId:string,confirmName:string){
 const s=required();
 const {data:{session},error:sessionError}=await s.auth.getSession();
 if(sessionError)throw sessionError;
 if(!session?.access_token)throw new Error("Please sign in before permanently deleting a network.");
 const response=await fetch(`/api/v1/networks/${encodeURIComponent(networkId)}/purge`,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${session.access_token}`},body:JSON.stringify({confirmName})});
 const payload=await response.json().catch(()=>null) as any;
 if(!response.ok||!payload?.ok)throw new Error(payload?.error?.message||"Could not permanently delete network.");
 return payload?.data?.networkId?String(payload.data.networkId):networkId;
}
export async function fetchMyNetworkPurgeReceipt(networkId:string):Promise<PurgeReceipt|null>{const {data,error}=await required().rpc("get_my_network_purge_receipt",{p_network_id:networkId});if(error)throw error;if(!data||Object.keys(data).length===0)return null;return data as PurgeReceipt}
