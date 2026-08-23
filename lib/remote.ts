import { supabase } from "./supabase";
import {
  AuditEntry,
  ChangeRequest,
  LifeEvent,
  Member,
  Relationship,
  Submission,
  Memory,
  Notification,
  NetworkAnalytics,
} from "./types";
import {MemberInvitation,ContributionSuggestion,CommunityGroup,CommunityEvent,ParticipationMetrics} from "./participation-types";
import { NetworkSettings } from "./network";
import { resolveSignedUrls } from "./storage";

const mapMember = (m: any): Member => ({
  ...m,
  generation_level: Number(m.generation_level),
});
const mapRelationship = (r: any): Relationship => ({
  id: r.id,
  person_id: r.person_id,
  related_person_id: r.related_person_id,
  relationship_type: r.relationship_type,
});
const mapChangeRequest = (r: any): ChangeRequest => ({
  ...r,
  payload: r.payload || {},
});
const mapAudit = (r: any): AuditEntry => ({ ...r, details: r.details || {} });
const mapLifeEvent = (r: any): LifeEvent => ({
  ...r,
  visibility: r.visibility || "member",
});


const isUuidValue = (value: unknown) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));

export type PlatformFeatureRow={feature_key:string;rollout_state:"hidden"|"test"|"pilot"|"released";enabled:boolean};
export type PlatformLaunchFeature={feature_key:string;bundle_key:string;rollout_state:"hidden"|"test"|"pilot"|"released";pilot_network_ids:string[];announcement_version:number;updated_at:string};
export type PlatformFamilyTarget={network_id:string;name:string;slug:string;status:string;member_count:number};
export type PlatformRolloutAudit={id:number;feature_key:string;bundle_key:string;previous_state:string;new_state:string;pilot_network_ids:string[];announced:boolean;changed_at:string};
export type FamilyFeatureSetting={feature_key:string;enabled:boolean};
export type FeatureAnnouncement={feature_key:string;announcement_version:number;rollout_state:"hidden"|"test"|"pilot"|"released";updated_at:string};
export type PlatformOwnerRow={user_id:string;email:string|null;created_at:string;is_me:boolean};
export type PlatformOwnerAuditRow={id:string;actor_email:string|null;target_email:string|null;action:"added"|"removed";created_at:string};
export type FamilyCreationRequest={id:string;name:string;status:"pending"|"approved"|"rejected";decision_note:string|null;created_at:string;reviewed_at:string|null;network_id:string|null};
export type PlatformFamilyCreationRequest=FamilyCreationRequest&{requester_user_id:string;requester_email:string|null;description:string};
export async function fetchEffectivePlatformFeatures():Promise<PlatformFeatureRow[]>{
  if(!supabase)return [];
  const {data,error}=await supabase.rpc("get_effective_platform_features");
  if(error)throw error;
  return (data||[]) as PlatformFeatureRow[];
}
export async function fetchPlatformLaunchConsole():Promise<PlatformLaunchFeature[]>{
  if(!supabase)return [];
  const {data,error}=await supabase.rpc("get_platform_launch_console");
  if(error)throw error;
  return (data||[]) as PlatformLaunchFeature[];
}
export async function fetchPlatformFamilyTargets():Promise<PlatformFamilyTarget[]>{
  if(!supabase)return [];
  const {data,error}=await supabase.rpc("get_platform_family_targets");
  if(error)throw error;
  return (data||[]).map((row:any)=>({...row,member_count:Number(row.member_count||0)})) as PlatformFamilyTarget[];
}
export async function fetchPlatformRolloutAudit(limit=30):Promise<PlatformRolloutAudit[]>{
  if(!supabase)return [];
  const {data,error}=await supabase.rpc("get_platform_rollout_audit",{p_limit:limit});
  if(error)throw error;
  return (data||[]).map((row:any)=>({...row,id:Number(row.id)})) as PlatformRolloutAudit[];
}
export async function setPlatformFeatureRollout(featureKey:string,rolloutState:"hidden"|"test"|"pilot"|"released",pilotNetworkIds:string[]=[],announce=false){
  if(!supabase)return;
  const {error}=await supabase.rpc("set_platform_feature_rollout",{p_feature_key:featureKey,p_rollout_state:rolloutState,p_pilot_network_ids:pilotNetworkIds,p_announce:announce});
  if(error)throw error;
}
export async function setPlatformBundleRollout(bundleKey:string,rolloutState:"hidden"|"test"|"pilot"|"released",pilotNetworkIds:string[]=[],announce=false){
  if(!supabase)return 0;
  const {data,error}=await supabase.rpc("set_platform_bundle_rollout",{p_bundle_key:bundleKey,p_rollout_state:rolloutState,p_pilot_network_ids:pilotNetworkIds,p_announce:announce});
  if(error)throw error;
  return Number(data||0);
}
export async function fetchPlatformOwners():Promise<PlatformOwnerRow[]>{
  if(!supabase)return [];
  const {data,error}=await supabase.rpc("get_platform_owners");if(error)throw error;return (data||[]) as PlatformOwnerRow[];
}
export async function addPlatformOwnerByEmail(email:string){if(!supabase)return;const {error}=await supabase.rpc("add_platform_owner_by_email",{p_email:email.trim()});if(error)throw error;}
export async function removePlatformOwner(userId:string){if(!supabase)return;const {error}=await supabase.rpc("remove_platform_owner",{p_user_id:userId});if(error)throw error;}
export async function fetchPlatformOwnerAudit(limit=20):Promise<PlatformOwnerAuditRow[]>{if(!supabase)return[];const {data,error}=await supabase.rpc("get_platform_owner_audit",{p_limit:limit});if(error)throw error;return (data||[]) as PlatformOwnerAuditRow[];}
export async function applyAlphaDay1LaunchPreset(){if(!supabase)return 0;const {data,error}=await supabase.rpc("apply_alpha_day1_launch_preset");if(error)throw error;return Number(data||0);}

