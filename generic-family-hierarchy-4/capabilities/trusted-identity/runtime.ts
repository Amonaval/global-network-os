import type { TrustedNetworkReach, TrustedPersonIdentity } from "../../core/identity/trusted-person";
import { supabase } from "../../lib/supabase";
import { fetchMyNetworkMemberships } from "../network-context/remote";


const EMPTY_REACH: TrustedNetworkReach = {activeNetworks:0,ownedNetworks:0,administeredNetworks:0,verticals:0,uniqueMemberAccounts:0,membershipEdges:0,claimedContexts:0};

type TrustedReachTransport = {
  active_networks?: number; owned_networks?: number; administered_networks?: number; verticals?: number;
  unique_member_accounts?: number; membership_edges?: number; claimed_contexts?: number;
};

export async function fetchTrustedNetworkReach(): Promise<TrustedNetworkReach> {
  if (!supabase) return EMPTY_REACH;
  const {data,error}=await supabase.rpc("get_my_trusted_network_reach");
  if (error) throw error;
  const row=(data||{}) as TrustedReachTransport;
  return {
    activeNetworks:Number(row.active_networks||0),
    ownedNetworks:Number(row.owned_networks||0),
    administeredNetworks:Number(row.administered_networks||0),
    verticals:Number(row.verticals||0),
    uniqueMemberAccounts:Number(row.unique_member_accounts||0),
    membershipEdges:Number(row.membership_edges||0),
    claimedContexts:Number(row.claimed_contexts||0),
  };
}

/**
 * Build the NX-1 trusted-person aggregate without introducing new persistence.
 * auth.users remains the authentication anchor while vertical profile bindings
 * stay in their existing Family/Alumni/generic stores.
 */
export async function buildTrustedPersonIdentity(user: {id:string;email?:string|null;user_metadata?:Record<string,unknown>|null} | null): Promise<TrustedPersonIdentity | null> {
  if (!user?.id) return null;
  const [memberships,reach] = await Promise.all([fetchMyNetworkMemberships(),fetchTrustedNetworkReach()]);
  const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const email = user.email || null;
  return {
    id: user.id,
    email,
    displayName: metadataName || (email ? email.split("@")[0] : "You"),
    memberships,
    reach,
  };
}
