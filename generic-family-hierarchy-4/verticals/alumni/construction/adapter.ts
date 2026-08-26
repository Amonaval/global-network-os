import type {ConstructionAdapter,ConstructionCommitPlan,ConstructionDashboard,ConstructionPreview,ConstructionSubmissionResult,ConstructionValidationResult,ConstructionCommitResult,MatchDecision} from "../../../core/construction/contracts";
import type {AlumniConstructionSubmission} from "./types";
import {importAlumniProfiles} from "../data/remote";
let staged:AlumniConstructionSubmission|undefined;
export const ALUMNI_CONSTRUCTION_ADAPTER:ConstructionAdapter<AlumniConstructionSubmission>={
 verticalKind:"alumni",availability:"ready",
 async createSession(){return "alumni-local-import";},async createAccess(){return "alumni-local-import";},async previewAccess():Promise<ConstructionPreview>{return {networkName:"Alumni Network",title:"Alumni import preview",status:"review",alreadySubmitted:!!staged,expiresAt:new Date(Date.now()+3600000).toISOString()};},
 async submit(_token,submission):Promise<ConstructionSubmissionResult>{staged=submission;return {entitiesReported:submission.entities.length,edgesReported:submission.edges.length,message:"Alumni rows staged for preview."};},
 async getDashboard():Promise<ConstructionDashboard>{return {sessions:[],accesses:[],entities:[],edges:[],candidates:[],decisions:[],conflicts:[],metrics:{accessesOpened:0,submissions:staged?1:0,entitiesReported:staged?.entities.length||0,commits:0}};},async decideMatch(_candidateId:string,_decision:MatchDecision){return;},
 async validateAccess():Promise<ConstructionValidationResult>{const issues=(staged?.entities||[]).filter(e=>!e.displayName.trim()).map(e=>({code:"missing_name",severity:"error" as const,message:"Full name is required.",entityId:e.clientRef}));return {valid:issues.length===0,blockingIssues:issues.length,issues};},
 async buildCommitPlan():Promise<ConstructionCommitPlan>{const validation=await this.validateAccess("alumni-local-import");return {accessId:"alumni-local-import",createEntityCount:staged?.entities.length||0,reuseEntityCount:0,edgeCount:staged?.edges.length||0,validation};},
 async commitAccess():Promise<ConstructionCommitResult>{if(!staged)throw new Error("No Alumni import is staged.");const validation=await this.validateAccess("alumni-local-import");if(!validation.valid)throw new Error("Fix import validation errors first.");const rows=staged.entities.map(e=>({full_name:e.displayName,email:String(e.attributes?.email||""),graduation_year:e.attributes?.graduationYear as number|undefined,program:e.attributes?.program as string|undefined,department:e.attributes?.department as string|undefined,city:e.attributes?.city as string|undefined}));const result=await importAlumniProfiles(rows);staged=undefined;return {createdEntities:result.inserted,matchedEntities:result.updated,createdEdges:0};},
 async revokeAccess(){staged=undefined;}
};
