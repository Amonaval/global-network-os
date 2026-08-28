import type {NetworkAffiliatedEntity,NetworkActivity} from "../network-os/contracts";

export type IntelligenceRelationship={id:string;fromEntityId:string;toEntityId:string;fromLabel:string;toLabel:string;relationshipType:string;label:string;metadata?:Record<string,unknown>};
export type IntelligenceVerticalKind="family"|"alumni"|"organization"|"business-trust"|"franchise"|"professional";
export type IntelligenceEvidence={kind:"entity"|"affiliation"|"relationship"|"activity"|"health";label:string;detail:string;entityId?:string;relationshipId?:string;activityId?:string};
export type IntelligenceInsight={id:string;severity:"info"|"opportunity"|"attention";title:string;summary:string;reason:string;actionLabel:string;actionTarget:"intelligence"|"explorer"|"directory"|"community"|"connections"|"contribute";evidence:IntelligenceEvidence[]};
export type IntelligenceAnswer={question:string;headline:string;answer:string;confidence:"high"|"medium"|"low";evidence:IntelligenceEvidence[];suggestions:string[];matchedEntityIds:string[]};
export type IntelligenceHealth={completeness:number;isolatedEntityIds:string[];highConnectivity:{entityId:string;degree:number}[];missingLinkCandidates:{fromEntityId:string;toEntityId:string;sharedContext:string[];score:number}[]};
export type IntelligenceDataset={entities:readonly NetworkAffiliatedEntity[];relationships:readonly IntelligenceRelationship[];activities?:readonly NetworkActivity[]};
