import type {NetworkVerticalKind} from "../verticals/contracts";

export type ContextualGuideRole="owner"|"admin"|"member";
export type ContextualGuideTarget="home"|"explorer"|"directory"|"community"|"connections"|"contribute"|"admin"|"guide"|"launch";
export type ContextualGuideTask={
 id:string;
 titleToken:string;
 descriptionToken:string;
 target:ContextualGuideTarget;
 minimumRole:ContextualGuideRole;
};
export type ContextualGuideDefinition={kind:NetworkVerticalKind;tasks:readonly ContextualGuideTask[]};

const memberTasks:readonly ContextualGuideTask[]=[
 {id:"explore",titleToken:"XP7GuideExploreTxt",descriptionToken:"XP7GuideExploreDescTxt",target:"explorer",minimumRole:"member"},
 {id:"connections",titleToken:"XP7GuideConnectionsTxt",descriptionToken:"XP7GuideConnectionsDescTxt",target:"connections",minimumRole:"member"},
 {id:"community",titleToken:"XP7GuideCommunityTxt",descriptionToken:"XP7GuideCommunityDescTxt",target:"community",minimumRole:"member"},
];
const adminTasks:readonly ContextualGuideTask[]=[
 {id:"admin",titleToken:"XP7GuideOperateTxt",descriptionToken:"XP7GuideOperateDescTxt",target:"admin",minimumRole:"admin"},
 {id:"contribute",titleToken:"XP7GuideImproveTxt",descriptionToken:"XP7GuideImproveDescTxt",target:"contribute",minimumRole:"admin"},
];
const alumniTasks:readonly ContextualGuideTask[]=[...memberTasks,{id:"admin",titleToken:"XP7GuideOperateTxt",descriptionToken:"XP7GuideOperateDescTxt",target:"admin",minimumRole:"admin"}];
const familyTasks:readonly ContextualGuideTask[]=[...memberTasks,...adminTasks];

export const CONTEXTUAL_GUIDE_REGISTRY:Record<NetworkVerticalKind,ContextualGuideDefinition>={
 family:{kind:"family",tasks:familyTasks},
 alumni:{kind:"alumni",tasks:alumniTasks},
 association:{kind:"association",tasks:[...memberTasks,...adminTasks]},
 "family-association":{kind:"family-association",tasks:[...memberTasks,...adminTasks]},
 "housing-society":{kind:"housing-society",tasks:[...memberTasks,{id:"admin",titleToken:"XP7GuideOperateTxt",descriptionToken:"XP7GuideOperateDescTxt",target:"admin",minimumRole:"admin"}]},
 organization:{kind:"organization",tasks:[...memberTasks,...adminTasks]},
 "business-trust":{kind:"business-trust",tasks:[...memberTasks,...adminTasks]},
 franchise:{kind:"franchise",tasks:[...memberTasks,...adminTasks]},
 professional:{kind:"professional",tasks:[...memberTasks,...adminTasks]},
};

const rank:Record<ContextualGuideRole,number>={member:0,admin:1,owner:2};
export function getContextualGuide(kind:NetworkVerticalKind,role:ContextualGuideRole,isPlatformOwner=false){
 const base=CONTEXTUAL_GUIDE_REGISTRY[kind].tasks.filter(task=>rank[role]>=rank[task.minimumRole]);
 return isPlatformOwner?[...base,{id:"launch",titleToken:"XP7GuideLaunchTxt",descriptionToken:"XP7GuideLaunchDescTxt",target:"launch" as const,minimumRole:"owner" as const}]:base;
}
