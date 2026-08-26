export type NetworkEntityKind="person"|"organization"|"location"|"team"|"project"|"product"|"institution"|"program"|"branch"|"subject"|"account"|"custom";

export type NetworkEntity={
 id:string;
 networkId:string;
 kind:NetworkEntityKind|string;
 label:string;
 externalRef?:string|null;
 ownerUserId?:string|null;
 metadata?:Record<string,unknown>;
};

export type NetworkDimensionDefinition={key:string;label:string;entityKind?:string;description?:string;sortOrder?:number};
export type NetworkDimensionValue={id:string;dimensionKey:string;label:string;valueKey?:string;metadata?:Record<string,unknown>};
export type NetworkAffiliation={entityId:string;dimensionKey:string;valueId:string;valueLabel:string};
export type NetworkProjectionDefinition={key:string;label:string;levels:string[];description?:string;default?:boolean};

export type NetworkAffiliatedEntity={
 entity:NetworkEntity;
 affiliations:Record<string,string[]>;
};

export type ProjectionNode={
 key:string;
 label:string;
 levelKey:string;
 depth:number;
 entityCount:number;
 entityIds:string[];
 children:ProjectionNode[];
};

export type NetworkActivityType="event"|"memory"|"milestone"|"announcement";
export type NetworkActivity={
 id:string;
 networkId?:string;
 type:NetworkActivityType;
 title:string;
 body?:string|null;
 startsAt?:string|null;
 endsAt?:string|null;
 place?:string|null;
 visibility?:"members"|"private";
 createdBy?:string|null;
 metadata?:Record<string,unknown>;
 myRsvp?:"going"|"maybe"|"declined"|null;
 goingCount?:number;
};
