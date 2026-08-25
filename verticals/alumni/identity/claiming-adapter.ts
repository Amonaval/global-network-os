import type {ClaimableIdentitySummary,IdentityClaimAdapter,IdentityClaimRequest,IdentityClaimResult} from "../../../core/identity/contracts";
import {claimAlumniProfile,fetchClaimableAlumniProfiles} from "../data/remote";
export const ALUMNI_IDENTITY_SUBJECT_TYPE="alumni_profile" as const;
export const ALUMNI_IDENTITY_CLAIM_ADAPTER:IdentityClaimAdapter={
 verticalKind:"alumni",subjectType:ALUMNI_IDENTITY_SUBJECT_TYPE,availability:"ready",
 async listClaimableIdentities():Promise<ClaimableIdentitySummary[]>{return (await fetchClaimableAlumniProfiles()).map(p=>({identity:{verticalKind:"alumni",subjectType:ALUMNI_IDENTITY_SUBJECT_TYPE,subjectId:p.profile_id},networkId:p.network_id,networkName:p.network_name,displayName:p.full_name,secondaryLabel:[p.program,p.graduation_year].filter(Boolean).join(" · "),claimMethod:"verified_email"}));},
 getEligibility(request:IdentityClaimRequest){const ok=request.identity.verticalKind==="alumni"&&request.identity.subjectType===ALUMNI_IDENTITY_SUBJECT_TYPE&&request.method==="verified_email";return {eligible:ok,method:request.method,verificationRequired:true,reason:ok?undefined:"Alumni claiming requires a verified-email alumni profile."};},
 async claimIdentity(request:IdentityClaimRequest):Promise<IdentityClaimResult>{const eligibility=this.getEligibility(request);if(!eligibility.eligible)throw new Error(eligibility.reason);const networkId=await claimAlumniProfile(request.identity.subjectId);return {claimed:true,identity:request.identity,networkId,method:request.method};}
};
