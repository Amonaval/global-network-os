import type {NetworkEntityKind} from "../network-os/contracts";
/** [M3] Governed graph is additive. Existing hierarchy/projection models remain valid graph projections. */
export type GraphRelationshipDirection="directed"|"symmetric";
export type GraphRelationshipStatus="confirmed"|"proposed";
export type GraphRelationshipSource="manual"|"import"|"evidence"|"system";
export type GraphRelationshipRule={key:string;label:string;direction:GraphRelationshipDirection;description?:string;inverseLabel?:string;fromKinds?:readonly (NetworkEntityKind|string)[];toKinds?:readonly (NetworkEntityKind|string)[];allowSelf?:boolean;evidenceRequired?:boolean};
export type GraphRelationshipProvenance={source:GraphRelationshipSource;status:GraphRelationshipStatus;confidence?:number;evidenceIds?:string[];createdByLabel?:string};
export type GovernedGraphEdge={id?:string;fromEntityId:string;toEntityId:string;relationshipType:string;metadata:Record<string,unknown>&{governance:GraphRelationshipProvenance}};
export type GraphValidationResult={valid:boolean;reasons:string[]};
