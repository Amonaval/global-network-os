export type ShowcaseNetwork={id:string;name:string;kind:string;size:number;city:string};
export type ShowcasePerson={id:string;name:string;primaryNetworkId:string;city:string;expertise:string[];claimed:boolean;memberships:string[]};
export type ShowcaseBridge={id:string;from:string;to:string;relationship:string;discovery:boolean;introductions:boolean;pathTraversal:boolean};
export type ShowcaseScenario={id:string;emoji:string;title:string;hook:string;sourceNetworkId:string;query:string;targetPersonId:string;targetNetworkId:string;path:string[];pathDepth:1|2;whyWow:string;request:string;outcome:string};
export type M7BShowcaseUniverse={version:string;synthetic:true;peopleCount:number;networks:ShowcaseNetwork[];people:ShowcasePerson[];bridges:ShowcaseBridge[];scenarios:ShowcaseScenario[]};
