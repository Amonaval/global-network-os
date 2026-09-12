import {supabase} from "../../lib/supabase";
import type {NetworkAffiliatedEntity,NetworkProjectionDefinition} from "../../core/network-os/contracts";
import {fetchEntityMediaAssets} from "../../lib/storage";
function required(){if(!supabase)throw new Error("Shared Supabase mode is required for network affiliations.");return supabase}
export async function fetchNetworkAffiliatedEntities(){
 const s=required();const {data,error}=await s.rpc("get_network_affiliated_entities");if(error)throw error;
 const rows=(data||[]).map((row:any)=>({entity:{id:String(row.entity_id),networkId:"active",kind:String(row.entity_kind),label:String(row.entity_label),externalRef:row.external_ref?String(row.external_ref):null,ownerUserId:row.owner_user_id?String(row.owner_user_id):null,metadata:row.metadata||{}},affiliations:Object.fromEntries(Object.entries(row.affiliations||{}).map(([k,v])=>[k,Array.isArray(v)?v.map(String):[]]))})) as NetworkAffiliatedEntity[];
 const media=await fetchEntityMediaAssets("network_entity",rows.map(x=>x.entity.id)).catch(()=>[]);const by=new Map(media.map(x=>[x.entityId,x] as const));
 for(const row of rows){const asset=by.get(row.entity.id);if(asset?.thumbnailUrl||asset?.url)row.entity.metadata={...(row.entity.metadata||{}),photo_display_url:asset.thumbnailUrl||asset.url};}
 return rows;
}
export async function fetchNetworkProjections(){const s=required();const {data,error}=await s.rpc("get_network_projections");if(error)throw error;return (data||[]).map((row:any)=>({key:String(row.projection_key),label:String(row.label),levels:(row.levels||[]).map(String),default:Boolean(row.is_default)})) as NetworkProjectionDefinition[]}
