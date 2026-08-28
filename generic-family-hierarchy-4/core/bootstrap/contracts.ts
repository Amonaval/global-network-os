/** [M3] Institution-first activation reuses existing import, claiming, membership and delegated-admin capabilities. */
export type InstitutionalBootstrapSnapshot={entityCount:number;activeMemberCount:number;claimedMemberCount:number;adminCount:number};
export type BootstrapStageKey="seed"|"invite"|"claim"|"delegate"|"enrich";
export type BootstrapStage={key:BootstrapStageKey;complete:boolean;progress:number};
