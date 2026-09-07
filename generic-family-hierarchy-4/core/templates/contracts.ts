import type {NetworkDimensionDefinition,NetworkProjectionDefinition} from "../network-os/contracts";

export type CapabilityId="profiles"|"affiliation"|"explorer"|"discovery"|"groups"|"events"|"memories"|"maps"|"milestones"|"contributions"|"connection-paths"|"notifications"|"construction"|"media"|"notices"|"complaints"|"vendors"|"amenities"|"bookings"|"maintenance"|"billing"|"dues"|"finance"|"governance"|"meetings"|"resolutions"|"polls"|"documents"|"security"|"visitors"|"staff"|"approvals"|"assets"|"compliance"|"emergency"|"claiming"|"invitations"|"guide"|"playground"|"launch-control";
export type RelationshipDefinition={key:string;label:string;direction:"directed"|"symmetric";description?:string;inverseLabel?:string;fromKinds?:readonly string[];toKinds?:readonly string[];allowSelf?:boolean;evidenceRequired?:boolean};
export type TemplateProofStatus="active"|"proof"|"future";
export type VerticalTemplateDefinition={
 id:string;
 label:string;
 status:TemplateProofStatus;
 primaryEntityKind:string;
 entityKinds:string[];
 dimensions:NetworkDimensionDefinition[];
 relationships:RelationshipDefinition[];
 projections:NetworkProjectionDefinition[];
 capabilities:CapabilityId[];
 terminology?:Record<string,string>;
 notes?:string[];
};
