import type {ParticipationAdapter} from "../../../core/participation/contracts";
import {acceptAlumniInvitation,createAlumniInvitation,previewAlumniInvitation} from "../data/remote";
export const ALUMNI_PARTICIPATION_ADAPTER:ParticipationAdapter={
 verticalKind:"alumni",availability:"ready",
 async createInvitations(items){const out=[];for(const item of items){const token=await createAlumniInvitation(item.identity.subjectId,item.recipientHint);out.push({invitationId:token,identity:item.identity,token});}return out;},
 async listInvitations(){return[];},async revokeInvitation(){throw new Error("Alumni invitation management will be expanded after V1 pilot feedback.");},async resendInvitation(){throw new Error("Alumni invitation resend will be expanded after V1 pilot feedback.");},
 async previewInvitation(token){const p=await previewAlumniInvitation(token);return p?{displayName:p.full_name,status:p.status as any,expiresAt:p.expires_at}:null;},
 async acceptInvitation(token){const networkId=await acceptAlumniInvitation(token);return {verticalKind:"alumni",subjectType:"alumni_profile",subjectId:networkId};},
 async listContributionPrompts(){return[];},async actOnContributionPrompt(){return;},async getMetrics(){return null;},async trackPublicParticipation(){return;}
};