export type ClaimableFamilyProfile={network_id:string;family_name:string;member_id:string;member_name:string};
export async function fetchFamilyCreationPolicy():Promise<boolean>{if(!supabase)return false;const {data,error}=await supabase.rpc("get_family_creation_policy");if(error)throw error;return data!==false;}
export async function setFamilyCreationPolicy(approvalRequired:boolean){if(!supabase)return;const {error}=await supabase.rpc("set_family_creation_policy",{p_approval_required:approvalRequired});if(error)throw error;}
export async function joinFamilyByCode(code:string){if(!supabase)throw new Error("Shared mode is required.");const {data,error}=await supabase.rpc("join_family_by_code",{p_code:code});if(error)throw error;return data as string;}
export async function fetchMyClaimableProfiles():Promise<ClaimableFamilyProfile[]>{if(!supabase)return[];const {data,error}=await supabase.rpc("get_my_claimable_profiles");if(error)throw error;return (data||[]) as ClaimableFamilyProfile[];}
export async function claimProfileByVerifiedEmail(memberId:string){if(!supabase)throw new Error("Shared mode is required.");const {data,error}=await supabase.rpc("claim_profile_by_verified_email",{p_member_id:memberId});if(error)throw error;return data as string;}
export async function getOrCreateFamilyJoinCode(){if(!supabase)return"";const {data,error}=await supabase.rpc("get_or_create_family_join_code");if(error)throw error;return String(data||"");}
export async function regenerateFamilyJoinCode(){if(!supabase)return"";const {data,error}=await supabase.rpc("regenerate_family_join_code");if(error)throw error;return String(data||"");}
export async function requestFamilyCreation(name:string,description=""){if(!supabase)throw new Error("Shared mode is required.");const {data,error}=await supabase.rpc("request_family_creation",{p_name:name,p_description:description});if(error)throw error;return data as string;}
export async function fetchMyFamilyCreationRequests():Promise<FamilyCreationRequest[]>{if(!supabase)return[];const {data,error}=await supabase.rpc("get_my_family_creation_requests");if(error)throw error;return (data||[]) as FamilyCreationRequest[];}
export async function fetchPlatformFamilyCreationRequests():Promise<PlatformFamilyCreationRequest[]>{if(!supabase)return[];const {data,error}=await supabase.rpc("get_platform_family_creation_requests");if(error)throw error;return (data||[]) as PlatformFamilyCreationRequest[];}
export async function reviewFamilyCreationRequest(requestId:string,action:"approve"|"reject",note=""){if(!supabase)return null;const {data,error}=await supabase.rpc("review_family_creation_request",{p_request_id:requestId,p_action:action,p_note:note||null});if(error)throw error;return data as string|null;}
export async function fetchFamilyFeatureSettings():Promise<FamilyFeatureSetting[]>{
  if(!supabase)return [];
  const {data,error}=await supabase.rpc("get_family_feature_settings");
  if(error)throw error;
  return (data||[]) as FamilyFeatureSetting[];
}
export async function setFamilyFeatureSetting(featureKey:string,enabled:boolean){
  if(!supabase)return;
  const {error}=await supabase.rpc("set_family_feature_setting",{p_feature_key:featureKey,p_enabled:enabled});
  if(error)throw error;
}
export async function fetchMyFeatureAnnouncements():Promise<FeatureAnnouncement[]>{
  if(!supabase)return [];
  const {data,error}=await supabase.rpc("get_my_feature_announcements");
  if(error)throw error;
  return (data||[]) as FeatureAnnouncement[];
}
export async function markFeatureAnnouncementSeen(featureKey:string,version:number){
  if(!supabase)return;
  const {error}=await supabase.rpc("mark_feature_announcement_seen",{p_feature_key:featureKey,p_announcement_version:version});
  if(error)throw error;
}
export async function setMyExperienceLevel(level:"simple"|"connected"|"explorer"){
  if(!supabase)return;
  const {error}=await supabase.rpc("set_my_experience_level",{p_level:level});
  if(error)throw error;
}

