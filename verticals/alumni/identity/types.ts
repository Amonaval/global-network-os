/**
 * Alumni identity is intentionally separate from family_members.
 * Persistence arrives with the Alumni vertical; these types exist now to prove the shared identity seam.
 */
export type AlumniIdentityProfile = {
  id: string;
  networkId: string;
  fullName: string;
  institutionId: string;
  institutionName: string;
  graduationYear?: number | null;
  program?: string | null;
  department?: string | null;
};
