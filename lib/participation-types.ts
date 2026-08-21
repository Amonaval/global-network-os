export type MemberInvitation = {
  id: string; member_id: string; member_name: string;
  status: "active" | "accepted" | "expired" | "revoked";
  expires_at: string; created_at: string; first_opened_at?: string; last_sent_at?: string;
  delivery_channel: "link" | "email" | "whatsapp" | "sms" | "print" | "other";
  recipient_hint?: string; resend_of?: string;
};
export type ContributionSuggestion = {
  id: string; signature: string; member_id?: string;
  kind: "missing_field" | "orphan" | "possible_duplicate" | "incomplete_relationship";
  title: string; detail?: string; action_payload: Record<string, unknown>; priority: number;
  status: "open" | "accepted" | "dismissed" | "resolved"; acted_at?: string; created_at: string;
};
export type CommunityGroup = {id:string;name:string;description?:string;group_type:"branch"|"household"|"circle"|"other";members?:{member_id:string}[]};
export type CommunityEvent = {id:string;group_id?:string;group_name?:string;title:string;description?:string;event_at?:string;location?:string;status:"planning"|"open"|"closed"|"cancelled";going:number;interested:number;my_response?:"going"|"interested"|"not_going";guest_count:number};
export type ParticipationMetrics = {invitations_created:number;invitations_opened:number;invitations_accepted:number;claimed_profiles:number;claimable_profiles:number;contributions:number;activated_members:number;public_views:number;shares:number;returning_members:number;open_suggestions:number;resolved_suggestions:number;event_responses:number;admin_actions:number};