export type NetworkMembership = { network_id:string; name:string; slug:string; role:"owner"|"admin"|"member"; status:string; storage_limit_bytes:number; photo_upload_enabled:boolean; photo_max_bytes:number; is_active:boolean; member_id?:string|null };

export async function fetchMyNetworks(): Promise<NetworkMembership[]> {
  if (!supabase) return [];
  const {data,error}=await supabase.rpc("get_my_networks");
  if(error) throw error;
  return (data||[]) as NetworkMembership[];
}
export type FamilyAdminSummary={member_profiles:number;claimed_profiles:number;active_invitations:number;admin_count:number;media_usage_bytes:number;storage_limit_bytes:number;photo_max_bytes:number};
export type FamilyMembershipRow={user_id:string;role:"owner"|"admin"|"member";status:string;member_id?:string|null;display_name?:string|null;email?:string|null;member_name?:string|null};
export async function fetchFamilyAdminSummary():Promise<FamilyAdminSummary|null>{if(!supabase)return null;const {data,error}=await supabase.rpc("get_family_admin_summary");if(error)throw error;return (data||[])[0]||null;}
export async function fetchFamilyMemberships():Promise<FamilyMembershipRow[]>{if(!supabase)return[];const {data,error}=await supabase.rpc("get_family_memberships");if(error)throw error;return (data||[]) as FamilyMembershipRow[];}
export async function setFamilyMemberRole(userId:string,role:"admin"|"member"){if(!supabase)return;const {error}=await supabase.rpc("set_family_member_role",{p_user_id:userId,p_role:role});if(error)throw error;}
export async function setActiveNetwork(networkId:string){
  if(!supabase) return;
  const {error}=await supabase.rpc("set_active_network",{p_network_id:networkId});
  if(error) throw error;
}
export async function createFamily(name:string,slug?:string,description=""){if(!supabase)throw new Error("Shared mode is required.");const {data,error}=await supabase.rpc("create_family",{p_name:name,p_slug:slug||null,p_description:description});if(error)throw error;return data as string;}
export async function fetchNetworkSettings(): Promise<NetworkSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("network_settings")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if(!data) return null;
  const memberships=await fetchMyNetworks();
  const active=memberships.find(x=>x.is_active);
  return {...data,network_id:data.network_id||active?.network_id,slug:active?.slug,membership_role:active?.role};
}
export async function saveNetworkSettings(settings: NetworkSettings) {
  if (!supabase) return;
  const { error } = await supabase.rpc("save_network_settings", {
    p_network_id: settings.network_id || null,
    p_name: settings.name,
    p_description: settings.description || "",
    p_entity_label: settings.entity_label ?? "Member",
    p_entity_label_plural: settings.entity_label_plural ?? "Members",
    p_level_label: settings.level_label ?? "Generation",
    p_level_label_plural: settings.level_label_plural ?? "Generations",
    p_parent_label: settings.parent_label ?? "Parent",
    p_child_label: settings.child_label ?? "Child",
    p_peer_label: settings.peer_label ?? "Spouse",
    p_network_template: settings.network_template ?? "family",
    p_self_edit_mode: settings.self_edit_mode ?? "review",
    p_family_milestones_enabled: settings.family_milestones_enabled ?? true,
    p_photo_upload_enabled: settings.photo_upload_enabled ?? false,
  });
  if (error) throw error;
}

