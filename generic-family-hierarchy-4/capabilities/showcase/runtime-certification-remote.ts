import {supabase} from "../../lib/supabase";
import type {DiscoveryDiagnostic,ShowcaseRuntimeCertification} from "../../core/showcase/runtime-certification";
function required(){if(!supabase)throw new Error("Shared Supabase mode is required.");return supabase}
export async function fetchShowcaseRuntimeCertification():Promise<ShowcaseRuntimeCertification>{const {data,error}=await required().rpc("get_my_showcase_runtime_certification");if(error)throw error;return data as ShowcaseRuntimeCertification}
export async function diagnoseDiscovery(sourceNetworkId:string,query:string):Promise<DiscoveryDiagnostic>{const {data,error}=await required().rpc("diagnose_cross_network_discovery",{p_source_network_id:sourceNetworkId,p_query:query});if(error)throw error;return data as DiscoveryDiagnostic}
