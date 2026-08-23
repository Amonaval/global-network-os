export type RelationshipType = "parent" | "child" | "spouse";

export type ProfileVisibility = "public" | "member" | "admin";
export type ContactVisibility = "member" | "admin";

export type Member = {
  id: string;
  full_name: string;
  date_of_birth?: string;
  date_of_death?: string;
  generation_level: number;
  profession?: string;
  city?: string;
  country?: string;
  photo_url?: string;
  avatar_style?: "initials" | "leaf" | "sun" | "sparkles" | "heart" | "person";
  facebook_url?: string;
  facebook_public?: boolean;
  instagram_url?: string;
  instagram_public?: boolean;
  other_social_url?: string;
  other_social_label?: string;
  other_social_public?: boolean;
  bio?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  profile_status: "approved" | "pending" | "disabled";
  gender?: "Male" | "Female" | "Other";
  profile_visibility?: ProfileVisibility;
  contact_visibility?: ContactVisibility;
};

export type Relationship = {
  id: string;
  person_id: string;
  related_person_id: string;
  relationship_type: RelationshipType;
};

export type Submission = {
  submitted_by?: string;
  id: string;
  member_id?: string;
  full_name: string;
  profession?: string;
  city?: string;
  country?: string;
  bio?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  avatar_style?: Member["avatar_style"];
  facebook_url?: string;
  facebook_public?: boolean;
  instagram_url?: string;
  instagram_public?: boolean;
  other_social_url?: string;
  other_social_label?: string;
  other_social_public?: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profile_visibility?: ProfileVisibility;
  contact_visibility?: ContactVisibility;
};

export type LifeEvent = {
  id: string;
  member_id: string;
  event_type: "birth" | "marriage" | "move" | "education" | "career" | "family" | "milestone" | "other";
  title: string;
  event_date?: string;
  location?: string;
  description?: string;
  visibility: ProfileVisibility;
  created_by?: string;
  created_at: string;
  updated_at?: string;
};

export type RelationshipPathStep = { memberId: string; relationship: string; };
export type RelationshipPath = {
  from: Member;
  to: Member;
  memberIds: string[];
  steps: RelationshipPathStep[];
  explanation: string;
  distance: number;
};

export type MemoryReaction = "heart" | "smile" | "pray" | "celebrate";

export type Memory = {
  id: string;
  member_id?: string;
  title: string;
  story?: string;
  photo_url?: string;
  related_member_ids?: string[];
  event_id?: string;
  visibility: ProfileVisibility;
  created_by?: string;
  created_at: string;
  reaction_counts?: Partial<Record<MemoryReaction, number>>;
  my_reaction?: MemoryReaction;
};

export type NotificationPreference = {
  digest: "off" | "weekly" | "monthly";
  special_days: boolean;
  memories: boolean;
  gatherings: boolean;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
  read_at?: string;
  created_at: string;
};

export type ChangeRequestAction =
  | "create_member"
  | "update_member"
  | "add_relationship"
  | "remove_relationship"
  | "import"
  | "other";

export type ChangeRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type ChangeRequest = {
  id: string;
  action: ChangeRequestAction;
  target_member_id?: string;
  submitted_by?: string;
  status: ChangeRequestStatus;
  payload: Record<string, unknown>;
  review_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
};

export type AuditEntry = {
  id: string;
  actor_id?: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};


export type NetworkAnalytics = {
  members: number; living: number; deceased: number; relationships: number; mapped: number; memories: number; life_events: number;
  generations: {generation:number; count:number}[];
  cities: {city:string; country:string; count:number}[];
  professions: {profession:string; count:number}[];
};

export type ValidationIssueSeverity = "error" | "warning";
export type ValidationIssue = {
  severity: ValidationIssueSeverity;
  code: string;
  message: string;
  memberId?: string;
  relationshipId?: string;
};

export type ValidationReport = {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};