export async function fetchRemoteState(
  role: "member" | "admin" = "member",
): Promise<{
  members: Member[];
  relationships: Relationship[];
  submissions: Submission[];
} | null> {
  if (!supabase) return null;
  const [m, r, s] = await Promise.all([
    supabase.rpc("get_visible_family_members"),
    supabase.from("family_relationships").select("*"),
    supabase
      .from("profile_submissions")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);
  if (m.error) throw m.error;
  if (r.error) throw r.error;
  if (s.error) throw s.error;
  const members = (await resolveSignedUrls(
    (m.data || []).map(mapMember),
    "profile-photos",
  )) as Member[];
  return {
    members,
    relationships: (r.data || []).map(mapRelationship),
    submissions: (s.data || []) as Submission[],
  };
}
export async function fetchGovernance() {
  if (!supabase) return { changeRequests: [], auditLog: [] };
  const [requests, audit] = await Promise.all([
    supabase
      .from("change_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (requests.error) throw requests.error;
  if (audit.error) throw audit.error;
  return {
    changeRequests: (requests.data || []).map(mapChangeRequest),
    auditLog: (audit.data || []).map(mapAudit),
  };
}
export async function upsertMembers(members: Member[]) {
  if (!supabase) return;
  const payload = members.map((m) => ({
    id: m.id,
    full_name: m.full_name,
    date_of_birth: m.date_of_birth || null,
    date_of_death: m.date_of_death || null,
    generation_level: m.generation_level,
    profession: m.profession || null,
    city: m.city || null,
    country: m.country || "India",
    photo_url: m.photo_url || "",
    bio: m.bio || "",
    phone: m.phone || null,
    email: m.email || null,
    latitude: m.latitude ?? null,
    longitude: m.longitude ?? null,
    profile_status: m.profile_status,
    profile_visibility: m.profile_visibility || "member",
    contact_visibility: m.contact_visibility || "admin",
  }));
  const { error } = await supabase
    .from("family_members")
    .upsert(payload, { onConflict: "id" });
  if (error) throw error;
}
export async function replaceRelationships(rs: Relationship[]) {
  if (!supabase) return;
  if (rs.length) {
    const normalized = rs.map((r) =>
      r.relationship_type === "spouse" && r.person_id > r.related_person_id
        ? {
            ...r,
            person_id: r.related_person_id,
            related_person_id: r.person_id,
          }
        : r,
    );
    const { error } = await supabase.from("family_relationships").upsert(
      normalized.map((r) => ({
        id: r.id,
        person_id: r.person_id,
        related_person_id: r.related_person_id,
        relationship_type: r.relationship_type,
      })),
      { onConflict: "person_id,related_person_id,relationship_type" },
    );
    if (error) throw error;
  }
}
export async function createSubmission(s: Submission) {
  if (!supabase) return;
  const { error } = await supabase.rpc("submit_profile_change", {
    p_submission_id: s.id,
    p_member_id: s.member_id || null,
    p_full_name: s.full_name,
    p_profession: s.profession || null,
    p_city: s.city || null,
    p_country: s.country || null,
    p_bio: s.bio || null,
    p_phone: s.phone || null,
    p_email: s.email || null,
    p_photo_url: s.photo_url || null,
    p_profile_visibility: s.profile_visibility || "member",
    p_contact_visibility: s.contact_visibility || "admin",
    p_avatar_style: s.avatar_style || "initials",
    p_facebook_url: s.facebook_url || null, p_facebook_public: !!s.facebook_public,
    p_instagram_url: s.instagram_url || null, p_instagram_public: !!s.instagram_public,
    p_other_social_url: s.other_social_url || null, p_other_social_label: s.other_social_label || null, p_other_social_public: !!s.other_social_public,
  });
  if (error) throw error;
}
export async function createChangeRequest(input: {
  action: ChangeRequest["action"];
  target_member_id?: string;
  payload: Record<string, unknown>;
}) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("create_change_request", {
    p_action: input.action,
    p_target_member_id: input.target_member_id || null,
    p_payload: input.payload,
  });
  if (error) throw error;
  return data;
}
export async function updateChangeRequest(
  id: string,
  status: ChangeRequest["status"],
  reviewNote = "",
) {
  if (!supabase) return;
  const { data, error } = await supabase.rpc("review_change_request", {
    p_request_id: id,
    p_status: status,
    p_review_note: reviewNote || null,
  });
  if (error) throw error;
  return data;
}
export async function logAudit(
  action: string,
  details: Record<string, unknown> = {},
) {
  if (!supabase) return;
  const { error } = await supabase.rpc("log_audit_event", {
    p_action: action,
    p_details: details,
  });
  if (error) throw error;
}
export async function updateSubmission(
  id: string,
  status: "approved" | "rejected",
) {
  if (!supabase) return;
  const { error } = await supabase
    .from("profile_submissions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  await logAudit(
    status === "approved"
      ? "profile_submission_approved"
      : "profile_submission_rejected",
    { submission_id: id },
  );
}
export async function updateMember(id: string, patch: Partial<Member>) {
  if (!supabase) return;
  const { error } = await supabase
    .from("family_members")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
  await logAudit("member_updated", {
    member_id: id,
    fields: Object.keys(patch),
  });
}
export async function addRelationship(r: Relationship) {
  if (!supabase) return;
  const x =
    r.relationship_type === "spouse" && r.person_id > r.related_person_id
      ? { ...r, person_id: r.related_person_id, related_person_id: r.person_id }
      : r;
  const { error } = await supabase
    .from("family_relationships")
    .upsert(
      {
        id: x.id,
        person_id: x.person_id,
        related_person_id: x.related_person_id,
        relationship_type: x.relationship_type,
      },
      { onConflict: "person_id,related_person_id,relationship_type" },
    );
  if (error) throw error;
  await logAudit("relationship_added", {
    relationship_id: x.id,
    person_id: x.person_id,
    related_person_id: x.related_person_id,
    relationship_type: x.relationship_type,
  });
}
export async function deleteRelationship(id: string) {
  if (!supabase) return;
  const { data, error: readError } = await supabase
    .from("family_relationships")
    .select("person_id,related_person_id,relationship_type")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw readError;
  const { error } = await supabase
    .from("family_relationships")
    .delete()
    .eq("id", id);
  if (error) throw error;
  await logAudit("relationship_removed", {
    relationship_id: id,
    relationship: data || null,
  });
}

export async function createInvitation(
  memberId: string,
  expiresDays: number,
): Promise<string> {
  if (!supabase) throw new Error("Shared mode is required.");
  const token =
    globalThis.crypto?.randomUUID?.().replaceAll("-", "") +
    Math.random().toString(36).slice(2, 18);
  const { error } = await supabase.rpc("create_member_invitation", {
    p_member_id: memberId,
    p_token: token,
    p_expires_days: expiresDays,
  });
  if (error) throw error;
  return token;
}

export async function acceptInvitation(token: string) {
  if (!supabase) throw new Error("Shared mode is required.");
  const { error } = await supabase.rpc("accept_member_invitation", {
    p_token: token,
  });
  if (error) throw error;
}

const strongToken = () => {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, x => x.toString(16).padStart(2, "0")).join("");
};

export async function createBulkInvitations(items: {member_id:string;channel:string;recipient_hint?:string}[], expiresDays=7) {
  if (!supabase) throw new Error("Shared mode is required.");
  const payload = items.map(item => ({...item, token: strongToken()}));
  const {data,error}=await supabase.rpc("create_bulk_member_invitations",{p_items:payload,p_expires_days:expiresDays});
  if(error)throw error;
  return (data || []) as {invitation_id:string;member_id:string;token:string}[];
}
export async function fetchInvitations():Promise<MemberInvitation[]> {
  if(!supabase)return [];
  const {data,error}=await supabase.rpc("get_member_invitations");
  if(error)throw error; return (data||[]) as MemberInvitation[];
}
export async function revokeInvitation(id:string){if(!supabase)return;const {error}=await supabase.rpc("revoke_member_invitation",{p_invitation_id:id});if(error)throw error;}
export async function resendInvitation(id:string,days=7){if(!supabase)throw new Error("Shared mode is required.");const token=strongToken();const {error}=await supabase.rpc("resend_member_invitation",{p_invitation_id:id,p_token:token,p_expires_days:days});if(error)throw error;return token;}
export async function fetchInvitationPreview(token:string){if(!supabase)return null;const {data,error}=await supabase.rpc("get_invitation_preview",{p_token:token});if(error)throw error;return (data||[])[0]||null;}

export async function fetchContributionSuggestions(status="open"):Promise<ContributionSuggestion[]>{
  if(!supabase)return []; const refreshed=await supabase.rpc("refresh_contribution_suggestions");if(refreshed.error)throw refreshed.error;
  const {data,error}=await supabase.rpc("get_contribution_suggestions",{p_status:status});if(error)throw error;return (data||[]) as ContributionSuggestion[];
}
export async function actOnContributionSuggestion(id:string,action:"accepted"|"dismissed"|"resolved"){
  if(!supabase)return;const {error}=await supabase.rpc("act_on_contribution_suggestion",{p_suggestion_id:id,p_action:action});if(error)throw error;
}
export async function fetchCommunityGroups():Promise<CommunityGroup[]>{if(!supabase)return [];const {data,error}=await supabase.from("community_groups").select("*,members:community_group_members(member_id)").order("name");if(error)throw error;return (data||[]) as CommunityGroup[];}
export async function createCommunityGroup(input:{name:string;description?:string;group_type:string;member_ids:string[]}){if(!supabase)return;const {data,error}=await supabase.from("community_groups").insert({name:input.name,description:input.description||null,group_type:input.group_type}).select("id").single();if(error)throw error;if(input.member_ids.length){const x=await supabase.from("community_group_members").insert(input.member_ids.map(member_id=>({group_id:data.id,member_id})));if(x.error)throw x.error;}return data.id;}
export async function fetchCommunityEvents():Promise<CommunityEvent[]>{if(!supabase)return [];const {data,error}=await supabase.rpc("get_community_events");if(error)throw error;return (data||[]).map((x:any)=>({...x,going:Number(x.going),interested:Number(x.interested),guest_count:Number(x.guest_count)}));}
export async function createCommunityEvent(input:{group_id?:string;title:string;description?:string;event_at?:string;location?:string;status:string}){if(!supabase)return;const {error}=await supabase.from("community_events").insert({title:input.title,description:input.description||null,event_at:input.event_at||null,location:input.location||null,status:input.status,group_id:input.group_id||null,created_by:(await supabase.auth.getUser()).data.user?.id});if(error)throw error;}
export async function respondToCommunityEvent(id:string,response:string,guestCount=0){if(!supabase)return;const {error}=await supabase.rpc("respond_to_community_event",{p_event_id:id,p_response:response,p_guest_count:guestCount});if(error)throw error;}
export async function fetchParticipationMetrics():Promise<ParticipationMetrics|null>{if(!supabase)return null;const {data,error}=await supabase.rpc("get_participation_metrics");if(error)throw error;return data as ParticipationMetrics;}
export async function trackPublicParticipation(eventType:string,memberId?:string,channel?:string){if(!supabase)return;let session=localStorage.getItem("network-public-session");if(!session){session=strongToken();localStorage.setItem("network-public-session",session);}await supabase.rpc("track_public_participation",{p_event_type:eventType,p_public_member_id:memberId||null,p_channel:channel||null,p_session_token:session});}

export async function fetchLifeEvents(memberId: string): Promise<LifeEvent[]> {
  if (!supabase || !isUuidValue(memberId)) return [];
  const { data, error } = await supabase.rpc("get_member_life_events", {
    p_member_id: memberId,
  });
  if (error) throw error;
  return (data || []).map(mapLifeEvent);
}
export async function createLifeEvent(
  input: Omit<LifeEvent, "id" | "created_at" | "updated_at" | "created_by">,
): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("create_member_life_event", {
    p_member_id: input.member_id,
    p_event_type: input.event_type,
    p_title: input.title,
    p_event_date: input.event_date || null,
    p_location: input.location || null,
    p_description: input.description || null,
    p_visibility: input.visibility,
  });
  if (error) throw error;
  return data;
}
export async function updateLifeEvent(
  id: string,
  input: Omit<
    LifeEvent,
    "id" | "member_id" | "created_at" | "updated_at" | "created_by"
  >,
) {
  if (!supabase) return;
  const { error } = await supabase.rpc("update_member_life_event", {
    p_event_id: id,
    p_event_type: input.event_type,
    p_title: input.title,
    p_event_date: input.event_date || null,
    p_location: input.location || null,
    p_description: input.description || null,
    p_visibility: input.visibility,
  });
  if (error) throw error;
}
export async function deleteLifeEvent(id: string) {
  if (!supabase) return;
  const { error } = await supabase.rpc("delete_member_life_event", {
    p_event_id: id,
  });
  if (error) throw error;
}

export async function fetchMemories(memberId?: string): Promise<Memory[]> {
  if (!supabase) return [];
  if (memberId && !isUuidValue(memberId)) return [];
  const q = supabase.rpc("get_memories", { p_member_id: memberId || null });
  const { data, error } = await q;
  if (error) throw error;
  const rows=await resolveSignedUrls((data || []) as Memory[], "community-media");
  if(rows.length){const links=await supabase.rpc("get_memory_people",{p_memory_ids:rows.map(x=>x.id)});if(!links.error){const by=new Map<string,string[]>();for(const x of links.data||[]){by.set(x.memory_id,[...(by.get(x.memory_id)||[]),x.member_id])}for(const row of rows)row.related_member_ids=by.get(row.id)||[];}}
  return rows;
}
export async function createMemory(
  input: Omit<Memory, "id" | "created_at" | "created_by">,
): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("create_memory", {
    p_member_id: input.member_id || null,
    p_title: input.title,
    p_story: input.story || null,
    p_photo_url: input.photo_url || null,
    p_visibility: input.visibility,
  });
  if (error) throw error;
  if (data && input.related_member_ids?.length) {
    const { error: linkError } = await supabase.rpc("set_memory_people", { p_memory_id: data, p_member_ids: input.related_member_ids });
    if (linkError) throw linkError;
  }
  return data;
}
export async function deleteMemory(id: string) {
  if (!supabase) return;
  const { error } = await supabase.rpc("delete_memory", { p_memory_id: id });
  if (error) throw error;
}
export async function fetchNotifications(): Promise<Notification[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_my_notifications");
  if (error) throw error;
  return (data || []) as Notification[];
}
export async function markNotificationRead(id: string) {
  if (!supabase) return;
  const { error } = await supabase.rpc("mark_notification_read", {
    p_notification_id: id,
  });
  if (error) throw error;
}

