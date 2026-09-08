export const VERTICALS=[
 {kind:'family',label:'Family',context:'QA Family',entityKind:'person',marker:'Family'},
 {kind:'housing-society',label:'Housing Society',context:'QA Residential Community',entityKind:'unit',marker:'Unit'},
 {kind:'family-association',label:'Family Association',context:'QA Community Chapter',entityKind:'family',marker:'Family'},
 {kind:'association',label:'Association',context:'QA Association Chapter',entityKind:'household',marker:'Household'},
 {kind:'alumni',label:'Alumni',context:'QA Institute',entityKind:'alumni',marker:'Alumni'},
 {kind:'organization',label:'Organization',context:'QA Organization',entityKind:'person',marker:'Person'},
 {kind:'business-trust',label:'Business Trust',context:'QA Business Ecosystem',entityKind:'business',marker:'Business'},
 {kind:'franchise',label:'Franchise',context:'QA Franchise',entityKind:'location',marker:'Location'},
 {kind:'professional',label:'Professional',context:'QA Expertise Network',entityKind:'professional',marker:'Professional'}
];
export const ROLE_KEYS=['owner','admin','member','invitee','tenantB'];
export const EXPECTED_SHARED_SURFACES=['home','directory','explorer','connections','community','guide'];
export const ADMIN_SURFACES=['admin'];

// Conservative must-exist runtime navigation. Optional/feature-gated surfaces are still inventoried
// by the crawler, but these surfaces must be present whenever the vertical shell is released.
export const EXPECTED_NAV_BY_KIND={
 family:['home','tree'],
 alumni:['home','explorer','directory','community','connections','guide'],
 'housing-society':['home','directory','complaints','guide'],
 'family-association':['home','me','directory','community','guide'],
 association:['home','me','directory','community','guide'],
 organization:['home','explorer','directory','community','connections','guide'],
 'business-trust':['home','explorer','directory','community','connections','guide'],
 franchise:['home','explorer','directory','community','connections','guide'],
 professional:['home','explorer','directory','community','connections','guide']
};
export function expectedCrawlerTestIds(kind,role){
 const ids=[`qa-vertical-shell-${kind}`,...(EXPECTED_NAV_BY_KIND[kind]||[]).map(x=>`qa-nav-${x}`)];
 if(role==='owner'||role==='admin')ids.push('qa-nav-admin');
 return ids;
}
