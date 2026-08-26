import type { TrustedPersonIdentity } from "../../core/identity/trusted-person";
import { fetchMyNetworkMemberships } from "../network-context/remote";

/**
 * Build the NX-1 trusted-person aggregate without introducing new persistence.
 * auth.users remains the authentication anchor while vertical profile bindings
 * stay in their existing Family/Alumni/generic stores.
 */
export async function buildTrustedPersonIdentity(user: {id:string;email?:string|null;user_metadata?:Record<string,unknown>|null} | null): Promise<TrustedPersonIdentity | null> {
  if (!user?.id) return null;
  const memberships = await fetchMyNetworkMemberships();
  const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const email = user.email || null;
  return {
    id: user.id,
    email,
    displayName: metadataName || (email ? email.split("@")[0] : "You"),
    memberships,
  };
}