export async function searchRemoteMembers(input: {
  query?: string;
  profession?: string;
  city?: string;
  generation?: number;
  lifeStatus?: "all" | "living" | "deceased";
  limit?: number;
  offset?: number;
}): Promise<Member[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("search_family_members", {
    p_query: input.query || null,
    p_profession: input.profession || null,
    p_city: input.city || null,
    p_generation: input.generation ?? null,
    p_life_status: input.lifeStatus || "all",
    p_limit: input.limit || 100,
    p_offset: input.offset || 0,
  });
  if (error) throw error;
  return (data || []).map(mapMember);
}
export async function fetchNetworkAnalytics(): Promise<NetworkAnalytics | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_network_analytics");
  if (error) throw error;
  return data as NetworkAnalytics;
}
export async function fetchGeographySummary(): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_geography_summary");
  if (error) throw error;
  return (data || []) as any[];
}
export async function fetchNetworkTimeline(): Promise<LifeEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_network_timeline", {
    p_limit: 300,
    p_offset: 0,
  });
  if (error) throw error;
  return (data || []).map(mapLifeEvent);
}
export async function updateOwnProfileSafeFields(input: Partial<Member>) {
  if (!supabase) return;
  const { error } = await supabase.rpc("update_own_profile_safe_fields", {
    p_profession: input.profession ?? null,
    p_city: input.city ?? null,
    p_country: input.country ?? null,
    p_bio: input.bio ?? null,
    p_phone: input.phone ?? null,
    p_email: input.email ?? null,
    p_photo_url: input.photo_url ?? null,
    p_avatar_style: input.avatar_style ?? "initials",
    p_facebook_url: input.facebook_url ?? null, p_facebook_public: !!input.facebook_public,
    p_instagram_url: input.instagram_url ?? null, p_instagram_public: !!input.instagram_public,
    p_other_social_url: input.other_social_url ?? null, p_other_social_label: input.other_social_label ?? null, p_other_social_public: !!input.other_social_public,
  });
  if (error) throw error;
}

