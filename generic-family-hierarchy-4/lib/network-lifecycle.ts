import {supabase} from "./supabase";
function required(){if(!supabase)throw new Error("Shared Supabase mode is required.");return supabase}
export async function deleteOwnedNetworkPermanently(networkId:string,confirmName:string){const {data,error}=await required().rpc("delete_owned_network_permanently",{p_network_id:networkId,p_confirm_name:confirmName});if(error)throw error;return data?String(data):null}
