/**
 * Historical S3-A1 Family transport shapes. These remain Family/Kinship-specific.
 * The compatibility facade at lib/family-intake-types.ts re-exports them unchanged.
 */
export type IntakePersonInput={client_ref:string;full_name:string;date_of_birth?:string;birth_year?:number;gender?:"Male"|"Female"|"Other";city?:string;role_from_anchor?:string;generation_offset:number};
export type IntakeRelationshipInput={from_ref:string;to_ref:string;relationship_type:"parent"|"child"|"spouse";reported_relationship?:string};
export type FamilyIntakePreview={family_name:string;title:string;representative_label?:string|null;status:string;already_submitted:boolean;expires_at:string};
export type FamilyIntakeSessionRow={id:string;title:string;status:string;created_at:string;access_count:number;submitted_count:number;committed_count:number};
export type FamilyIntakeBranchRow={id:string;session_id:string;representative_label?:string|null;status:string;expires_at:string;submitted_at?:string|null;people_count:number;relationship_count:number};
export type FamilyIntakePersonRow={id:string;access_id:string;full_name:string;birth_year?:number|null;gender?:string|null;city?:string|null;role_from_anchor?:string|null;generation_offset:number;status:string;matched_member_id?:string|null;match_confidence?:number|null};
export type FamilyIntakeCandidateRow={id:string;staged_person_id:string;candidate_member_id?:string|null;candidate_staged_person_id?:string|null;candidate_name:string;score:number;confidence_band:"high"|"medium"|"low";status:"open"|"accepted"|"rejected"|"unsure";reasons:Record<string,unknown>};
export type FamilyIntakeConflictRow={id:string;staged_person_id:string;member_id:string;field_name:string;existing_value?:string|null;reported_value?:string|null;status:string};
export type FamilyIntakeDashboard={sessions:FamilyIntakeSessionRow[];branches:FamilyIntakeBranchRow[];people:FamilyIntakePersonRow[];candidates:FamilyIntakeCandidateRow[];conflicts:FamilyIntakeConflictRow[];metrics:{links_opened:number;submissions:number;people_reported:number;branches_committed:number}};
export type FamilyConstructionSubmission={people:IntakePersonInput[];relationships:IntakeRelationshipInput[]};