export type NotificationPreferences={
  digest:"off"|"weekly"|"monthly";
  special_days:boolean;
  memories:boolean;
  gatherings:boolean;
};

export async function fetchNotificationPreferences():Promise<NotificationPreferences>{
  if(!supabase)return {digest:"weekly",special_days:true,memories:false,gatherings:true};
  const {data,error}=await supabase.rpc("get_my_notification_preferences");
  if(error)throw error;
  const value=data as Partial<NotificationPreferences>|null;
  const digest:NotificationPreferences["digest"]=value?.digest==="off"||value?.digest==="monthly"?value.digest:"weekly";
  return {
    digest,
    special_days:value?.special_days!==false,
    memories:value?.memories===true,
    gatherings:value?.gatherings!==false,
  };
}
export async function saveNotificationPreferences(input:NotificationPreferences){
  if(!supabase)return;
  const {error}=await supabase.rpc("save_my_notification_preferences",{p_digest:input.digest,p_special_days:input.special_days,p_memories:input.memories,p_gatherings:input.gatherings});
  if(error)throw error;
}
export async function fetchCommunityEventAttendees(eventId:string){
  if(!supabase)return [] as {member_id?:string;full_name:string;response:string;guest_count:number}[];
  const {data,error}=await supabase.rpc("get_community_event_attendees",{p_event_id:eventId}); if(error)throw error; return (data||[]) as {member_id?:string;full_name:string;response:string;guest_count:number}[];
}
export async function linkMemoryToEvent(memoryId:string,eventId:string){if(!supabase)return;const {error}=await supabase.rpc("link_memory_to_event",{p_memory_id:memoryId,p_event_id:eventId});if(error)throw error;}
