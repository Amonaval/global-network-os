import type {NetworkVerticalKind} from "../verticals/contracts";
export type NetworkAdminModuleId="overview"|"members"|"roles"|"invitations"|"claims"|"import"|"privacy"|"features"|"corrections"|"media"|"lifecycle"|"export"|"launch"|"settings";
export type NetworkAdminModule={id:NetworkAdminModuleId;labelToken:string;descriptionToken:string;ownerOnly?:boolean;platformOnly?:boolean};
const base:readonly NetworkAdminModule[]=[
 {id:"overview",labelToken:"XP4AdminOverviewTxt",descriptionToken:"XP4AdminOverviewDescTxt"},
 {id:"members",labelToken:"XP4MembersRolesTxt",descriptionToken:"XP4MembersRolesDescTxt"},
 {id:"invitations",labelToken:"XP4InvitationsClaimsTxt",descriptionToken:"XP4InvitationsClaimsDescTxt"},
 {id:"import",labelToken:"XP4ImportTxt",descriptionToken:"XP4ImportDescTxt"},
 {id:"privacy",labelToken:"XP4PrivacyTxt",descriptionToken:"XP4PrivacyDescTxt"},
 {id:"corrections",labelToken:"XP4CorrectionsTxt",descriptionToken:"XP4CorrectionsDescTxt"},
 {id:"export",labelToken:"XP4ExportTxt",descriptionToken:"XP4ExportDescTxt"},
 {id:"lifecycle",labelToken:"XP4LifecycleTxt",descriptionToken:"XP4LifecycleDescTxt",ownerOnly:true},
 {id:"launch",labelToken:"XP4LaunchTxt",descriptionToken:"XP4LaunchDescTxt",platformOnly:true},
];
export const NETWORK_ADMIN_MODULES:Record<NetworkVerticalKind,readonly NetworkAdminModule[]>={family:base,alumni:base,association:base,"family-association":base,"housing-society":base,organization:base,"business-trust":base,franchise:base,professional:base};
export function getNetworkAdminModules(kind:NetworkVerticalKind,{isOwner,isPlatformOwner}:{isOwner:boolean;isPlatformOwner:boolean}){return NETWORK_ADMIN_MODULES[kind].filter(m=>(!m.ownerOnly||isOwner)&&(!m.platformOnly||isPlatformOwner))}
