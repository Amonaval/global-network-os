/**
 * Compatibility facade for historical Family participation types.
 * Shared contracts live in core/participation; Family transport shapes live in the Family vertical.
 */
export type {
  MemberInvitation,
  ContributionSuggestion,
  ParticipationMetrics,
} from "../verticals/family/participation/types";

// Community groups/events remain Family/community semantics for now and are intentionally not generalized in G2.
export type CommunityGroup = {id:string;name:string;description?:string;group_type:"branch"|"household"|"circle"|"other";members?:{member_id:string}[]};
export type CommunityEvent = {id:string;group_id?:string;group_name?:string;title:string;description?:string;event_at?:string;location?:string;status:"planning"|"open"|"closed"|"cancelled";going:number;interested:number;my_response?:"going"|"interested"|"not_going";guest_count:number};
